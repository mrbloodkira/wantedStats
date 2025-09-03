import { createRouter, createWebHashHistory } from 'vue-router'

import Home from '../views/HomePage.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/dicas', component: () => import('../views/ComentariosWanteds.vue')},
  { path: '/coliseu', component: () => import('../views/ColiseuPlanner.vue')},
  { path: '/faq', component: () => import('../views/FrequentQuestions.vue')},
  //{ path: '/faq', component: () => import('../views/Faq.vue')},
  //{ path: '/blitz/:gameMode', component: () => import('../views/Blitz.vue')}, //lazy loading
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router