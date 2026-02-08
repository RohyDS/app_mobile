<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Notifications</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="markAllAsRead" v-if="unreadCount > 0">
            Tout lire
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="notifications.length === 0" class="empty-state">
        <ion-icon :icon="notificationsOffOutline"></ion-icon>
        <h2>Aucune notification</h2>
        <p>Vous n'avez pas encore de notifications.</p>
      </div>

      <ion-list v-else lines="full">
        <ion-item-sliding v-for="notif in notifications" :key="notif.id">
          <ion-item :class="{ 'unread': !notif.read }">
            <div slot="start" class="notif-icon" :class="{ 'unread-dot': !notif.read }">
              <ion-icon :icon="notificationsOutline" color="primary"></ion-icon>
            </div>
            <ion-label>
              <h3>{{ notif.title }}</h3>
              <p>{{ notif.message }}</p>
              <span class="notif-date">{{ formatDate(notif.date) }}</span>
            </ion-label>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="danger" @click="deleteNotification(notif.id)">
              <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonIcon, IonButtons, IonButton,
  IonItemSliding, IonItemOptions, IonItemOption
} from '@ionic/vue';
import { notificationsOutline, notificationsOffOutline, trashOutline } from 'ionicons/icons';
import { useNotificationService } from '@/services/notificationService';
import { onMounted } from 'vue';

const { notifications, unreadCount, markAllAsRead, deleteNotification } = useNotificationService();

const formatDate = (date: any) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

onMounted(() => {
  // Mark as read when entering the page
  setTimeout(() => {
    markAllAsRead();
  }, 1000);
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80%;
  text-align: center;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.unread {
  --background: rgba(var(--ion-color-primary-rgb), 0.05);
}

.notif-icon {
  width: 40px;
  height: 40px;
  background: rgba(var(--ion-color-primary-rgb), 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.unread-dot::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background: var(--ion-color-danger);
  border: 2px solid white;
  border-radius: 50%;
}

ion-label h3 {
  font-weight: 700;
  margin-bottom: 4px;
}

ion-label p {
  font-size: 0.9rem;
  color: var(--ion-color-dark);
  margin-bottom: 4px;
}

.notif-date {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
}

@media (prefers-color-scheme: dark) {
  .unread-dot::after {
    border-color: #1a202c;
  }
}
</style>
