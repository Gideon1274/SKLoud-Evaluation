import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3333/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default {
  login(credentials) {
    return apiClient.post('/auth/login', credentials)
  },
  signup(data) {
    return apiClient.post('/auth/signup', data)
  },
  logout() {
    return apiClient.post('/account/logout')
  },
  getProfile() {
    return apiClient.get('/account/profile')
  },
  getTasks(params) {
    return apiClient.get('/tasks', { params })
  },
  createTask(taskData) {
    return apiClient.post('/tasks', taskData)
  },
  updateTask(id, taskData) {
    return apiClient.put(`/tasks/${id}`, taskData)
  },
  deleteTask(id) {
    return apiClient.delete(`/tasks/${id}`)
  },
  getTrash() {
    return apiClient.get('/tasks/trash')
  },
  bulkUpdateStatus(ids, status) {
    return apiClient.post('/tasks/bulk/status', { ids, status })
  },
  bulkTrashTasks(ids) {
    return apiClient.post('/tasks/bulk/trash', { ids })
  },
  restoreTasks(ids) {
    return apiClient.post('/tasks/bulk/restore', { ids })
  },
  purgeTasks(ids) {
    return apiClient.post('/tasks/bulk/purge', { ids })
  },
}
