import { createRouter, createWebHistory } from "vue-router"
import LogIn from "../src/components/LogIn.vue"
import SignUp from "../src/components/SignUp.vue"
import App from "../src/App.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: App
    },
    {
      path: '/login',
      name: 'login',
      component: LogIn
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUp
    },
  ]
})

export default router