<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase';
import { useRouter } from 'vue-router';

const router = useRouter();
const newPassword = ref('');
const confirmPassword = ref('');
const error = ref('');
const success = ref('');
const loading = ref(true);

const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

onMounted(async () => {
  const { data, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !data.session) {
    error.value = 'Invalid or expired session. Please try the reset link again.';
  }
  loading.value = false;
});

const updatePassword = async () => {
  error.value = '';
  success.value = '';

  if (newPassword.value.length < 6) {
    error.value = 'Password must be at least 6 characters long.';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.';
    return;
  }

  const { data, error: updateError } = await supabase.auth.updateUser({
    password: newPassword.value,
  });

  if (updateError) {
    error.value = updateError.message;
  } else {
    success.value = 'Your password has been updated!';
    setTimeout(() => router.push('/'), 1000); 
  }
};
</script>

<template>
  <div class="reset-container">
    <h1>🔐 Reset Password</h1>

    <p v-if="loading">Loading session...</p>

   <form v-else @submit.prevent="updatePassword">
    <div class="password-wrapper">
        <input
        :type="showNewPassword ? 'text' : 'password'"
        placeholder="New password"
        v-model="newPassword"
        required
        />
        <span class="toggle-eye" @click="showNewPassword = !showNewPassword">
        {{ showNewPassword ? '🙈' : '👁️' }}
        </span>
    </div>

    <div class="password-wrapper">
        <input
        :type="showConfirmPassword ? 'text' : 'password'"
        placeholder="Confirm password"
        v-model="confirmPassword"
        required
        />
        <span class="toggle-eye" @click="showConfirmPassword = !showConfirmPassword">
        {{ showConfirmPassword ? '🙈' : '👁️' }}
        </span>
    </div>

    <button type="submit">Update Password</button>
    </form>


    <p class="error" v-if="error">{{ error }}</p>
    <p class="success" v-if="success">{{ success }}</p>
  </div>
</template>

<style scoped>
.reset-container {
  background: #f8f4e5;
  color: #000;
  padding: 3rem;
  max-width: 400px;
  margin: 5rem auto;
  border: 2px solid black;
  box-shadow: 10px 10px 0 #ffa580, 10px 10px 0 2px black;
  font-family: 'Fjalla One', sans-serif;
  border-radius: 12px;
  text-align: center;
}

input {
  display: block;
  width: 100%;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  padding: 0.75rem;
  border: none;
  border-bottom: 5px solid black;
  background: #f8f4e5;
  outline: none;
}

input:focus {
  border-bottom-color: #ffa580;
}

button {
  background: #ffa580;
  color: black;
  border: 1px solid black;
  padding: 0.5rem 1rem;
  font-family: 'Fjalla One', sans-serif;
  box-shadow: 3px 3px 1px 1px #95a4ff, 3px 3px 1px 2px black;
  cursor: pointer;
}

button:hover {
  background: black;
  color: white;
}

.error {
  color: red;
  margin-top: 1rem;
}

.success {
  color: green;
  margin-top: 1rem;
}

.password-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 1.5rem;
}

.password-wrapper input {
  color: black; 
  padding-left: 0.5rem; 
}

.toggle-eye {
  position: absolute;
  right: -15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1.2rem;
  user-select: none;
  color: #555;
}


</style>
