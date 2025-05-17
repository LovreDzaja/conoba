<script setup>

</script>

<template>
  <form class="forme" @submit.prevent="handleLogin">
    <h1>Sign up</h1>
    <p>Welcome back!</p>
    <input type="text" placeholder="Email" v-model="email" />
    <br/>
    <input type="password" placeholder="Password" v-model="password" />
    <br/>
    <button>Sign up</button>
    <p>If you do have an account, log in</p>
    <RouterLink to="/login"><button>Log in</button></RouterLink>
  </form>
</template>

<style scoped>

</style>
