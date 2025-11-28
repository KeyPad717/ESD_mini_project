import axios, { AxiosResponse } from 'axios'
import type { ApiResponse, Course, Department, Faculty, FacultyFormPayload } from '../types/api'

const API_BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized - Redirect to login
      if (error.response.status === 401) {
        // Only redirect if we're not already on the login page to avoid loops
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const facultyAPI = {
  // Get current logged-in faculty member's profile
  getCurrentProfile: (): Promise<AxiosResponse<ApiResponse<Faculty>>> => api.get('/faculty/me'),

  // Update current logged-in faculty member's profile
  updateCurrentProfile: (data: FacultyFormPayload): Promise<AxiosResponse<ApiResponse<Faculty>>> =>
    api.put('/faculty/me', data),

  // Upload photo for current user
  uploadPhoto: (file: File): Promise<AxiosResponse<ApiResponse<string>>> => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/faculty/me/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export const departmentAPI = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Department[]>>> => api.get('/departments')
}

export const courseAPI = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Course[]>>> => api.get('/courses')
}

export default api
