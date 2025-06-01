<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../supabase';
import router from '../../Router/Router';


import '../assets/css/MainPage.css';

const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

const title = ref('');
const description = ref('');
const language = ref([]);
const github = ref('');
const linkedin = ref('');
const discord = ref('');
const username = ref('');


const success = ref('');
const error = ref('');
const loading = ref(false);
const projects = ref([]);
const currentUser = ref(null);
const filter = ref([]);


const languages = ['JavaScript', 'Python', 'Vue', 'React', 'Node.js', 'TypeScript', 'Go', 'PHP', 'Ruby', 'C#', 'C++', 'All'];

watch(filter, ()=>{
  currentPage.value = 1;
})

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
    projects.value = data.map(project => {
      let normalizedLanguages;

      try {
        const parsed = JSON.parse(project.language);
        normalizedLanguages = Array.isArray(parsed) ? parsed : [project.language];
      } catch {
        normalizedLanguages = [project.language];
      }

      return {
        ...project,
        language: normalizedLanguages,
      };
    });

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
  language.value = [];
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

const toggleFilterLanguage = (lang) => {
  const index = filter.value.indexOf(lang);
  if (index > -1) {
    filter.value.splice(index, 1); 
  } else {
    filter.value.push(lang);
  }
};

const filteredProjects = computed(() => {
  if (!filter.value.length || filter.value.includes('All')) return projects.value;

  return projects.value.filter(project => {
    const langs = project.language || [];
    return filter.value.every(lang => langs.includes(lang));
  });
});

const currentPage = ref(1);
const itemsPerPage = 5;

const totalPages = computed(() => {
  return Math.ceil(filteredProjects.value.length / itemsPerPage);
});

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProjects.value.slice(start, end);
});

onMounted(() => {
  fetchProjects();
  fetchUser();
});

const selectedLanguagesText = computed(() => {
  return filter.value.length > 0 ? filter.value.join(', ') : 'N/A';
});

</script>

<template>
  <div class="app-wrapper">
    <nav class="navbar">
      <div class="nav-side">
        <span class="user-label">👤 lovre</span>
      </div>

      <div class="logo-area">
        <h1>🛖 <span class="project-title">Conoba</span> 💻</h1>
      </div>

      <div class="nav-side right">
        <button @click="handleSignOut" class="signout-btn">Sign Out</button>
      </div>
    </nav>


    <div class="filter-section">
      <label for="filter">Filter by language:</label>
      <div class="filter-section">
        <div class="lang-filter">
          <button
            v-for="lang in languages.slice(0, -1)"
            :key="'filter-' + lang"
            :class="{ active: filter.includes(lang) }"
            type="button"
            @click="toggleFilterLanguage(lang)"
          >
            {{ lang }}
          </button>
        </div>
      </div>
    </div>

    <div class="project-list" v-if="filteredProjects.length">
      <div v-for="project in paginatedProjects" :key="project.id" class="project-card">        <h3>{{ project.title }}</h3>
        <p><strong>Posted by:</strong> {{ project.profiles?.full_name || 'Unknown user' }}</p>
        <p><strong>{{project.language.length > 1 ? 'Languages:' : 'Language: '}}</strong> 
        <span
          v-for="(lang, index) in project.language"
          :key="'selected-' + lang"
          :class="[index % 2 === 0 ? 'half-left' : 'half-right', 'lang-pill']"
        >
          {{ lang }}<span v-if="project.language.length > 1 && index < project.language.length - 1"> \ </span>
        </span>
        </p>
        <p>{{ project.description }}</p>
        <p class="meta">Posted: {{ new Date(project.created_at).toLocaleString() }}</p>
        <div class="social-links">
          <a v-if="project.github" :href="project.github" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a v-if="project.linkedin" :href="project.linkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a v-if="project.discord" :href="project.discord" target="_blank" rel="noopener noreferrer">Discord</a>
        </div>
        <div class="actions-inline" v-if="project.user_id === currentUser?.id">
          <button class="edit-btn" @click="startEdit(project)">Edit</button>
          <button class="delete-btn" @click="handleDelete(project.id)">Delete</button>
        </div>

      </div>
    </div>
    <div class="pagination" v-if="totalPages > 1">
      <button @click="currentPage--" :disabled="currentPage === 1">Previous</button>

      <button
        v-for="page in totalPages"
        :key="'page-' + page"
        @click="currentPage = page"
        :class="{ active: currentPage === page }"
      >
        {{ page }}
      </button>

      <button @click="currentPage++" :disabled="currentPage === totalPages">Next</button>
    </div>

    <div v-else class="notfound-wrapper">
      <h1 class="error-code">404</h1>
      <p class="message">Oops! There are no projects for this language:
        <div class="selected-langs">
          <button
            v-for="(lang, index) in filter"
            :key="'selected-' + lang"
            :class="[index % 2 === 0 ? 'half-left-buttons' : 'half-right-buttons']"
          >
            {{ lang }}
          </button>
        </div>
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
          <div class="lang-selector">
            <button
              v-for="lang in languages.slice(0, -1)"
              :key="'lang-select-' + lang"
              :class="{ active: language.includes(lang) }"
              type="button"
              @click="() => {
                const index = language.indexOf(lang);
                if (index > -1) {
                  language.splice(index, 1);
                } else {
                  language.push(lang);
                }
              }"
            >
              {{ lang }}
            </button>
          </div>

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


</style>