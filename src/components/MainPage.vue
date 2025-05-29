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

const success = ref('');
const error = ref('');
const loading = ref(false);
const projects = ref([]);
const currentUser = ref(null);
const filter = ref('All');

const languages = ['JavaScript', 'Python', 'Vue', 'React', 'Node.js', 'All'];

const toggleForm = () => {
  showForm.value = !showForm.value;
  resetForm();
};

const fetchProjects = async () => {
  const { data, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (fetchError) error.value = fetchError.message;
  else projects.value = data;
};

const fetchUser = async () => {
  const { data, error: userError } = await supabase.auth.getUser();
  if (!userError && data?.user) currentUser.value = data.user;
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
    github: github.value,
    linkedin: linkedin.value,
    discord: discord.value,
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
</script>

<template>
  <div class="app-wrapper">
    <nav class="navbar">
      <h1>🚀 Project Board</h1>
      <div>
        <span v-if="currentUser" class="user">Logged in as: {{ currentUser.email }}</span>
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
        <p><strong>Language:</strong> {{ project.language }}</p>
        <p>{{ project.description }}</p>
        <p class="meta">Posted: {{ new Date(project.created_at).toLocaleString() }}</p>
        <div class="social-links">
          <a v-if="project.github" :href="project.github" target="_blank">GitHub</a>
          <a v-if="project.linkedin" :href="project.linkedin" target="_blank">LinkedIn</a>
          <span v-if="project.discord">Discord: {{ project.discord }}</span>
        </div>
        <div class="actions" v-if="project.user_id === currentUser?.id">
          <button @click="startEdit(project)">Edit</button>
          <button @click="handleDelete(project.id)">Delete</button>
        </div>
      </div>
    </div>
    <p v-else>No projects found.</p>

    <button class="fab" @click="toggleForm">{{ showForm ? '✖' : '+' }}</button>

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
          <input v-model="github" placeholder="GitHub (optional)" />
          <input v-model="linkedin" placeholder="LinkedIn (optional)" />
          <input v-model="discord" placeholder="Discord (optional)" />
          <button type="submit" :disabled="loading">
            {{ loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Post Project' }}
          </button>
          <p class="success" v-if="success">{{ success }}</p>
          <p class="error" v-if="error">{{ error }}</p>
          <button type="button" class="close-btn" @click="toggleForm">Close</button>
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
}

.app-wrapper {
  padding-bottom: 5rem;
  color: rgba(0, 0, 0, 1);
}

.navbar {
  background: #f8f4e5;
  padding: 1rem 2rem;
  border-bottom: 2px solid black;
  color: #ffa580;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.signout-btn {
  background: #ffa580;
  color: black;
  border: 1px solid black;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-family: 'Fjalla One', sans-serif;
  box-shadow: 3px 3px 1px 1px #95a4ff, 3px 3px 1px 2px black;
}

.filter-section {
  margin: 1rem auto;
  max-width: 600px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

select {
  font-family: 'Fjalla One', sans-serif;
  background: #f8f4e5;
  border-bottom: 5px solid black;
  padding: 0.5rem;
  outline: none;
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
  font-size: 2rem;
  background: #ffa580;
  color: black;
  border: 1px solid black;
  border-radius: 50%;
  padding: 0.6rem 1rem;
  box-shadow: 3px 3px 1px 1px #95a4ff, 3px 3px 1px 2px black;
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
</style>
