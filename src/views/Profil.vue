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
  padding: 40px 20px;
  background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-tertiary) 100%);
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  margin-bottom: 30px;
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.3);
}

.avatar-container {
  position: relative;
  margin-bottom: 16px;
}

.avatar-container ion-avatar {
  width: 100px;
  height: 100px;
  border: 4px solid #ffffff;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.profile-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.025em;
}

.profile-header p {
  margin: 4px 0 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.stats-container {
  display: flex;
  gap: 16px;
  padding: 0 20px;
  margin-top: -50px;
  margin-bottom: 30px;
}

.stat-card {
  flex: 1;
  background: #ffffff;
  padding: 20px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ion-color-primary);
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ion-color-medium);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.menu-list {
  background: transparent;
  padding: 0 20px;
}

.menu-item {
  --background: #ffffff;
  --border-radius: 20px;
  margin-bottom: 12px;
  --padding-start: 16px;
  --inner-padding-end: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  border: 1px solid #f1f5f9;
}

.menu-item ion-icon {
  color: var(--ion-color-primary);
  font-size: 22px;
}

.menu-item ion-label {
  font-weight: 600;
  color: var(--ion-color-dark);
  margin-left: 12px;
}

.logout-item {
  --color: var(--ion-color-danger);
}

.logout-item ion-icon {
  color: var(--ion-color-danger);
}

.app-info {
  text-align: center;
  margin-top: 40px;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

@media (prefers-color-scheme: dark) {
  .profile-header {
    background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
  }
  
  .stat-card {
    background: #1e293b;
    border-color: #334155;
  }
  
  .menu-item {
    --background: #1e293b;
    border-color: #334155;
  }
}
</style>
