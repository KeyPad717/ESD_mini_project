import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { facultyAPI, departmentAPI, courseAPI } from '../services/api'
import type { Course, Department, FacultyFormPayload, Faculty } from '../types/api'
import './FacultyForm.css'

type FormState = {
  firstName: string
  lastName: string
  email: string
  title: string
  departmentId: string
}

const FacultyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [formData, setFormData] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    title: '',
    departmentId: ''
  })

  const [departments, setDepartments] = useState<Department[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    void fetchDepartments()
    void fetchCourses()
    if (isEdit && id) {
      void fetchFaculty(id)
    }
  }, [id, isEdit])

  const fetchDepartments = async (): Promise<void> => {
    try {
      const response = await departmentAPI.getAll()
      if (response.data.success) {
        setDepartments(response.data.data ?? [])
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err)
    }
  }

  const fetchCourses = async (): Promise<void> => {
    try {
      const response = await courseAPI.getAll()
      if (response.data.success) {
        setCourses(response.data.data ?? [])
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err)
    }
  }

  const fetchFaculty = async (facultyId: string): Promise<void> => {
    try {
      setLoading(true)
      const response = await facultyAPI.getById(facultyId)
      if (response.data.success) {
        const data = response.data.data as Faculty
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          title: data.title || '',
          departmentId: data.department?.departmentId?.toString() ?? ''
        })
        setSelectedCourses(data.courses?.map((c) => c.courseId) ?? [])
        if (data.photographPath) {
          setPhotoPreview(`http://localhost:8080/${data.photographPath}`)
        }
      }
    } catch (err) {
      setError('Failed to fetch faculty data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCourseChange = (courseId: number): void => {
    setSelectedCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((idValue) => idValue !== courseId)
      }
      return [...prev, courseId]
    })
  }

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(typeof reader.result === 'string' ? reader.result : null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const submitData: FacultyFormPayload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        title: formData.title.trim() || null,
        departmentId: Number(formData.departmentId),
        courseIds: selectedCourses
      }

      if (isEdit && id) {
        await facultyAPI.update(id, submitData)
        if (photoFile) {
          await facultyAPI.uploadPhoto(id, photoFile)
        }
      } else {
        const response = await facultyAPI.create(submitData)
        const createdId = response.data.data?.employeeId
        if (photoFile && createdId) {
          await facultyAPI.uploadPhoto(createdId, photoFile)
        }
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/faculty')
      }, 1500)
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } }
      setError(apiError.response?.data?.message || 'Failed to save faculty data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) {
    return <div className="loading">Loading faculty data...</div>
  }

  return (
    <div className="container">
      <div className="header">
        <h1>{isEdit ? 'Edit Faculty' : 'Add New Faculty'}</h1>
        <button onClick={() => void logout()} className="btn logout-btn">
          Logout
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Faculty {isEdit ? 'updated' : 'created'} successfully!</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Professor, Associate Professor"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Department *</label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.departmentId} value={dept.departmentId}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Photograph</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="photo-preview" />
            )}
          </div>

          <div className="form-group">
            <label>Courses</label>
            <div className="course-checkboxes">
              {courses.map(course => (
                <label key={course.courseId} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.courseId)}
                    onChange={() => handleCourseChange(course.courseId)}
                  />
                  <span>{course.courseCode} - {course.name}</span>
                </label>
              ))}
            </div>
            {courses.length === 0 && (
              <p className="no-courses">No courses available</p>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/faculty')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FacultyForm

