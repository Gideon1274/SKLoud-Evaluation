<script setup>
import { ref, computed, unref, watch, onMounted } from 'vue'
import { useAuth } from './composables/useAuth'
import { useTasks, statusLabel } from './composables/useTasks'
import LoginPage from './components/LoginPage.vue'
import TaskBoard from './components/TaskBoard.vue'
import TaskModal from './components/TaskModal.vue'
import ConfirmModal from './components/ConfirmModal.vue'

const { user, isAuthenticated, logout } = useAuth()

const {
  tasks,
  loading,
  errorMessage,
  filterStatus,
  filterPriority,
  search,
  hasActiveFilters,
  tasksByStatus,
  fetchTasks,
  clearFilters,
  saveTask,
  moveTask,
  removeTask,
} = useTasks(isAuthenticated)

// ---------- Create / edit modal ----------
const showModal = ref(false)
const editingTask = ref(null)
const saving = ref(false)

const openCreateModal = () => {
  editingTask.value = null
  showModal.value = true
}

const openEditModal = (task) => {
  editingTask.value = task
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTask.value = null
}

const showBoard = computed(() => {
  // A status filter is active: show the board only if that status has tasks
  if (filterStatus.value) {
    const groups = unref(tasksByStatus) ?? {}
    return (groups[filterStatus.value]?.length ?? 0) > 0
  }
  // No status filter: keep the original behavior
  return tasks.value.length > 0 || hasActiveFilters.value
})

const handleSave = async (form) => {
  saving.value = true
  try {
    await saveTask(form, editingTask.value?.id ?? null)
    closeModal()
  } catch (err) {
    errorMessage.value = 'Error saving task. Please check your inputs.'
    console.error(err)
  } finally {
    saving.value = false
  }
}

// ---------- Confirmations ----------
// confirm = { kind: 'move' | 'delete', task, status? }
const confirm = ref(null)

const handleMove = (task, newStatus) => {
  // Moving a completed task back to To Do / In Progress needs confirmation.
  if (task.status === 'completed' && newStatus !== 'completed') {
    confirm.value = { kind: 'move', task, status: newStatus }
    return
  }
  moveTask(task, newStatus)
}

const requestDelete = () => {
  if (editingTask.value) confirm.value = { kind: 'delete', task: editingTask.value }
}

const onConfirm = async () => {
  const action = confirm.value
  confirm.value = null
  if (!action) return
  if (action.kind === 'move') {
    await moveTask(action.task, action.status)
  } else {
    await removeTask(action.task.id)
    closeModal()
  }
}

const handleLogout = async () => {
  await logout()
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
        <div class="titles">
          <h1>TaskFlow</h1>
          <p class="welcome">Welcome back, {{ user?.fullName || user?.email?.split('@')[0] }}</p>
        </div>
      </div>
      <div class="header-right">
        <button class="ui-btn ui-btn-primary" @click="openCreateModal">+ Add New Task</button>
        <button class="ui-btn ui-btn-ghost" @click="handleLogout">Logout</button>
      </div>
    </header>

    <main class="content">
      <div class="toolbar">
        <div class="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="search"
            class="ui-input"
            type="search"
            placeholder="Search tasks..."
            aria-label="Search tasks"
          />
        </div>

        <select v-model="filterStatus" class="ui-input filter" aria-label="Filter by status" @change="fetchTasks()">
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select v-model="filterPriority" class="ui-input filter" aria-label="Filter by priority" @change="fetchTasks()">
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button v-if="hasActiveFilters" class="clear-btn" @click="clearFilters">Clear</button>
      </div>

      <div v-if="errorMessage" class="state-msg error" role="alert">
        {{ errorMessage }}
        <button class="dismiss" aria-label="Dismiss" @click="errorMessage = ''">✕</button>
      </div>

      <div v-if="loading && tasks.length === 0" class="state-msg">Loading tasks...</div>
      <div v-else-if="!errorMessage && tasks.length === 0" class="state-msg">
        {{ hasActiveFilters ? 'No tasks match your filters.' : 'No tasks found. Create one to get started!' }}
      </div>

      <TaskBoard
        v-if="showBoard"
        :tasks-by-status="tasksByStatus"
        :status-filter="filterStatus"
        @edit="openEditModal"
        @move="handleMove"
      />
    </main>

    <TaskModal
      v-if="showModal"
      :task="editingTask"
      :saving="saving"
      @save="handleSave"
      @delete="requestDelete"
      @close="closeModal"
    />

    <ConfirmModal
      v-if="confirm?.kind === 'move'"
      title="Reopen this task?"
      :message="`“${confirm.task.title}” is already completed. Move it back to ${statusLabel(confirm.status)}?`"
      :confirm-text="`Move to ${statusLabel(confirm.status)}`"
      @confirm="onConfirm"
      @cancel="confirm = null"
    />

    <ConfirmModal
      v-if="confirm?.kind === 'delete'"
      title="Delete this task?"
      :message="`“${confirm.task.title}” will be permanently deleted. This can't be undone.`"
      confirm-text="Delete"
      danger
      @confirm="onConfirm"
      @cancel="confirm = null"
    />
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
  gap: 16px;
  padding: 20px 40px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.logo-mini {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.titles {
  min-width: 0;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 40px 40px;
}

/* ---------- Search + filters ---------- */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.search {
  position: relative;
  flex: 1 1 260px;
  max-width: 420px;
}

.search svg {
  position: absolute;
  left: 12px;
  top: 50%;
  width: 18px;
  height: 18px;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
}

.search .ui-input {
  padding-left: 38px;
}

.filter {
  width: auto;
  min-width: 150px;
}

.clear-btn {
  background: transparent;
  border: none;
  color: #60a5fa;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 4px;
}

.clear-btn:hover {
  color: #93c5fd;
  text-decoration: underline;
}

/* ---------- States ---------- */
.state-msg {
  position: relative;
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
  font-size: 15px;
}

.state-msg.error {
  padding: 14px 44px 14px 16px;
  margin-bottom: 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #f87171;
  font-size: 14px;
}

.dismiss {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  padding: 6px;
}

/* ---------- Responsive ---------- */
@media (max-width: 900px) {
  .app-header {
    padding: 16px 20px;
  }

  .content {
    padding: 20px 16px 32px;
  }
}

@media (max-width: 640px) {
  .app-header {
    flex-wrap: wrap;
  }

  .header-right {
    width: 100%;
  }

  .header-right .ui-btn-primary {
    flex: 1;
  }

  .search {
    flex-basis: 100%;
    max-width: none;
  }

  .filter {
    flex: 1 1 calc(50% - 6px);
    min-width: 0;
  }

  .clear-btn {
    margin-left: auto;
  }
}

@media (max-width: 420px) {
  .welcome {
    display: none;
  }
}
</style>
