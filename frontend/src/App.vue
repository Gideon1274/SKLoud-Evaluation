<script setup>
import { ref, onMounted, watch } from 'vue'
import api from './services/api'
import { useAuth } from './composables/useAuth'
import LoginPage from './components/LoginPage.vue'

const { user, isAuthenticated, logout } = useAuth()

const tasks = ref([])
const loading = ref(false)
const errorMessage = ref('')
const filterStatus = ref('')
const filterPriority = ref('')

const showModal = ref(false)
const isEditing = ref(false)
const currentTaskId = ref(null)
const form = ref({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
})

const fetchTasks = async () => {
  if (!isAuthenticated.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    const params = {}
    if (filterStatus.value) params.status = filterStatus.value
    if (filterPriority.value) params.priority = filterPriority.value

    const response = await api.getTasks(params)
    tasks.value = response.data
  } catch (err) {
    errorMessage.value = 'Failed to load tasks. Check if backend is running.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  currentTaskId.value = null
  form.value = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' }
  showModal.value = true
}

const openEditModal = (task) => {
  isEditing.value = true
  currentTaskId.value = task.id
  form.value = {
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
  }
  showModal.value = true
}

const saveTask = async () => {
  if (!form.value.title.trim()) return

  try {
    if (isEditing.value) {
      const response = await api.updateTask(currentTaskId.value, form.value)
      const index = tasks.value.findIndex((t) => t.id === currentTaskId.value)
      if (index !== -1) tasks.value[index] = response.data
    } else {
      const response = await api.createTask(form.value)
      tasks.value.unshift(response.data)
    }
    showModal.value = false
    fetchTasks()
  } catch (err) {
    alert('Error saving task. Please check your inputs.')
    console.error(err)
  }
}

const updateStatus = async (task, newStatus) => {
  try {
    const response = await api.updateTask(task.id, { status: newStatus })
    task.status = response.data.status
  } catch (err) {
    alert('Failed to update task status')
  }
}

const deleteTask = async (id) => {
  if (!confirm('Are you sure you want to delete this task?')) return

  try {
    await api.deleteTask(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
  } catch (err) {
    alert('Failed to delete task')
    console.error(err)
  }
}

const handleLogout = async () => {
  await logout()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString()
}

const isOverdue = (dateStr, status) => {
  if (!dateStr || status === 'completed') return false
  return new Date(dateStr) < new Date()
}

const statusLabel = (status) => {
  const map = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' }
  return map[status] || status
}

onMounted(fetchTasks)

watch(isAuthenticated, (authed) => {
  if (authed) {
    tasks.value = []
    fetchTasks()
  }
})
</script>

<template>
  <LoginPage v-if="!isAuthenticated" />

  <div v-else class="app-container">
    <header class="app-header">
      <div class="header-left">
        <div class="logo-mini">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="4" fill="#3b82f6" />
            <path d="M8 12l3 3 5-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div>
          <h1>TaskFlow</h1>
          <p class="welcome">Welcome back, {{ user?.fullName || user?.email?.split('@')[0] }}</p>
        </div>
      </div>
      <div class="header-right">
        <button class="btn-primary" @click="openCreateModal">+ Add New Task</button>
        <button class="btn-logout" @click="handleLogout">Logout</button>
      </div>
    </header>

    <div class="content">
      <div class="filters">
        <select v-model="filterStatus" @change="fetchTasks">
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select v-model="filterPriority" @change="fetchTasks">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div v-if="loading" class="state-msg">Loading tasks...</div>
      <div v-if="errorMessage" class="state-msg error">{{ errorMessage }}</div>
      <div v-if="!loading && tasks.length === 0 && !errorMessage" class="state-msg">
        No tasks found. Create one to get started!
      </div>

      <div class="task-grid" v-if="!loading && tasks.length > 0">
        <div v-for="task in tasks" :key="task.id" class="task-card" :class="{ completed: task.status === 'completed' }">
          <div class="task-header">
            <h3>{{ task.title }}</h3>
            <span class="badge" :class="task.priority">{{ task.priority }}</span>
          </div>

          <p class="description" v-if="task.description">{{ task.description }}</p>

          <div class="task-meta" v-if="task.dueDate">
            <span :class="{ overdue: isOverdue(task.dueDate, task.status) }">
              📅 Due: {{ formatDate(task.dueDate) }}
              <span v-if="isOverdue(task.dueDate, task.status)" class="overdue-text">(Overdue)</span>
            </span>
          </div>

          <div class="task-actions">
            <select :value="task.status" @change="updateStatus(task, $event.target.value)">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <div class="action-buttons">
              <button @click="openEditModal(task)" class="btn-edit">Edit</button>
              <button @click="deleteTask(task.id)" class="btn-delete">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h2>{{ isEditing ? 'Edit Task' : 'Create New Task' }}</h2>
        <form @submit.prevent="saveTask">
          <div class="form-group">
            <label>Title *</label>
            <input v-model="form.title" type="text" required placeholder="Task title..." />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" placeholder="Optional details..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Status</label>
              <select v-model="form.status">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div class="form-group">
              <label>Priority</label>
              <select v-model="form.priority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Due Date</label>
            <input v-model="form.dueDate" type="date" />
          </div>

          <div class="modal-actions">
            <button type="button" @click="showModal = false" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #0f172a;
  color: #e2e8f0;
  font-family: system-ui, -apple-system, sans-serif;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-mini {
  width: 40px;
  height: 40px;
}

.logo-mini svg {
  width: 100%;
  height: 100%;
}

.app-header h1 {
  margin: 0;
  font-size: 22px;
  color: #ffffff;
  font-weight: 700;
}

.welcome {
  margin: 2px 0 0;
  font-size: 13px;
  color: #94a3b8;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 40px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 24px;
}

.filters select,
.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 14px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
}

.filters select:focus,
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.task-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.2s;
}

.task-card:hover {
  border-color: #475569;
}

.task-card.completed {
  opacity: 0.6;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.task-header h3 {
  margin: 0;
  font-size: 17px;
  color: #ffffff;
  font-weight: 600;
}

.badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: 700;
  white-space: nowrap;
}

.badge.low {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.badge.medium {
  background: rgba(234, 179, 8, 0.15);
  color: #facc15;
}

.badge.high {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.description {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.task-meta {
  font-size: 13px;
  color: #64748b;
}

.overdue {
  color: #f87171;
  font-weight: 600;
}

.overdue-text {
  color: #f87171;
}

.task-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #334155;
  padding-top: 14px;
  gap: 10px;
}

.task-actions select {
  padding: 6px 10px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #334155;
  color: #e2e8f0;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.btn-logout {
  background: transparent;
  color: #94a3b8;
  border: 1px solid #334155;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-logout:hover {
  color: #f87171;
  border-color: #f87171;
}

.btn-edit {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}

.btn-delete {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}

.state-msg {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
  font-size: 15px;
}

.state-msg.error {
  color: #f87171;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal {
  background: #1e293b;
  padding: 28px;
  border-radius: 12px;
  width: 440px;
  max-width: 90%;
  border: 1px solid #334155;
}

.modal h2 {
  margin: 0 0 20px;
  color: #ffffff;
  font-size: 22px;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #cbd5e1;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  min-height: 70px;
}

.form-row {
  display: flex;
  gap: 14px;
}

.form-row .form-group {
  flex: 1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
