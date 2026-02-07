<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title ref="pageTitle" tabindex="-1">Mes Réparations</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="loading" class="ion-text-center ion-padding">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div v-else-if="cars.length === 0" class="empty-state">
        <ion-icon :icon="carOutline"></ion-icon>
        <h2>Aucun véhicule</h2>
        <p>Vous n'avez pas encore de voiture en réparation.</p>
        <ion-button expand="block" fill="outline" @click="router.push('/accueil/panne')">
          Ajouter une panne
        </ion-button>
      </div>

      <div v-else>
        <ion-list lines="none">
          <ion-item v-for="car in cars" :key="car.id" class="car-card">
            <div class="card-content">
              <div class="card-header">
                <div class="car-info">
                  <h3>{{ car.modele }}</h3>
                  <p>{{ car.immatriculation }}</p>
                </div>
                <ion-badge :color="getStatusColor(car.statut)">
                  {{ car.statut }}
                </ion-badge>
              </div>

              <div class="repair-details">
                <p><strong>Problème:</strong> {{ car.panne }}</p>
                <div class="progress-container" v-if="car.statut === 'En cours'">
                  <ion-progress-bar :value="car.progress / 100" color="primary"></ion-progress-bar>
                  <span>{{ car.progress }}%</span>
                </div>
              </div>

              <div class="card-footer" v-if="car.statut === 'Prête'">
                <ion-button expand="block" color="success" @click="payer(car)">
                  Payer et récupérer
                </ion-button>
              </div>
            </div>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonBadge, IonProgressBar, IonButton, 
  IonSpinner, IonIcon, onIonViewDidEnter 
} from '@ionic/vue';
import { carOutline } from 'ionicons/icons';

const pageTitle = ref<HTMLElement | null>(null);

onIonViewDidEnter(() => {
  // Déplacer le focus vers le titre de la page pour l'accessibilité
  // et pour résoudre les avertissements aria-hidden
  if (pageTitle.value) {
    (pageTitle.value as any).$el?.focus?.() || pageTitle.value.focus?.();
  }
});
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/firebaseConfig';

const router = useRouter();
const loading = ref(true);
const cars = ref<any[]>([]);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'En attente': return 'warning';
    case 'En cours': return 'primary';
    case 'Prête': return 'success';
    case 'Terminée': return 'medium';
    default: return 'medium';
  }
};

const payer = (car: any) => {
  // Logique de paiement à implémenter (Slide 6)
  alert(`Redirection vers le paiement pour ${car.modele}`);
};

onMounted(() => {
  const user = auth.currentUser;
  if (!user) {
    router.push('/login');
    return;
  }

  const q = query(collection(db, "repairs"), where("userId", "==", user.uid));
  
  onSnapshot(q, (snapshot) => {
    cars.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    loading.value = false;
  }, (error) => {
    console.error("Error fetching repairs:", error);
    loading.value = false;
  });
});
</script>

<style scoped>
.car-card {
  --background: #ffffff;
  --border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #edf2f7;
}

.card-content {
  padding: 16px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.car-info h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--ion-color-dark);
}

.car-info p {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: var(--ion-color-medium);
}

.repair-details p {
  font-size: 0.95rem;
  color: var(--ion-color-dark);
}

.progress-container {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-container span {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.card-footer {
  margin-top: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80%;
  text-align: center;
  padding: 40px;
}

.empty-state ion-icon {
  font-size: 80px;
  color: var(--ion-color-light-shade);
  margin-bottom: 20px;
}

.empty-state h2 {
  font-weight: 700;
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--ion-color-medium);
  margin-bottom: 32px;
}

@media (prefers-color-scheme: dark) {
  .car-card {
    --background: #2d3748;
    border-color: #4a5568;
  }
}
</style>
