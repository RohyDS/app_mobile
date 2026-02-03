import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import Signup from '@/views/Signup.vue';
import Connexion from '@/views/Connexion.vue';

const routes: Array<RouteRecordRaw> = [
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
        path: 'tab1',
        redirect: '/tabs/tab1'
      },
      {
        path: 'signup',
        component: () => import('@/views/Signup.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
