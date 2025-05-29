import { createRouter, createWebHistory } from "vue-router"
import LogIn from "../src/components/LogIn.vue"
import SignUp from "../src/components/SignUp.vue"
import MainPage from "../src/components/MainPage.vue"
import App from "../src/App.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LogIn
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUp
    },
    {
      path: '/home',
      name: 'mainPage',
      component: MainPage,
    }
  ]
})

export default router