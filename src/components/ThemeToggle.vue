<template>
  <button class="theme-toggle" @click="toggleTheme">
    {{ theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode' }}
  </button>

      <div ref="ripple" class="theme-ripple" />

</template>

<script setup>
import { ref } from 'vue'

const theme = ref(localStorage.getItem('theme') || 'light')
const ripple = ref(null)

const toggleTheme = (event) => {
  const newTheme = theme.value === 'dark' ? 'light' : 'dark'

  const circle = ripple.value
  const diameter = Math.max(window.innerWidth, window.innerHeight) * 2

  circle.style.width = `${diameter}px`
  circle.style.height = `${diameter}px`
  circle.style.left = `${event.clientX}px`
  circle.style.top = `${event.clientY}px`
  circle.classList.remove('active') 
  void circle.offsetWidth
  circle.classList.add('active')

  setTimeout(() => {
    document.documentElement.setAttribute('data-theme', newTheme)
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
  }, 150)

  setTimeout(() => {
    circle.classList.remove('active')
  }, 800)
}
</script>

<style scoped>
.theme-toggle {
  position: sticky;
  background: var(--accent-color);
  border: 2px solid black;
  padding: 0.5rem 1rem;
  font-family: 'Fjalla One', sans-serif;
  cursor: pointer;
  box-shadow: 3px 3px 1px var(--shadow-color), 3px 3px 1px 2px black;
  color: var(--button-text);
  transition: all 0.3s ease;
}
</style>
