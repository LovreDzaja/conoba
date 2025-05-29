<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase';
import router from '../../Router/Router';

const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

const title = ref('');
const description = ref('');
const language = ref('');
const github = ref('');
const linkedin = ref('');
const discord = ref('');
const username = ref('');


const success = ref('');
const error = ref('');
const loading = ref(false);
const projects = ref([]);
const currentUser = ref(null);
const filter = ref('All');

const languages = ['JavaScript', 'Python', 'Vue', 'React', 'Node.js', 'TypeScript', 'Go', 'PHP', 'Ruby', 'C#', 'C++', 'All'];

const toggleForm = () => {
  showForm.value = !showForm.value;
  resetForm();
};

const fetchProjects = async () => {
  const { data, error: fetchError } = await supabase
    .from('projects')
    .select(`
        id,
        title,
        description,
        language,
        github,
        linkedin,
        discord,
        created_at,
        user_id,
        profiles:profiles(full_name)
      `)
    .order('created_at', { ascending: false });

  if (fetchError) {
    error.value = fetchError.message;
  } else {
    projects.value = data;
  }
};

const fetchUser = async () => {
  const { data, error: userError } = await supabase.auth.getUser();
  if (!userError && data?.user) {
    currentUser.value = data.user;

    const fullName = data.user?.identities?.[0]?.identity_data?.full_name;
  if (fullName) {
    username.value = fullName;    
  }

  }
};

const resetForm = () => {
  title.value = '';
  description.value = '';
  language.value = '';
  github.value = '';
  linkedin.value = '';
  discord.value = '';
  success.value = '';
  error.value = '';
  isEditing.value = false;
  editingId.value = null;
};

const formatUrl = (url) => {
  if (!url) return '';
  return url.startsWith('https://') ? url : `https://${url}`;
};

const handleSubmit = async () => {
  error.value = '';
  success.value = '';
  loading.value = true;

  if (!currentUser.value?.id) {
    error.value = 'You must be logged in to post a project.';
    loading.value = false;
    return;
  }

  if (!github.value && !linkedin.value && !discord.value) {
    error.value = 'Please include at least one social contact.';
    loading.value = false;
    return;
  }

  const payload = {
    title: title.value,
    description: description.value,
    language: language.value,
    github: formatUrl(github.value),
    linkedin: formatUrl(linkedin.value),
    discord: formatUrl(discord.value),
    user_id: currentUser.value.id,
  };

  let result;
  if (isEditing.value && editingId.value) {
    result = await supabase.from('projects').update(payload).eq('id', editingId.value);
  } else {
    result = await supabase.from('projects').insert([payload]);
  }

  if (result.error) {
    error.value = result.error.message;
  } else {
    success.value = isEditing.value ? 'Project updated!' : 'Project posted!';
    fetchProjects();
    toggleForm();
  }
  loading.value = false;
};

const startEdit = (project) => {
  showForm.value = true;
  isEditing.value = true;
  editingId.value = project.id;
  title.value = project.title;
  description.value = project.description;
  language.value = project.language;
  github.value = project.github;
  linkedin.value = project.linkedin;
  discord.value = project.discord;
};

const handleDelete = async (id) => {
  const { error: deleteError } = await supabase.from('projects').delete().eq('id', id);
  if (deleteError) error.value = deleteError.message;
  else fetchProjects();
};

const handleSignOut = async () => {
  await supabase.auth.signOut();
  router.push('/');
};

const filteredProjects = computed(() =>
  filter.value === 'All'
    ? projects.value
    : projects.value.filter((p) => p.language === filter.value)
);

onMounted(() => {
  fetchProjects();
  fetchUser();
});
console.log( projects)
const firstHalf = computed(() => filter.value.slice(0, Math.ceil(filter.value.length / 2)));
const secondHalf = computed(() => filter.value.slice(Math.ceil(filter.value.length / 2)));
</script>

<template>
  <div class="app-wrapper">
    <nav class="navbar">
      <div class="logo-area">
        <h1>🛖<span class="project-title">Conoba</span>💻</h1>
      </div>
      <div class="user-area" v-if="currentUser">
        <span class="user-label">👤 {{ currentUser.identities[0].identity_data.full_name }}</span>
        <button @click="handleSignOut" class="signout-btn">Sign Out</button>
      </div>
    </nav>

    <div class="filter-section">
      <label for="filter">Filter by language:</label>
      <select id="filter" v-model="filter">
        <option v-for="lang in languages" :key="lang">{{ lang }}</option>
      </select>
    </div>

    <div class="project-list" v-if="filteredProjects.length">
      <div v-for="project in filteredProjects" :key="project.id" class="project-card">
        <h3>{{ project.title }}</h3>
        <p><strong>Posted by:</strong> {{ project.profiles?.full_name || 'Unknown user' }}</p>
        <p><strong>Language:</strong> {{ project.language }}</p>
        <p>{{ project.description }}</p>
        <p class="meta">Posted: {{ new Date(project.created_at).toLocaleString() }}</p>
        <div class="social-links">
          <a v-if="project.github" :href="project.github" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a v-if="project.linkedin" :href="project.linkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a v-if="project.discord" :href="project.discord" target="_blank" rel="noopener noreferrer">Discord</a>
        </div>
        <div class="actions" v-if="project.user_id === currentUser?.id">
          <button @click="startEdit(project)">Edit</button>
          <button @click="handleDelete(project.id)">Delete</button>
        </div>
      </div>
    </div>
    <div v-else class="notfound-wrapper">
      <h1 class="error-code">404</h1>
      <p class="message">Oops! There are no projects for this language:
        <h2>
          <span class="half-left">{{ firstHalf }}</span><span class="half-right">{{ secondHalf }}</span>
        </h2>
      </p>
    </div>

    <button class="fab" @click="toggleForm">
      <span :class="{ rotated: showForm }">{{ showForm ? '✖' : '✖' }}</span>
    </button>

    <transition name="fade">
      <div v-if="showForm" class="form-panel">
        <form @submit.prevent="handleSubmit">
          <h2>{{ isEditing ? 'Edit Project' : 'New Project' }}</h2>
          <input v-model="title" placeholder="Project Title" required />
          <textarea v-model="description" placeholder="Description" required></textarea>
          <select v-model="language" required>
            <option disabled value="">Select language</option>
            <option v-for="lang in languages.slice(0, -1)" :key="lang">{{ lang }}</option>
          </select>
          <input
            v-model="github"
            placeholder="GitHub (optional)"
            :class="{ invalid: github && !github.startsWith('http') }"
          />
          <input v-model="linkedin" placeholder="LinkedIn (optional)" :class="{ invalid: linkedin && !linkedin.startsWith('http') }" />
          <input v-model="discord" placeholder="Discord (optional)" :class="{ invalid: discord && !discord.startsWith('http') }"/>
          <button type="submit" :disabled="loading">
            {{ loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Post Project' }}
          </button>
          <p class="success" v-if="success">{{ success }}</p>
          <p class="error" v-if="error">{{ error }}</p>
        </form>
      </div>
    </transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Fjalla+One&display=swap');

body {
  background: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/38816/image-from-rawpixel-id-2210775-jpeg.jpg") center center no-repeat;
  background-size: cover;
  margin: 0;
  font-family: 'Fjalla One', sans-serif;
  overflow-x: hidden;
}

.app-wrapper {
  padding-bottom: 5rem;
  color: rgba(0, 0, 0, 1);
  max-width: 100%;
  overflow-x: hidden;
}

.navbar {
  background: #f8f4e5;
  padding: 1rem 2rem;
  border-bottom: 2px solid black;
  color: #ffa580;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  text-align: center;
}

.logo-area h1 {
  font-size: 2rem;
  margin: 0;
  white-space: nowrap;
}

.project-title {
  font-size: 2rem;
  font-weight: bold;
  color: #ffa580;
  margin-left: 0.5rem;
  white-space: nowrap;
}

.user-area {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  padding: 0.5rem 0;
}


.user-label {
  font-size: 1rem;
  color: #444;
  background: #fff1e6;
  padding: 0.4rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #ffa580;
  box-shadow: 2px 2px 0 #ffa580, 2px 2px 0 1px black;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.signout-btn {
  background: #ffa580;
  color: black;
  border: 1px solid black;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-family: 'Fjalla One', sans-serif;
  box-shadow: 3px 3px 1px 1px #95a4ff, 3px 3px 1px 2px black;
  cursor: pointer;
}

.filter-section {
  margin: 1rem auto;
  max-width: 700px;
  padding: 0 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
}

select {
  font-family: 'Fjalla One', sans-serif;
  background: #f8f4e5;
  border-bottom: 5px solid black;
  padding: 0.5rem;
  outline: none;
  min-width: 150px;
  flex: 1;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 700px;
  margin: auto;
  padding: 1rem;
}

.project-card {
  background-color: #f8f4e5;
  padding: 1rem 1.5rem;
  border: 2px solid black;
  box-shadow: 10px 10px 0 #ffa580, 10px 10px 0 2px black;
  border-radius: 10px;
  transition: transform 0.2s ease;
  word-wrap: break-word;
}

.project-card:hover {
  transform: scale(1.01);
}

.social-links a {
  color: #007bff;
  text-decoration: none;
  margin-right: 1rem;
}

.fab {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  width: 64px;
  height: 64px;
  font-size: 2rem;
  background: #ffa580;
  color: #A2C0F1;
  border: 1px solid black;
  border-radius: 50%;
  box-shadow: 3px 3px 1px 1px #95a4ff, 3px 3px 1px 2px black;
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  text-align: center;
}

.fab span {
  display: inline-block;
  transform: rotate(-45deg);
  color: #4169e1;
  text-shadow: 1px 1px 0 #8989d1;
  transition: transform 0.3s ease;
}

.fab span.rotated {
  transform: rotate(0deg);
}

.fab:hover {
  background: #ffbe91;
}

.form-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f8f4e5;
  color: black;
  padding: 2rem;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -3px 20px rgba(0, 0, 0, 0.3);
  font-family: 'Fjalla One', sans-serif;
  z-index: 999;
}

input, textarea, select {
  font-family: 'Fjalla One', sans-serif;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.75rem;
  font-size: 1rem;
  border: none;
  border-bottom: 5px solid black;
  background: #f8f4e5;
  color: black;
  outline: none;
  box-sizing: border-box;
}

input:focus, textarea:focus, select:focus {
  border-bottom-color: #ffa580;
}

button[type="submit"], .actions button {
  background: #ffa580;
  border: 1px solid black;
  color: black;
  font-family: 'Fjalla One', sans-serif;
  padding: 0.5rem 1rem;
  box-shadow: 3px 3px 1px 1px #95a4ff, 3px 3px 1px 2px black;
  cursor: pointer;
  transition: 0.2s ease;
}

button:hover {
  background: #526A69;
  color: white;
}

.close-btn {
  background: transparent;
  color: #888;
  font-size: 1rem;
  cursor: pointer;
  font-family: 'Fjalla One', sans-serif;
  margin-top: 1rem;
  border: none;
}

.success {
  color: green;
  font-weight: bold;
}
.error {
  color: red;
  font-weight: bold;
}

.invalid {
  border-bottom: 5px solid red;
}

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

.half-left {
  color: #ffa580;
}
.half-right {
  color: #95a4ff;
}

/* ✅ RESPONSIVE QUERIES */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .project-title {
    font-size: 1.7rem;
  }

  .project-card {
    box-shadow: 6px 6px 0 #ffa580, 6px 6px 0 2px black;
  }

  .form-panel {
    padding: 1.2rem;
  }

  .fab {
    bottom: 1.2rem;
    right: 1.2rem;
    width: 50px;
    font-size: 2rem;
    height: 50px;
    line-height: 60px;
  }
}

@media (max-width: 480px) {
 .navbar {
    flex-direction: column;
    align-items: stretch;
  }

  .logo-area {
    justify-content: center;
    text-align: center;
    width: 100%;
  }

  .user-area {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 0.5rem;
  }

  .user-label, .signout-btn {
    font-size: 0.85rem;
    padding: 0.3rem 0.6rem;
  }

  .logo-area h1 {
    font-size: 1.4rem;
    white-space: nowrap;
  }

  .filter-section {
    padding: 0 0.5rem;
  }

  .project-title {
    font-size: 1.5rem;
  }

  .form-panel {
    padding: 1rem 0.75rem;
  }
  
  .fab {
    color: #95a4ff;
    width: 48px;
    height: 48px;
    font-size: 2rem;
    bottom: 1rem;
    right: 1rem;
    height: 50px;
    line-height: 50px;
  }

  .error-code {
    font-size: 3rem;
  }

  .message {
    font-size: 1.1rem;
  }
}


</style>
