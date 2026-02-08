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
                  <p v-if="car.montant !== undefined && car.montant !== null" class="price-tag">
                    <strong>Montant: </strong> {{ formatPrice(car.montant) }} Ar
                  </p>
                  <p v-if="car.slot_number" class="slot-info">Position: Emplacement {{ car.slot_number }}</p>
                </div>
                <ion-badge :color="getStatusColor(car.statut)">
                  {{ car.statut }}
                </ion-badge>
              </div>

              <div class="repair-details">
                <p><strong>Problème:</strong> {{ car.panne }}</p>
                <div class="progress-container" v-if="car.statut === 'En cours'">
                  <ion-progress-bar :value="(car.progress || 0) / 100" color="primary"></ion-progress-bar>
                  <span>{{ car.progress || 0 }}%</span>
                </div>
              </div>

              <div class="card-footer" v-if="car.statut === 'Prête' || car.statut === 'Terminée'">
                <ion-button expand="block" color="success" @click="payer(car)" v-if="car.statut === 'Prête'">
                  Payer et récupérer
                </ion-button>
                <ion-badge color="success" v-else-if="car.statut === 'Payé'">Réparation Payée</ion-badge>
              </div>
            </div>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonBadge, IonProgressBar, IonButton, 
  IonSpinner, IonIcon, onIonViewDidEnter, alertController,
  toastController
} from '@ionic/vue';
import { carOutline } from 'ionicons/icons';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebaseConfig';
import axios from 'axios';

const router = useRouter();
const pageTitle = ref<HTMLElement | null>(null);
const loading = ref(true);
const cars = ref<any[]>([]);

onIonViewDidEnter(() => {
  if (pageTitle.value) {
    const el = (pageTitle.value as any).$el || pageTitle.value;
    el.focus?.();
  }
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'En attente': return 'warning';
    case 'En cours': return 'primary';
    case 'Prête': return 'success';
    case 'Terminée': 
    case 'Payé': return 'success';
    default: return 'medium';
  }
};

const formatPrice = (price: any) => {
  if (typeof price === 'number') {
    return price.toLocaleString();
  }
  return price;
};

const payer = async (car: any) => {
  const alert = await alertController.create({
    header: 'Confirmer le paiement',
    message: `Voulez-vous payer ${formatPrice(car.montant)} Ar pour la réparation de votre ${car.modele} ?`,
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Payer (Mobile Money)',
        handler: async () => {
          await processPayment(car);
        }
      }
    ]
  });
  await alert.present();
};

const processPayment = async (car: any) => {
  const loadingToast = await toastController.create({
    message: 'Traitement du paiement...',
    duration: 0,
    position: 'bottom'
  });
  await loadingToast.present();

  try {
    // 1. Récupérer l'ID de réparation Laravel (via le document Firebase)
    // Note: Dans votre système, vous avez un firebase_id dans la table repairs de Laravel
    // On doit d'abord s'assurer d'avoir l'ID Laravel. 
    // Pour simplifier ici, on suppose que le backend peut retrouver la réparation via l'ID Firebase.
    
    const paymentData = {
      repair_id: car.laravel_id || car.id, // On utilise l'ID Firebase si laravel_id n'est pas dispo, le backend devra gérer
      amount: car.montant,
      payment_method: 'mobile_money',
      transaction_id: 'TRANS-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      phone_number: '0340000000', // Simulé
      provider: 'Orange Money' // Simulé
    };

    // Appel API Laravel
    // Utilisation de l'IP locale pour l'accès depuis le mobile/émulateur
    const API_URL = 'http://192.168.4.28:8000/api'; 
    
    console.log("Envoi du paiement à:", `${API_URL}/payments`, paymentData);
    
    const response = await axios.post(`${API_URL}/payments`, paymentData);
    console.log("Réponse backend:", response.data);

    await loadingToast.dismiss();
    
    const successToast = await toastController.create({
      message: 'Paiement effectué avec succès !',
      duration: 3000,
      color: 'success',
      position: 'bottom'
    });
    await successToast.present();

  } catch (error: any) {
    await loadingToast.dismiss();
    console.error("Erreur paiement:", error);
    
    const errorToast = await toastController.create({
      message: 'Erreur lors du paiement: ' + (error.response?.data?.message || error.message),
      duration: 4000,
      color: 'danger',
      position: 'bottom'
    });
    await errorToast.present();
  }
};

onMounted(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const q = query(collection(db, "repairs"), where("userId", "==", user.uid));
    
    onSnapshot(q, (snapshot) => {
      console.log("Firestore update received, docs count:", snapshot.docs.length);
      const newCars: any[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const id = doc.id;
        
        newCars.push({
          id,
          ...data
        });
      });
      
      cars.value = newCars;
      loading.value = false;
    }, (error) => {
      console.error("Error fetching repairs:", error);
      loading.value = false;
    });
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

.price-tag {
  color: var(--ion-color-success) !important;
  font-weight: 600;
  font-size: 0.95rem !important;
  margin-top: 8px !important;
}

.slot-info {
  color: var(--ion-color-primary) !important;
  font-weight: 500;
  margin-top: 4px !important;
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
