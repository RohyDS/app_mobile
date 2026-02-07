<template>
  <div id="container">
    <div class="content-wrapper">
      <div class="icon-circle">
        <ion-icon :icon="sparklesOutline"></ion-icon>
      </div>
      <strong>{{ name }}</strong>
      <p>Bienvenue dans votre nouvelle interface élégante. Commencez à explorer vos fonctionnalités.</p>
      <ion-button fill="clear" class="action-link">
        En savoir plus
        <ion-icon slot="end" :icon="arrowForwardOutline"></ion-icon>
      </ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonButton } from '@ionic/vue';
import { sparklesOutline, arrowForwardOutline } from 'ionicons/icons';
defineProps({
  name: String,
});
</script>

<style scoped>
#container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  background-color: var(--ion-color-light);
}

.content-wrapper {
  text-align: center;
  max-width: 300px;
}

.icon-circle {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  color: var(--ion-color-primary);
  font-size: 32px;
}

strong {
  font-size: 24px;
  font-weight: 800;
  color: var(--ion-color-dark);
  display: block;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

p {
  font-size: 16px;
  line-height: 1.6;
  color: var(--ion-color-medium);
  margin-bottom: 24px;
}

.action-link {
  --color: var(--ion-color-primary);
  font-weight: 700;
  font-size: 14px;
  text-transform: none;
}

@media (prefers-color-scheme: dark) {
  .icon-circle {
    background: #2d3748;
    color: var(--ion-color-primary);
  }
}
</style>
