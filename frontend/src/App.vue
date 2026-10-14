<script setup>
import { ref, computed, onMounted } from 'vue'
import api from './services/api'

// State
const tasks = ref([])
const loading = ref(false)
const errorMessage = ref('')
const filterStatus = ref('')
const filterPriority = ref('')

// Form state
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

// Fetch Tasks
const fetchTasks = async () => {
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

// Open modal for create
const openCreateModal = () => {
  isEditing.value = false
  currentTaskId.value = null
  form.value = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' }
  showModal.value = true
}

// Open modal for edit
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

// Save Task (Create or Update)
const saveTask = async () => {
  if (!form.value.title.trim()) return

  try {
    if (isEditing.value) {
      const response = await api.updateTask(currentTaskId.value, form.value)
      const index = tasks.value.findIndex(t => t.id === currentTaskId.value)
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

// Quick status toggle
const updateStatus = async (task, newStatus) => {
  try {
    const response = await api.updateTask(task.id, { status: newStatus })
    task.status = response.data.status
  } catch (err) {
    alert('Failed to update task status')
  }
}

// Delete Task
const deleteTask = async (id) => {
  if (!confirm('Are you sure you want to delete this task?')) return

  try {
    await api.deleteTask(id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  } catch (err) {
    alert('Failed to delete task')
    console.error(err)
  }
}

// Format date helper
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString()
}

// Check if overdue
const isOverdue = (dateStr, status) => {
  if (!dateStr || status === 'completed') return false
  return new Date(dateStr) < new Date()
}

onMounted(fetchTasks)
</script>

<template>
  <div class="container">
    <header class="header">
      <h1>Task Management App</h1>
      <button class="btn-primary" @click="openCreateModal">+ Add New Task</button>
    </header>

    <!-- Filters -->
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

    <!-- Error / Loading States -->
    <div v-if="loading" class="state-msg">Loading tasks...</div>
    <div v-if="errorMessage" class="state-msg error">{{ errorMessage }}</div>
    <div v-if="!loading && tasks.length === 0 && !errorMessage" class="state-msg">
      No tasks found. Create one to get started!
    </div>

    <!-- Task List -->
    <div class="task-grid" v-if="!loading && tasks.length > 0">
      <div v-for="task in tasks" :key="task.id" class="task-card" :class="{ 'completed': task.status === 'completed' }">
        <div class="task-header">
          <h3>{{ task.title }}</h3>
          <span class="badge" :class="task.priority">{{ task.priority }}</span>
        </div>
        
        <p class="description" v-if="task.description">{{ task.description }}</p>
        
        <div class="task-meta" v-if="task.dueDate">
          <span :class="{ 'overdue': isOverdue(task.dueDate, task.status) }">
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

    <!-- Modal Form (Create / Edit) -->
    <div v-if="showModal" class="modal-overlay">
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
.container {
  max-width: 900px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: Arial, sans-serif;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}
.filters select, .form-group input, .form-group select, .form-group textarea {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}
.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.task-card {
  background: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.task-card.completed {
  opacity: 0.7;
  background: #f6f8fa;
}
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
.task-header h3 {
  margin: 0;
  font-size: 18px;
}
.badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  font-weight: bold;
}
.badge.low { background: #e2f0d9; color: #385723; }
.badge.medium { background: #fff2cc; color: #7f6000; }
.badge.high { background: #f8cecc; color: #c00000; }

.description {
  color: #586069;
  font-size: 14px;
  margin-bottom: 12px;
}
.task-meta {
  font-size: 12px;
  color: #6a737d;
  margin-bottom: 12px;
}
.overdue {
  color: #d73a49;
  font-weight: bold;
}
.task-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eaecef;
  padding-top: 12px;
}
.action-buttons {
  display: flex;
  gap: 8px;
}
.btn-primary {
  background: #2ea44f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.btn-secondary {
  background: #e1e4e8;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-edit {
  background: #0366d6;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-delete {
  background: #d73a49;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.state-msg {
  text-align: center;
  padding: 40px;
  color: #586069;
}
.state-msg.error {
  color: #d73a49;
}
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}
.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 13px;
}
.form-row {
  display: flex;
  gap: 15px;
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