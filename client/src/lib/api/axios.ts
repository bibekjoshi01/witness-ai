import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'
import { toast } from 'sonner'
import { PUBLIC_ACCESS_TOKEN } from '@/constants/public/tokens'

const noAuthRoutes = ['/auth/basic']

// Constructing the base URL dynamically using environment variables.
export const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

// Main Axios instance
export const axiosInstance = axios.create({
  baseURL,
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!window.navigator.onLine) {
      toast.error('No internet connection available.')
    }

    config.headers = config.headers || {}

    const accessToken = Cookies.get(PUBLIC_ACCESS_TOKEN)

    const isExemptRoute = noAuthRoutes.some((path) => config?.url?.includes(path))
    if (accessToken && !isExemptRoute) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }

    // Set appropriate Content-Type
    if (config?.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data'
    } else {
      config.headers['Content-Type'] = 'application/json'
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    if (axios.isCancel(error)) {
      toast.error(`Request canceled: ${error.message}`)
    } else if (error.message === 'No Internet') {
      toast.error('Please check your internet connection.')
    } else if (error.toJSON().message === 'Network Error') {
      toast.error('Network Error.')
    }
    else if (error.response?.status === 401) {
      const { store } = await import('@/lib/redux/store')
      const { logoutSuccess } = await import('@/app/(auth)/redux/auth.slice')
      store.dispatch(logoutSuccess())
      toast.error('Session expired. Please login again.')
    }
    else if (error.response?.status === 403) {
      toast.error('Permission denied.')
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.')
    } else if (error.response?.status === 405) {
      toast.error('Method not allowed.')
    } else if (error.response?.status === 500 || error.response?.status > 500) {
      toast.error('Server error, try again later.')
    }

    throw error
  }
)
