<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Paiements</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Paiements</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Section: Réparations à payer -->
      <div class="section-container">
        <ion-list-header>
          <ion-label>À payer</ion-label>
        </ion-list-header>

        <div v-if="loadingRepairs" class="ion-text-center ion-padding">
          <ion-spinner name="crescent"></ion-spinner>
        </div>

        <div v-else-if="pendingRepairs.length === 0" class="empty-mini-state">
          <p>Aucune réparation en attente de paiement.</p>
        </div>

        <ion-list v-else>
          <ion-item v-for="repair in pendingRepairs" :key="repair.id" class="pending-item">
            <ion-icon slot="start" :icon="carOutline" color="primary"></ion-icon>
            <ion-label>
              <h3>{{ repair.modele }}</h3>
              <p>{{ repair.immatriculation }}</p>
              <div class="payment-info">
                <p class="total-text">Total: {{ formatPrice(repair.montant) }} Ar</p>
                <p v-if="repair.dejaPaye > 0" class="paid-text">Déjà payé: {{ formatPrice(repair.dejaPaye) }} Ar</p>
                <p class="price-text">Reste: {{ formatPrice(repair.resteAPayer) }} Ar</p>
              </div>
            </ion-label>
            <ion-button slot="end" size="small" @click="payer(repair)">
              Payer
            </ion-button>
          </ion-item>
        </ion-list>
      </div>

      <!-- Section: Historique des paiements -->
      <div class="section-container">
        <ion-list-header>
          <ion-label>Historique</ion-label>
        </ion-list-header>

        <div v-if="loadingHistory" class="ion-text-center ion-padding">
          <ion-spinner name="crescent"></ion-spinner>
        </div>

        <div v-else-if="paymentHistory.length === 0" class="empty-mini-state">
          <p>Aucun historique de paiement.</p>
        </div>

        <ion-list v-else>
          <ion-item v-for="payment in paymentHistory" :key="payment.id" class="history-item">
            <ion-icon slot="start" :icon="checkmarkCircle" color="success"></ion-icon>
            <ion-label>
              <h3>{{ payment.repair?.car?.model || 'Réparation' }}</h3>
              <p>Transaction: {{ payment.transaction_id }}</p>
              <p class="date-text">{{ formatDate(payment.created_at) }}</p>
            </ion-label>
            <ion-note slot="end" class="amount-note">
              {{ formatPrice(payment.amount) }} Ar
            </ion-note>
          </ion-item>
        </ion-list>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonIcon, IonSpinner, 
  IonRefresher, IonRefresherContent, IonNote, IonButton,
  IonListHeader, alertController, toastController,
  onIonViewDidEnter
} from '@ionic/vue';
import { 
  cashOutline, checkmarkCircle, timeOutline, 
  carOutline, alertCircleOutline 
} from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { 
  collection, query, where, onSnapshot, 
  addDoc, serverTimestamp, doc, updateDoc 
} from 'firebase/firestore';
import { db, auth } from '@/firebaseConfig';

const pendingRepairs = ref<any[]>([]);
const paymentHistory = ref<any[]>([]);
const totalPaidByRepair = ref<Record<string, number>>({});
const loadingRepairs = ref(true);
const loadingHistory = ref(true);
const API_URL = 'http://192.168.4.28:8000/api';

const allFirestoreRepairs = ref<any[]>([]);

const updatePendingRepairsList = () => {
  const repairs: any[] = [];
  allFirestoreRepairs.value.forEach(data => {
    const totalAmount = parseFloat(data.montant) || 0;
    const alreadyPaid = totalPaidByRepair.value[data.id] || 0;
    const remaining = totalAmount - alreadyPaid;

    const isPayableStatus = ['Terminé', 'Terminée', 'Prête', 'waiting_for_payment', 'En cours', 'Payé'].includes(data.statut);
    
    if (isPayableStatus && remaining > 0) {
      repairs.push({
        ...data,
        modele: data.modele || 'Voiture',
        montant: data.montant || 0,
        resteAPayer: remaining,
        dejaPaye: alreadyPaid,
        immatriculation: data.immatriculation || ''
      });
    }
  });
  pendingRepairs.value = repairs;
  loadingRepairs.value = false;
};

// 1. Charger les réparations à payer depuis Firestore
const setupFirestoreListeners = (userId: string) => {
  // 1. Écouter les réparations
  const qRepairs = query(collection(db, "repairs"), where("userId", "==", userId));
  onSnapshot(qRepairs, (snapshot) => {
    allFirestoreRepairs.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    updatePendingRepairsList();
  });

  // 2. Écouter l'historique des paiements
  const qPayments = query(collection(db, "payments"), where("user_id", "==", userId));
  onSnapshot(qPayments, (snapshot) => {
    const payments: any[] = [];
    const paidSums: Record<string, number> = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const repairId = data.firestore_repair_id;
      const amount = parseFloat(data.amount) || 0;

      if (repairId) {
        paidSums[repairId] = (paidSums[repairId] || 0) + amount;
      }

      payments.push({
        id: doc.id,
        ...data,
        amount: amount,
        transaction_id: data.transaction_id,
        repair: {
          car: {
            model: data.modele || 'Réparation'
          }
        },
        created_at: data.created_at?.toDate?.() || new Date()
      });
    });

    totalPaidByRepair.value = paidSums;
    paymentHistory.value = payments.sort((a, b) => (b.created_at as any) - (a.created_at as any));
    loadingHistory.value = false;
    
    updatePendingRepairsList();
  });
};

onMounted(() => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      setupFirestoreListeners(user.uid);
    }
  });
});

onIonViewDidEnter(() => {
  // Les listeners Firestore s'occupent du rafraîchissement
});

const handleRefresh = async (event: any) => {
  // Pas besoin de fetch manuel avec onSnapshot
  event.target.complete();
};

// 3. Logique de paiement
const payer = async (repair: any) => {
  const alert = await alertController.create({
    header: 'Confirmer le paiement',
    message: `Saisissez le montant pour la réparation de votre ${repair.modele} (${repair.immatriculation})`,
    inputs: [
      {
        name: 'amount',
        type: 'number',
        placeholder: 'Montant (Ar)',
        value: repair.resteAPayer,
        min: 0
      }
    ],
    buttons: [
      { text: 'Annuler', role: 'cancel' },
      {
        text: 'Payer maintenant',
        handler: (data) => {
          if (!data.amount || parseFloat(data.amount) <= 0) {
            toastController.create({
              message: 'Veuillez saisir un montant valide.',
              duration: 2000,
              color: 'warning',
              position: 'bottom'
            }).then(t => t.present());
            return false;
          }
          processPayment(repair, parseFloat(data.amount));
        }
      }
    ]
  });
  await alert.present();
};

const processPayment = async (repair: any, amountToPay: number) => {
  const loadingToast = await toastController.create({
    message: 'Traitement du paiement...',
    duration: 0,
    position: 'bottom'
  });
  await loadingToast.present();

  try {
    // 1. Enregistrer le paiement dans la collection 'payments' de Firestore
    const transactionId = 'TRANS-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    await addDoc(collection(db, "payments"), {
      repair_id: repair.laravel_id || null, // ID de la base Laravel si dispo
      firestore_repair_id: repair.id,      // ID du document Firestore
      user_id: auth.currentUser?.uid,
      amount: amountToPay,
      payment_method: 'mobile_money',
      transaction_id: transactionId,
      status: 'paid',
      created_at: serverTimestamp(),
      synced: false // Pour que le backend sache qu'il doit le traiter
    });

    // 2. Mettre à jour le statut de la réparation dans Firestore pour feedback immédiat
    const repairRef = doc(db, "repairs", repair.id);
    
    // On calcule si avec ce nouveau paiement on atteint le total
    const isNowFullyPaid = (repair.dejaPaye + amountToPay) >= repair.montant;
    
    if (isNowFullyPaid) {
      await updateDoc(repairRef, {
        statut: 'Payé'
      });
    }
    
    await loadingToast.dismiss();
    
    const successToast = await toastController.create({
      message: 'Paiement effectué ! La réparation est maintenant marquée comme payée.',
      duration: 3000,
      color: 'success',
      position: 'bottom'
    });
    await successToast.present();

  } catch (error: any) {
    await loadingToast.dismiss();
    const errorToast = await toastController.create({
      message: 'Erreur: ' + (error.response?.data?.message || error.message),
      duration: 4000,
      color: 'danger',
      position: 'bottom'
    });
    await errorToast.present();
  }
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const formatPrice = (price: any) => {
  return typeof price === 'number' ? price.toLocaleString() : price;
};
</script>

<style scoped>
.section-container {
  margin-bottom: 24px;
}

.empty-mini-state {
  padding: 20px;
  text-align: center;
  color: var(--ion-color-medium);
  font-style: italic;
  font-size: 0.9rem;
}

.paid-text {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  margin: 2px 0;
}

.total-text {
  font-size: 0.85rem;
  color: var(--ion-color-dark);
  margin: 2px 0;
}

.price-text {
  font-weight: 700;
  color: var(--ion-color-danger);
  font-size: 1rem;
  margin: 2px 0;
}

.date-text {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
}

.amount-note {
  font-weight: 600;
  color: var(--ion-color-dark);
}

.pending-item, .history-item {
  --padding-top: 8px;
  --padding-bottom: 8px;
}

ion-list-header {
  --background: transparent;
  --color: var(--ion-color-primary);
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}
</style>
