<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';

import '../assets/css/Login.css';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const showPassword = ref(false);
const showReset = ref(false);

const resetEmail = ref('');
const resetMessage = ref('');
const resetError = ref('');

watch([email, password], () => {
  if (error.value) error.value = '';
});

watch(resetEmail, () => {
  resetError.value = '';
  resetMessage.value = '';
});

const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

const sanitize = (str) => str.trim().replace(/[<>]/g, '');

const handleLogin = async () => {
  email.value = sanitize(email.value);
  password.value = password.value.trim();

  if (!isValidEmail(email.value)) {
    error.value = 'Please enter a valid email.';
    return;
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters.';
    return;
  }

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (authError) {
    error.value = authError.message.includes('Invalid login credentials')
      ? 'Invalid email or password.'
      : authError.message;
  } else {
    localStorage.setItem('token', data.session.access_token);
    router.push('/home');
  }
};

const sendPasswordReset = async () => {
  resetEmail.value = sanitize(resetEmail.value);

  if (!isValidEmail(resetEmail.value)) {
    resetError.value = 'Please enter a valid email.';
    return;
  }

  const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail.value, {
    redirectTo: 'https://conoba.vercel.app/reset-password'
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
        type="email"
        placeholder="Email"
        class="input-field"
        v-model="resetEmail"
      />

      <button @click="sendPasswordReset">Send Reset Email</button>

      <p class="success" v-if="resetMessage">{{ resetMessage }}</p>
      <p class="error" v-if="resetError">{{ resetError }}</p>

      <p class="back" @click="showReset = false">⬅ Back to login</p>
    </div>
  </div>
</template>