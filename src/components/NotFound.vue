<template>
  <div class="notfound-wrapper">
    <h1 class="error-code">404</h1>
    <p class="message">Oops! The page you're looking for doesn't exist.</p>
    <router-link to="/" class="home-link">← Back to Home</router-link>
  </div>
</template>

<script setup>
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Fjalla+One&display=swap');

.notfound-wrapper {
  font-family: 'Fjalla One', sans-serif;
  text-align: center;
  padding: 5rem 2rem;
  color: black;
  background: #f8f4e5;
  border: 2px solid black;
  margin: 5rem auto;
  max-width: 600px;
  box-shadow: 10px 10px 0 #ffa580, 10px 10px 0 2px black;
  border-radius: 20px;
}

.error-code {
  font-size: 6rem;
  color: #ffa580;
  margin-bottom: 1rem;
}

.message {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.home-link {
  text-decoration: none;
  color: black;
  background: #ffa580;
  border: 1px solid black;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  box-shadow: 3px 3px 1px 1px #95a4ff, 3px 3px 1px 2px black;
  transition: background 0.2s ease;
}

.home-link:hover {
  background: #526A69;
  color: white;
}
</style>
