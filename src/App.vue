<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useNotificationService } from '@/services/notificationService';
import { onMounted } from 'vue';

const { initFirebaseListener } = useNotificationService();

onMounted(() => {
  initFirebaseListener();
});
</script>
