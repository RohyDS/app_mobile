<template>
  <ion-page>
    <ion-content class="ion-padding auth-container">
      <div class="auth-header">
        <h1>Créer un compte</h1>
        <p>Rejoignez-nous dès aujourd'hui</p>
      </div>

      <div class="auth-form">
        <ion-item lines="none" class="custom-item">
          <ion-label position="stacked">Nom complet</ion-label>
          <ion-input
            placeholder="Jean Dupont"
            @ionInput="nom = $event.target.value"
          ></ion-input>
        </ion-item>

        <ion-item lines="none" class="custom-item">
          <ion-label position="stacked">Adresse</ion-label>
          <ion-input
            placeholder="123 Rue de Rivoli"
            @ionInput="adresse = $event.target.value"
          ></ion-input>
        </ion-item>

        <ion-item lines="none" class="custom-item">
          <ion-label position="stacked">Email</ion-label>
          <ion-input
            type="email"
            placeholder="votre@email.com"
            @ionInput="email = $event.target.value"
          ></ion-input>
        </ion-item>

        <ion-item lines="none" class="custom-item">
          <ion-label position="stacked">Mot de passe</ion-label>
          <ion-input
            type="password"
            placeholder="••••••••"
            @ionInput="password = $event.target.value"
          ></ion-input>
        </ion-item>

        <ion-button expand="block" class="auth-button" @click="inscription">
          S'inscrire
        </ion-button>

        <div class="auth-footer">
          <p>Déjà un compte ? <span @click="router.push('/login')">Se connecter</span></p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import {
  IonPage,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton
} from "@ionic/vue";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/firebaseConfig";

const nom = ref("");
const email = ref("");
const password = ref("");
const adresse = ref("");

const router = useRouter();

const inscription = async () => {
  if (!email.value || !password.value || !nom.value) {
    alert("Veuillez remplir tous les champs (Nom, Email, Mot de passe)");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    // Mettre à jour le profil avec le nom
    await updateProfile(userCredential.user, {
      displayName: nom.value
    });

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    router.push("/accueil/reparations");
  } catch (e) {
    alert(e.message);
  }
};
</script>

<style scoped>
.auth-container {
  --background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
  margin-top: 40px;
}

.auth-header h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--ion-color-dark);
  margin-bottom: 8px;
  letter-spacing: -1px;
}

.auth-header p {
  color: var(--ion-color-medium);
  font-size: 1.1rem;
}

.auth-form {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.custom-item {
  --background: #ffffff;
  --border-radius: 16px;
  --padding-start: 20px;
  --inner-padding-end: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #edf2f7;
}

.custom-item ion-label {
  font-weight: 600;
  color: var(--ion-color-primary);
  margin-bottom: 6px !important;
  text-transform: uppercase;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
}

.auth-button {
  margin-top: 24px;
  --background: var(--ion-color-primary);
  --background-activated: var(--ion-color-primary-shade);
  --border-radius: 16px;
  height: 56px;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  margin-bottom: 40px;
}

.auth-footer p {
  color: var(--ion-color-medium);
}

.auth-footer span {
  color: var(--ion-color-primary);
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

@media (prefers-color-scheme: dark) {
  .auth-container {
    --background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }
  .custom-item {
    --background: #2d3748;
    border-color: #4a5568;
  }
}
</style>
