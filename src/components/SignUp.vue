<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';

const email = ref('');
const password = ref('');
const fullName = ref('');
const error = ref('');
const router = useRouter();

const handleSignup = async () => {
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        full_name: fullName.value,
      }
    }
  });

  if (signUpError) {
    error.value = signUpError.message;
  } else {
    router.push('/');
  }
};
</script>


<template>
  <div class="form">
    <form @submit.prevent="handleSignup">
    <h1>Sign up</h1>
    <p>Create an account</p>

    <input type="text" placeholder="Full Name" v-model="fullName" />
    <input type="text" placeholder="Email" v-model="email" />
    <input type="password" placeholder="Password" v-model="password" />
    
    <button type="submit">Sign up</button>

    <p class="error" v-if="error">{{ error }}</p>
    <p>If you already have an account, log in</p>
    <RouterLink to="/"><button type="button">Log in</button></RouterLink>
  </form>
  </div>
</template>

<style scoped>
.error {
  color: red;
  margin-top: 10px;
}

@import url('https://fonts.googleapis.com/css?family=Fjalla+One&display=swap');

body {
    background: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/38816/image-from-rawpixel-id-2210775-jpeg.jpg") center center no-repeat;
    background-size: cover;
    display: grid;
    align-items: center;
    justify-items: center;
    margin: 0;
    padding: 0;
}

.form {
    background: #f8f4e5;
    color: #ffa580;
    padding: 50px 100px;
    border: 2px solid rgba(0,0,0,1);
    box-shadow: 15px 15px 1px #ffa580, 15px 15px 1px 2px rgba(0,0,0,1);
}

input {
    display: block;
    font-size: 14pt;
    line-height: 28pt; /* 14pt * 2 */
    font-family: 'Fjalla One', sans-serif;
    margin-bottom: 28pt; /* 14pt * 2 */
    border: none;
    border-bottom: 5px solid rgba(0,0,0,1);
    background: #f8f4e5;
    padding-left: 5px;
    outline: none;
    color: rgba(0,0,0,1);
}

input:focus {
    border-bottom: 5px solid #ffa580;
}

button {
    display: block;
    margin: 0 auto;
    line-height: 28pt; /* 14pt * 2 */
    padding: 0 20px;
    background: #ffa580;
    letter-spacing: 2px;
    transition: .2s all ease-in-out;
    outline: none;
    border: 1px solid rgba(0,0,0,1);
    box-shadow: 3px 3px 1px 1px #95a4ff, 3px 3px 1px 2px rgba(0,0,0,1);
}

button:hover {
    background: rgba(0,0,0,1);
    color: white;
    border: 1px solid rgba(0,0,0,1);
}

::selection {
    background: #ffc8ff;
}

input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus {
    border-bottom: 5px solid #95a4ff;
    -webkit-text-fill-color: #2A293E;
    -webkit-box-shadow: 0 0 0px 1000px #f8f4e5 inset;
    transition: background-color 5000s ease-in-out 0s;
}

@media (max-width: 768px) {
  .form{
    padding: 25px 50px;
  }
}

</style>
