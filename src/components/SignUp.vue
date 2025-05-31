<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';

import '../assets/css/Signup.css';

const email = ref('');
const password = ref('');
const fullName = ref('');
const error = ref('');
const router = useRouter();

const showPassword = ref(false);

watch([email, password], () => {
  if (error.value) error.value = '';
});

const handleSignup = async () => {
  error.value = '';
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        full_name: fullName.value,
      },
    },
  });


  if (signUpError) {
    error.value = signUpError.message;
    return;
  }

  const {
    data: sessionData,
    error: sessionError
  } = await supabase.auth.getSession();

  const userId = sessionData?.session?.user?.id;

  if (sessionError || !userId) {
    error.value = 'User session not ready';
    return;
  }

  if (profileError) {
    error.value = 'Failed to create profile: ' + profileError.message;
    return;
  }

  router.push('/');
};


</script>


<template>
  <div class="form">
    <form @submit.prevent="handleSignup">
    <h1>Sign up</h1>
    <p>Create an account</p>

    <input type="text" class="input-field" placeholder="Full Name" v-model="fullName" />
    <input type="text" class="input-field" placeholder="Email" v-model="email" />

    <div class="password-wrapper">
      <input :type="showPassword ? 'text' : 'password'" placeholder="Password" class="input-field" v-model="password" />
      <span class="toggle-eye" @click="showPassword = !showPassword">
         {{ showPassword ? '🙈' : '👁️' }}
      </span>
     </div>
    
    <button type="submit">Sign up</button>

    <p class="error" v-if="error">{{ error }}</p>
    <p>If you already have an account, log in</p>
    <RouterLink to="/"><button type="button">Log in</button></RouterLink>
  </form>
  </div>
</template>
