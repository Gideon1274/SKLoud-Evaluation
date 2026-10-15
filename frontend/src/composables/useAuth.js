import { ref, computed } from 'vue'
import api from '../services/api'

const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))
const token = ref(localStorage.getItem('auth_token') || '')

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)

  const setAuth = (userData, authToken) => {
    user.value = userData
    token.value = authToken
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('auth_user', JSON.stringify(userData))
  }

  const clearAuth = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  const login = async (credentials) => {
    const response = await api.login(credentials)
    setAuth(response.data.data.user, response.data.data.token)
    return response.data.data
  }

  const signup = async (data) => {
    const response = await api.signup(data)
    setAuth(response.data.data.user, response.data.data.token)
    return response.data.data
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch (e) {
      // ignore
    }
    clearAuth()
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    signup,
    logout,
  }
}
