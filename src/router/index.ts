import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import Signup from '@/views/Signup.vue';
import Connexion from '@/views/Connexion.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Connexion,
  },
  {
    path: '/signup',
    component: Signup,
  },
  {
    path: '/accueil',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/accueil/reparations'
      },
      {
        path: 'reparations',
        component: () => import('@/views/MesReparations.vue')
      },
      {
        path: 'panne',
        component: () => import('@/views/SignalerPanne.vue')
      },
      {
        path: 'profil',
        component: () => import('@/views/Profil.vue')
      },
      {
        path: 'notifications',
        component: () => import('@/views/Notifications.vue')
      },
      {
        path: 'payments',
        component: () => import('@/views/Payments.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
