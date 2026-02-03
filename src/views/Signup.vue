<style scoped>
.signup-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.input-item {
  width: 100%;
  max-width: 360px;
  margin-bottom: 16px;
  border-radius: 8px;
}

.signup-btn {
  width: 100%;
  max-width: 360px;
  margin-top: 20px;
  border-radius: 8px;
}

.login-link {
  margin-top: 16px;
  font-size: 14px;
}

.login-link span {
  color: var(--ion-color-primary);
  font-weight: bold;
  cursor: pointer;
}
</style>
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

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";

const nom = ref("");
const email = ref("");
const password = ref("");
const adresse = ref("");

const router = useRouter();

const inscription = async () => {
  console.log(nom.value, email.value, password.value);

  if (!email.value || !password.value) {
    alert("Champs manquants");
    return;
  }

  try {
    await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    router.push("/accueil/tab2");
  } catch (e) {
    alert(e.message);
  }
};
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Inscription</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding signup-content">

      <ion-item class="input-item">
        <ion-label position="floating">Nom</ion-label>
        <ion-input @ionInput="nom = $event.target.value"></ion-input>
      </ion-item>
    <ion-item class="input-item">
        <ion-label position="floating">adresse</ion-label>
        <ion-input @ionInput="adresse = $event.target.value"></ion-input>
      </ion-item>

      <ion-item class="input-item">
        <ion-label position="floating">Email</ion-label>
        <ion-input
          type="email"
          @ionInput="email = $event.target.value"
        ></ion-input>
      </ion-item>

      <ion-item class="input-item">
        <ion-label position="floating">Mot de passe</ion-label>
        <ion-input
          type="password"
          @ionInput="password = $event.target.value"
        ></ion-input>
      </ion-item>


      <ion-button expand="block" class="signup-btn" @click="inscription">
        S’inscrire
      </ion-button>

      <!-- Lien connexion -->
      <p class="login-link">
        Déjà un compte ?
        <span @click="router.push('/login')">Se connecter</span>
      </p>

      <!-- DEBUG -->
      <p>Nom : {{ nom }}</p>
      <p>Email : {{ email }}</p>
      <p>MDP : {{ password }}</p>

    </ion-content>
  </ion-page>
</template>
