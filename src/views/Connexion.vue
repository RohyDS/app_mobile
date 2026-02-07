<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton
} from "@ionic/vue";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";

const email = ref("");
const password = ref("");

const router = useRouter();

const login = async () => {
  if (!email.value || !password.value) {
    alert("Champs obligatoires");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    alert("vous etes connectee");
    console.log("Connecté :", userCredential.user.email);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    router.push("/accueil/reparations");

  } catch (error) {
    alert("Email ou mot de passe incorrect");
  }
};
</script>
<template>
  <ion-page>
    <ion-content class="ion-padding auth-container">
      <div class="auth-header">
        <h1>Bienvenue</h1>
        <p>Connectez-vous pour continuer</p>
      </div>

      <div class="auth-form">
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

        <ion-button expand="block" class="auth-button" @click="login">
          Se connecter
        </ion-button>

        <div class="auth-footer">
          <p>Pas encore de compte ? <span @click="router.push('/signup')">S'inscrire</span></p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.auth-container {
  --background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
  margin-top: 60px;
}

.auth-header h1 {
  font-size: 2.5rem;
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
  --background-activated: var(--ion-color-primary-shade);
  --border-radius: 16px;
  height: 56px;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
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
