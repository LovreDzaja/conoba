<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';

import '../assets/css/Login.css';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const showReset = ref(false);
const resetEmail = ref('');
const resetMessage = ref('');
const resetError = ref('');

const showPassword = ref(false);

watch([email, password], () => {
  if (error.value) error.value = '';
});

watch(resetEmail, () => {
  if (resetError.value || resetMessage.value) {
    resetError.value = '';
    resetMessage.value = '';
  }
});

const sendPasswordReset = async () => {
  const { data, error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail.value, {
    redirectTo: 'http://localhost:5173/reset-password' 
  });

  if (resetErr) {
    resetError.value = resetErr.message;
    resetMessage.value = '';
  } else {
    resetMessage.value = 'Check your email for the password reset link.';
    resetError.value = '';
    resetEmail.value = '';
  }
};

const handleLogin = async () => {
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (authError) {
    error.value = authError.message;
  } else {
    localStorage.setItem('token', data.session.access_token);
    router.push('/home');
  }
};
</script>


<template>
  <div class="form">
    <form @submit.prevent="handleLogin">
      <h1>Log in</h1>

      <p>Welcome back!</p>

      <input type="text" placeholder="Email" class="input-field" v-model="email" />
      
      <div class="password-wrapper">
        <input :type="showPassword ? 'text' : 'password'" placeholder="Password" class="input-field" v-model="password" />
        <span class="toggle-eye" @click="showPassword = !showPassword">
          {{ showPassword ? '🙈' : '👁️' }}
        </span>
      </div>
      
      <button>Log in</button>

      <p class="error" v-if="error">{{ error }}</p>

      <p>If you do not have an account, sign up</p>

      <RouterLink to="/signup"><button type="button">Sign up</button></RouterLink>
    </form>
      <p class="forgot-password" @click="showReset = true">Forgot your password?</p>

      <div v-if="showReset" class="reset-box">
        <h2>Reset Password</h2>
        <p class="instructions">Enter your email and we’ll send you a reset link.</p>
        
        <input
          class="input-field"
          type="email"
          placeholder="Your email address"
          v-model="resetEmail"
        />
        
        <button @click="sendPasswordReset">Send Reset Email</button>
        
        <p class="success" v-if="resetMessage">{{ resetMessage }}</p>
        <p class="error" v-if="resetError">{{ resetError }}</p>
        
        <p class="back" @click="showReset = false">⬅ Back to login</p>
      </div> 
  </div>



</template>
