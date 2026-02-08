<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Signaler une panne</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="form-header">
        <p>Décrivez les problèmes de votre véhicule pour une prise en charge rapide.</p>
      </div>

      <div class="auth-form">
        <ion-item lines="none" class="custom-item">
          <ion-label position="stacked">Modèle du véhicule</ion-label>
          <ion-input v-model="form.modele" placeholder="ex: Peugeot 208"></ion-input>
        </ion-item>

        <ion-item lines="none" class="custom-item">
          <ion-label position="stacked">Immatriculation</ion-label>
          <ion-input v-model="form.immatriculation" placeholder="ex: AB-123-CD"></ion-input>
        </ion-item>

        <ion-item lines="none" class="custom-item">
          <ion-label position="stacked">Type d'intervention</ion-label>
          <ion-select v-model="form.type" placeholder="Choisir une intervention" interface="action-sheet">
            <ion-select-option v-for="type in typesIntervention" :key="type" :value="type">
              {{ type }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item lines="none" class="custom-item">
          <ion-label position="stacked">Description de la panne</ion-label>
          <ion-textarea 
            v-model="form.panne" 
            placeholder="Détaillez le problème rencontré..."
            rows="4"
          ></ion-textarea>
        </ion-item>

        <ion-button expand="block" class="auth-button" :disabled="submitting" @click="envoyerPanne">
          <ion-spinner v-if="submitting" name="crescent"></ion-spinner>
          <span v-else>Envoyer au garage</span>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonInput, IonTextarea, IonSelect, 
  IonSelectOption, IonButton, IonSpinner, toastController 
} from '@ionic/vue';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/firebaseConfig';

const router = useRouter();
const submitting = ref(false);

const typesIntervention = [
  "Frein", "Vidange", "Filtre", "Batterie", 
  "Amortisseurs", "Embrayage", "Pneus", "Système de refroidissement"
];

const form = reactive({
  modele: '',
  immatriculation: '',
  type: '',
  panne: ''
});

const envoyerPanne = async () => {
  if (!form.modele || !form.immatriculation || !form.type || !form.panne) {
    const toast = await toastController.create({
      message: 'Veuillez remplir tous les champs',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    router.push('/login');
    return;
  }

  submitting.value = true;
  console.log("Vérification de la capacité du garage...");

  try {
    // Vérifier le nombre de voitures actuellement en réparation (Uniquement "En cours")
    // Le garage accepte 2 voitures EN MÊME TEMPS en réparation.
    const qCount = query(
      collection(db, "repairs"), 
      where("statut", "==", "En cours")
    );
    const querySnapshot = await getDocs(qCount);
    const inProgressCount = querySnapshot.size;

    if (inProgressCount >= 2) {
      const toast = await toastController.create({
        message: 'Désolé, le garage est complet (2 voitures sont déjà en cours de réparation). Veuillez patienter.',
        duration: 4000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
      submitting.value = false;
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      console.error("Aucun utilisateur connecté lors de l'envoi");
      router.push('/login');
      return;
    }

    console.log("Utilisateur identifié:", user.uid);

    // Créer une promesse de timeout de 10 secondes
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout: Firestore ne répond pas")), 10000)
    );

    const docPromise = addDoc(collection(db, "repairs"), {
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || user.email.split('@')[0],
      modele: form.modele,
      immatriculation: form.immatriculation,
      type: form.type,
      panne: form.panne,
      statut: 'En attente',
      progress: 0,
      createdAt: serverTimestamp()
    });

    // Course entre l'insertion et le timeout
    const docRef = await Promise.race([docPromise, timeoutPromise]) as any;

    console.log("Document inséré avec ID:", docRef.id);

    const toast = await toastController.create({
      message: 'Panne envoyée avec succès !',
      duration: 3000,
      color: 'success'
    });
    await toast.present();
    
    // Reset form and redirect
    form.modele = '';
    form.immatriculation = '';
    form.type = '';
    form.panne = '';
    router.push('/accueil/reparations');

  } catch (error: any) {
    console.error("Erreur détaillée Firebase:", error);
    let errorMsg = 'Erreur lors de l\'envoi';
    
    if (error.code === 'permission-denied') {
      errorMsg = 'Permission refusée (Vérifiez les règles Firestore)';
    } else if (error.message) {
      errorMsg = `Erreur: ${error.message}`;
    }

    const toast = await toastController.create({
      message: errorMsg,
      duration: 5000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.form-header {
  margin-bottom: 32px;
  text-align: center;
}

.form-header p {
  color: var(--ion-color-medium);
  font-size: 1.1rem;
}

.auth-form {
  max-width: 500px;
  margin: 0 auto;
}

.custom-item {
  --background: #ffffff;
  --border-radius: 16px;
  --padding-start: 20px;
  --inner-padding-end: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #edf2f7;
}

.custom-item ion-label {
  font-weight: 600;
  color: var(--ion-color-primary);
  margin-bottom: 8px !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.auth-button {
  margin-top: 32px;
  --background: var(--ion-color-primary);
  --border-radius: 16px;
  height: 56px;
  font-size: 1.1rem;
}

@media (prefers-color-scheme: dark) {
  .custom-item {
    --background: #2d3748;
    border-color: #4a5568;
  }
}
</style>
