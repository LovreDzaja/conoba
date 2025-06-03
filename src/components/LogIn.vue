<template>
  <div class="login-container">
    <div class="project-intro">
      <h1 class="project-title">Conoba</h1>
      <p class="project-tagline">Your smart collaborative board</p>
    </div>

    <div class="form">
      <form @submit.prevent="handleLogin">
        <h2>Log in</h2>

        <p>Welcome back!</p>

        <input type="text" placeholder="Email" class="input-field" v-model="email" />
        
        <div class="password-wrapper">
          <input :type="showPassword ? 'text' : 'password'" placeholder="Password" class="input-field" v-model="password" />
          <span class="toggle-eye" @click="showPassword = !showPassword">
            {{ showPassword ? '🙈' : '👁️' }}
          </span>
        </div>
        
        <button class="primary-button">Log in</button>

        <p class="error" v-if="error">{{ error }}</p>

        <p>If you do not have an account, sign up</p>
        <RouterLink to="/signup"><button type="button" class="secondary-button">Sign up</button></RouterLink>
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

        <button class="primary-button" @click="sendPasswordReset">Send Reset Email</button>

        <p class="success" v-if="resetMessage">{{ resetMessage }}</p>
        <p class="error" v-if="resetError">{{ resetError }}</p>

        <p class="back" @click="showReset = false">⬅ Back to login</p>
      </div>
    </div>
  </div>
</template>
<style scoped>

.project-intro {
  max-width: 350px;
  text-align: left;
  font-family: 'Fjalla One', sans-serif;
  color: #2a293e;
}

.project-title {
  font-size: 3rem;
  margin: 0;
  color: #ffa580;
}

.project-tagline {
  font-size: 1.2rem;
  margin-top: 0.5rem;
  color: #7c6e65;
}

@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
    text-align: center;
  }

  .project-intro {
    text-align: center;
    max-width: 100%;
  }

  .intro-image {
    max-width: 70%;
    margin: 1rem auto 0;
  }
}

</style>