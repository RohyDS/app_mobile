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
  --border-color: #f0f0f0;
  border-top: 1px solid #f0f0f0;
  height: 65px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.03);
}

ion-tab-button {
  --color: #a0aec0;
  --color-selected: var(--ion-color-primary);
  transition: all 0.2s ease;
}

ion-tab-button ion-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

ion-tab-button ion-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (prefers-color-scheme: dark) {
  .custom-tab-bar {
    --background: #1a202c;
    --border-color: #2d3748;
    border-top: 1px solid #2d3748;
  }
}
</style>
