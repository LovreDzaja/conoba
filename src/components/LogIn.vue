<script setup>
import { ref } from 'vue';
import axios from 'axios';

const email = ref('');
const password = ref('');
const error = ref('');

const handleLogin = async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/login',{
      email: email.value,
      password: password.value,
    });

    localStorage.setItem('token', res.data.token);

    router.push('/');
  } catch (error) {
    error.value = err.response?.data?.error || 'Login failed'
  }
}

</script>

<template>
  <form class="forme" @submit.prevent="handleLogin">
    <h1>Log in</h1>
    <p>Welcome back!</p>
    <input type="text" placeholder="Email" v-model="email" />
    <input type="password" placeholder="Password" v-model="password" />
    <button>Log in</button>
    <p>If you do not have an account, sign up</p>
    <p class="error" v-if="error">{{ error }}</p>
    <RouterLink to="/signup"><button>Sign up</button></RouterLink>
  </form>
</template>

<style scoped>
.error {
  color: red;
  margin-top: 10px;
}
</style>
