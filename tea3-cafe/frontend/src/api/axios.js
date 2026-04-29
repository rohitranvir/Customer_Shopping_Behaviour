import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

/* Attach JWT token if present */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('tea3_admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/* Global error handler */
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tea3_admin_token')
    }
    return Promise.reject(err)
  }
)

export default API
