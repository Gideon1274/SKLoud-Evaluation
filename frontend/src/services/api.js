import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3333/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default {
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
}