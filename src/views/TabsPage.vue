<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" class="custom-tab-bar">
        <ion-tab-button tab="reparations" href="/accueil/reparations">
          <ion-icon aria-hidden="true" :icon="carOutline" />
          <ion-label>Réparations</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="payments" href="/accueil/payments">
          <ion-icon aria-hidden="true" :icon="cashOutline" />
          <ion-label>Paiements</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="notifications" href="/accueil/notifications">
          <div class="icon-badge-wrapper">
            <ion-icon aria-hidden="true" :icon="notificationsOutline" />
            <ion-badge v-if="unreadCount > 0" color="danger" class="tab-badge">
              {{ unreadCount }}
            </ion-badge>
          </div>
          <ion-label>Notifications</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="panne" href="/accueil/panne">
          <ion-icon aria-hidden="true" :icon="alertCircleOutline" />
          <ion-label>Signaler</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profil" href="/accueil/profil">
          <ion-icon aria-hidden="true" :icon="personOutline" />
          <ion-label>Profil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet, IonBadge 
} from '@ionic/vue';
import { carOutline, alertCircleOutline, personOutline, notificationsOutline, cashOutline } from 'ionicons/icons';
import { useNotificationService } from '@/services/notificationService';
import { onMounted } from 'vue';

const { unreadCount, initFirebaseListener } = useNotificationService();

onMounted(() => {
  initFirebaseListener();
});
</script>

<style scoped>
.icon-badge-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-badge {
  position: absolute;
  top: -8px;
  right: -10px;
  --padding-start: 4px;
  --padding-end: 4px;
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  border-radius: 50%;
}

@media (prefers-color-scheme: dark) {
  .tab-badge {
    border-color: #1a202c;
  }
}

.custom-tab-bar {
  --background: #ffffff;
  --border-color: #E5E5E7;
  height: 60px;
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1px solid #E5E5E7;
  box-shadow: none;
  border-radius: 0;
}

ion-tab-button {
  --color: #8E8E93;
  --color-selected: #000000;
  transition: opacity 0.3s ease;
  background: transparent;
}

ion-tab-button::before {
  display: none;
}

ion-tab-button ion-icon {
  font-size: 22px;
  margin-bottom: 2px;
}

ion-tab-button ion-label {
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@media (prefers-color-scheme: dark) {
  .custom-tab-bar {
    --background: #000000;
    --border-color: #333335;
    border-top: 1px solid #333335;
  }
  ion-tab-button {
    --color: #8E8E93;
    --color-selected: #ffffff;
  }
}
</style>
