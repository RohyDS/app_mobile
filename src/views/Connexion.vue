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
    router.push("/accueil/tab1");

  } catch (error) {
    alert("Email ou mot de passe incorrect");
  }
};
</script>
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Connexion</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <ion-item>
        <ion-label position="floating">Email</ion-label>
        <ion-input
          type="email"
          @ionInput="email = $event.target.value"
        ></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="floating">Mot de passe</ion-label>
        <ion-input
          type="password"
          @ionInput="password = $event.target.value"
        ></ion-input>
      </ion-item>

      <ion-button expand="block" @click="login">
        Se connecter
      </ion-button>

      <!-- DEBUG -->
      <p>Email: {{ email }}</p>
      <p>MDP: {{ password }}</p>

    </ion-content>
  </ion-page>
</template>
