import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken') || Cookies.get('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token'ı temizle
      localStorage.removeItem('adminToken')
      Cookies.remove('adminToken')
      // Login sayfasına yönlendir
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export default api 