import { createRouter, createWebHistory } from "vue-router"
import { supabase } from '../src/supabase';

import LogIn from "../src/components/LogIn.vue"
import SignUp from "../src/components/SignUp.vue"
import MainPage from "../src/components/MainPage.vue"
import NotFound from "../src/components/NotFound.vue";
import ResetPassword from "../src/components/ResetPassword.vue";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPassword
    },
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
      meta: { requiresAuth: true }
    },
    { 
      path: '/:catchAll(.*)',
      component: NotFound 
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (to.meta.requiresAuth && !user) {
    next('/');
  } else {
    next();
  }
});

export default router