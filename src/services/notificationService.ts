import { ref, computed } from 'vue';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '@/firebaseConfig';
import { toastController } from '@ionic/vue';
import { notificationsOutline } from 'ionicons/icons';

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: any;
  read: boolean;
  carId: string;
  userId: string;
}

const notifications = ref<Notification[]>([]);
const previousStatuses = new Map<string, string>();
let unsubscribeRepairs: (() => void) | null = null;
let unsubscribeNotifications: (() => void) | null = null;

export const useNotificationService = () => {
  const addNotification = async (notif: Omit<Notification, 'id' | 'date' | 'read' | 'userId'>) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "notifications"), {
        ...notif,
        userId: user.uid,
        date: serverTimestamp(),
        read: false
      });
      // Le toast sera affiché via le listener onSnapshot pour être cohérent
    } catch (error) {
      console.error("Erreur lors de l'ajout de la notification:", error);
    }
  };

  const showToast = async (notif: Notification) => {
    const toast = await toastController.create({
      message: `🔔 ${notif.message}`,
      duration: 5000,
      position: 'top',
      color: 'success',
      buttons: [
        {
          side: 'start',
          icon: notificationsOutline,
          handler: () => {
            console.log('Notification cliquée');
          }
        }
      ]
    });
    await toast.present();
  };

  const initFirebaseListener = () => {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        cleanup();
        return;
      }

      // On n'écoute plus les changements de réparations côté mobile pour générer des notifs
      // car c'est maintenant le backend Web qui les insère directement dans Firestore
      // initRepairsListener(user.uid);

      // Écouter uniquement la collection 'notifications' pour l'affichage
      initNotificationsListener(user.uid);
    });
  };

  const initRepairsListener = (userId: string) => {
    if (unsubscribeRepairs) return;

    const q = query(collection(db, "repairs"), where("userId", "==", userId));
    unsubscribeRepairs = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        const data = change.doc.data();
        const id = change.doc.id;
        const currentStatus = data.statut;
        
        if (change.type === 'modified') {
          const prevStatus = previousStatuses.get(id);
          if (prevStatus !== undefined && 
              prevStatus !== currentStatus && 
              (currentStatus === 'Prête' || currentStatus === 'Terminée' || currentStatus === 'Terminé')) {
            
            addNotification({
              title: 'Réparation terminée',
              message: `Votre ${data.modele} est prête !`,
              carId: id
            });
          }
        }
        previousStatuses.set(id, currentStatus);
      });
    });
  };

  const initNotificationsListener = (userId: string) => {
    if (unsubscribeNotifications) return;

    const q = query(
      collection(db, "notifications"), 
      where("userId", "==", userId)
      // orderBy temporairement retiré pour tester si c'est l'index manquant qui bloque
      // orderBy("date", "desc")
    );

    unsubscribeNotifications = onSnapshot(q, (snapshot) => {
      const newNotifications: Notification[] = [];
      
      snapshot.docChanges().forEach(change => {
        const data = change.doc.data();
        const notifDate = data.date?.toDate?.() || data.date || new Date();
        const notif = {
          id: change.doc.id,
          ...data,
          date: notifDate
        } as Notification;

        if (change.type === 'added') {
          // Afficher le toast uniquement pour les nouvelles notifications (pas au chargement initial)
          // On vérifie si le timestamp est très récent (moins de 10 secondes)
          const now = new Date().getTime();
          const notifTime = notifDate instanceof Date ? notifDate.getTime() : now;
          if (now - notifTime < 10000) {
            showToast(notif);
          }
        }
      });

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        newNotifications.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate?.() || data.date || new Date()
        } as Notification);
      });

      // Tri manuel côté client pour éviter le besoin d'un index composite complexe immédiatement
      newNotifications.sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date.getTime() : 0;
        const dateB = b.date instanceof Date ? b.date.getTime() : 0;
        return dateB - dateA;
      });

      notifications.value = newNotifications;
    });
  };

  const cleanup = () => {
    if (unsubscribeRepairs) {
      unsubscribeRepairs();
      unsubscribeRepairs = null;
    }
    if (unsubscribeNotifications) {
      unsubscribeNotifications();
      unsubscribeNotifications = null;
    }
    notifications.value = [];
    previousStatuses.clear();
  };

  const markAllAsRead = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const batch = writeBatch(db);
    notifications.value.filter(n => !n.read).forEach(n => {
      const ref = doc(db, "notifications", n.id);
      batch.update(ref, { read: true });
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error("Erreur lors du marquage des notifications:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (error) {
      console.error("Erreur lors de la suppression de la notification:", error);
    }
  };

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAllAsRead,
    deleteNotification,
    initFirebaseListener
  };
};
