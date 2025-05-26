import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: 'https://cekgetir.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
  retry: 3,
  retryDelay: 1000
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

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // If the error is a timeout or network error and we haven't retried yet
    if ((error.code === 'ECONNABORTED' || !error.response) && config && !config.__retryCount) {
      config.__retryCount = config.__retryCount || 0;
      
      if (config.__retryCount < config.retry) {
        config.__retryCount += 1;
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, config.retryDelay));
        
        // Retry the request
        return api(config);
      }
    }

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