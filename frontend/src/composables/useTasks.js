import { ref, computed } from 'vue'
import api from '../services/api'

export const STATUSES = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
]

export const statusLabel = (status) => STATUSES.find((s) => s.key === status)?.label || status

export function useTasks(isAuthenticated) {
  const tasks = ref([])
  const loading = ref(false)
  const errorMessage = ref('')

  // Filters: status + priority are sent to the API (same as before), search is applied locally.
  const filterStatus = ref('')
  const filterPriority = ref('')
  const search = ref('')

  const hasActiveFilters = computed(
    () => !!(filterStatus.value || filterPriority.value || search.value.trim())
  )

  const visibleTasks = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return tasks.value
    return tasks.value.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
    )
  })

  const tasksByStatus = computed(() => {
    const grouped = { todo: [], in_progress: [], completed: [] }
    for (const task of visibleTasks.value) {
      if (grouped[task.status]) grouped[task.status].push(task)
    }
    return grouped
  })

  const fetchTasks = async ({ silent = false } = {}) => {
    if (!isAuthenticated.value) return
    if (!silent) loading.value = true
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

  const clearFilters = () => {
    filterStatus.value = ''
    filterPriority.value = ''
    search.value = ''
    fetchTasks()
  }

  /** Create or update a task. Throws on failure so the caller can keep the modal open. */
  const saveTask = async (form, id = null) => {
    if (id) {
      const response = await api.updateTask(id, form)
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) tasks.value[index] = response.data
    } else {
      const response = await api.createTask(form)
      tasks.value.unshift(response.data)
    }
    fetchTasks({ silent: true })
  }

  /** Optimistically move a task to another status; rolls back if the API call fails. */
  const moveTask = async (task, newStatus) => {
    if (task.status === newStatus) return
    const previous = task.status
    task.status = newStatus
    try {
      const response = await api.updateTask(task.id, { status: newStatus })
      task.status = response.data?.status || newStatus
    } catch (err) {
      task.status = previous
      errorMessage.value = 'Failed to update task status.'
      console.error(err)
    }
  }

  const removeTask = async (id) => {
    try {
      await api.deleteTask(id)
      tasks.value = tasks.value.filter((t) => t.id !== id)
    } catch (err) {
      errorMessage.value = 'Failed to delete task.'
      console.error(err)
    }
  }

  return {
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
  }
}
