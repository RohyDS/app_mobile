<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Mon Profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="profile-header">
        <div class="avatar-circle">
          <ion-icon :icon="personOutline"></ion-icon>
        </div>
        <h2>{{ userEmail }}</h2>
        <ion-badge color="primary">Client Premium</ion-badge>
      </div>

      <ion-list lines="none" class="profile-menu">
        <ion-item class="menu-item" button>
          <ion-icon slot="start" :icon="carOutline" color="primary"></ion-icon>
          <ion-label>Historique des réparations</ion-label>
          <ion-badge slot="end" color="light">{{ repairCount }}</ion-badge>
        </ion-item>

        <ion-item class="menu-item" button>
          <ion-icon slot="start" :icon="cardOutline" color="primary"></ion-icon>
          <ion-label>Moyens de paiement</ion-label>
        </ion-item>

        <ion-item class="menu-item" button>
          <ion-icon slot="start" :icon="notificationsOutline" color="primary"></ion-icon>
          <ion-label>Notifications</ion-label>
          <ion-toggle slot="end" :checked="true"></ion-toggle>
        </ion-item>

        <ion-item class="menu-item logout-item" button @click="handleLogout">
          <ion-icon slot="start" :icon="logOutOutline" color="danger"></ion-icon>
          <ion-label color="danger">Déconnexion</ion-label>
        </ion-item>
      </ion-list>

      <div class="app-info">
        <p>Version 1.0.0</p>
        <p>© 2026 Garage Simulation S5</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonIcon, IonBadge, IonToggle,
  alertController, onIonViewWillEnter
} from '@ionic/vue';
import { 
  personOutline, carOutline, cardOutline, 
  notificationsOutline, logOutOutline 
} from 'ionicons/icons';
import { auth, db } from '@/firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const router = useRouter();
const userEmail = ref('');
const repairCount = ref(0);
const loading = ref(false);
let authListener: any = null;

const fetchProfileData = async (user: any) => {
  console.log("Fetching profile data for user:", user?.email);
  if (user) {
    loading.value = true;
    userEmail.value = user.email || 'Utilisateur';
    try {
      const q = query(collection(db, "repairs"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      repairCount.value = querySnapshot.size;
      console.log("Repair count updated:", repairCount.value);
    } catch (error) {
      console.error("Error fetching repairs count:", error);
      repairCount.value = 0;
    } finally {
      loading.value = false;
    }
  } else {
    userEmail.value = '';
    repairCount.value = 0;
    loading.value = false;
  }
};

const handleLogout = async () => {
  const alert = await alertController.create({
    header: 'Déconnexion',
    message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    buttons: [
      { text: 'Annuler', role: 'cancel' },
      { 
        text: 'Oui', 
        handler: async () => {
          try {
            await signOut(auth);
            userEmail.value = '';
            repairCount.value = 0;
            router.replace('/login');
          } catch (error) {
            console.error("Error signing out:", error);
          }
        }
      }
    ]
  });
  await alert.present();
};

onIonViewWillEnter(() => {
  console.log("Profile view entering, checking user...");
  fetchProfileData(auth.currentUser);
});

onMounted(() => {
  authListener = onAuthStateChanged(auth, (user) => {
    fetchProfileData(user);
  });
});

onUnmounted(() => {
  if (authListener) authListener();
});
</script>

<style scoped>
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
  margin-bottom: 24px;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  font-size: 48px;
  color: var(--ion-color-primary);
}

.profile-header h2 {
  font-weight: 800;
  margin-bottom: 8px;
  color: var(--ion-color-dark);
}

.profile-menu {
  background: transparent;
}

.menu-item {
  --background: #ffffff;
  --border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid #edf2f7;
  --padding-start: 16px;
}

.logout-item {
  margin-top: 32px;
}

.app-info {
  text-align: center;
  margin-top: 40px;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

@media (prefers-color-scheme: dark) {
  .avatar-circle {
    background: #2d3748;
  }
  .menu-item {
    --background: #2d3748;
    border-color: #4a5568;
  }
}
</style>
