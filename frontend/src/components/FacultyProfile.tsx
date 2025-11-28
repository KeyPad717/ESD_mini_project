import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { facultyAPI, departmentAPI, courseAPI } from '../services/api'
import type { Faculty, Department, Course } from '../types/api'
import './FacultyList.css'

const FacultyProfile: React.FC = () => {
    const [faculty, setFaculty] = useState<Faculty | null>(null)
    const [departments, setDepartments] = useState<Department[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        id: 0,
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        title: '',
        departmentId: 0,
        courseIds: [] as number[]
    })
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const { logout, user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        void fetchProfile()
        void fetchDepartments()
        void fetchCourses()
    }, [])

    // Cleanup preview URL on unmount or when it changes
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const fetchProfile = async (): Promise<void> => {
        try {
            setLoading(true)
            setError(null)
            const response = await facultyAPI.getCurrentProfile()

            if (response.data.success && response.data.data) {
                setFaculty(response.data.data)
                // Initialize form data
                setFormData({
                    id: response.data.data.id,
                    employeeId: response.data.data.employeeId || '',
                    firstName: response.data.data.firstName,
                    lastName: response.data.data.lastName,
                    email: response.data.data.email,
                    title: response.data.data.title || '',
                    departmentId: response.data.data.department?.departmentId || 0,
                    courseIds: response.data.data.courses?.map(c => c.courseId) || []
                })
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to fetch profile. Your email may not be registered in the system.'
            setError(message)
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

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

    const handleUpdate = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        console.log('Submitting update with formData:', formData)
        try {
            // 1. Upload photo if selected
            if (selectedFile) {
                const photoResponse = await facultyAPI.uploadPhoto(selectedFile)
                if (!photoResponse.data.success) {
                    throw new Error('Failed to upload photo')
                }
            }

            // 2. Update profile details
            const response = await facultyAPI.updateCurrentProfile(formData)
            console.log('Update response:', response.data)

            if (response.data.success) {
                alert('Profile updated successfully!')
                setIsEditing(false)
                setSelectedFile(null)
                setPreviewUrl(null)
                await fetchProfile()
            } else {
                alert('Failed to update profile: ' + (response.data.message || 'Unknown error'))
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Unknown error'
            console.error('Update error details:', err.response?.data || err)
            alert('Failed to update profile: ' + errorMessage)
        }
    }

    const handleCourseToggle = (courseId: number): void => {
        setFormData(prev => ({
            ...prev,
            courseIds: prev.courseIds.includes(courseId)
                ? prev.courseIds.filter(id => id !== courseId)
                : [...prev.courseIds, courseId]
        }))
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setSelectedFile(file)

            // Create preview URL
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setSelectedFile(null)
        setPreviewUrl(null)
        // Reset form data to current faculty values
        if (faculty) {
            setFormData({
                id: faculty.id,
                employeeId: faculty.employeeId || '',
                firstName: faculty.firstName,
                lastName: faculty.lastName,
                email: faculty.email,
                title: faculty.title || '',
                departmentId: faculty.department?.departmentId || 0,
                courseIds: faculty.courses?.map(c => c.courseId) || []
            })
        }
    }

    if (loading) {
        return <div className="loading">Loading your profile...</div>
    }

    if (error) {
        return (
            <div className="container">
                <div className="header">
                    <h1>Faculty Profile</h1>
                </div>
                <div className="error-container">
                    <div className="access-denied-card">
                        <h2>⚠️ Access Denied</h2>
                        <p>{error}</p>
                        <p>Please contact your administrator to register your account.</p>
                        <button
                            onClick={async () => {
                                try {
                                    await logout()
                                } catch (e) {
                                    window.location.replace('/login')
                                }
                            }}
                            className="btn btn-primary"
                            style={{ marginTop: '20px' }}
                        >
                            Back to Sign In
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!faculty) {
        return <div className="loading">No profile data available</div>
    }

    // Determine image source: preview URL > faculty photo path > placeholder
    const imageSource = previewUrl ||
        (faculty.photographPath ? `http://localhost:8080/${faculty.photographPath}` : 'https://via.placeholder.com/150');

    return (
        <div className="container">
            <div className="header">
                <div>
                    <h1>My Profile</h1>
                    {user && <p className="user-info">Logged in as: {user.email}</p>}
                </div>
                <button onClick={() => void logout()} className="btn logout-btn">
                    Logout
                </button>
            </div>

            <div className="card">
                <div className="profile-header-section">
                    <div className="profile-photo-container">
                        <img
                            src={imageSource}
                            alt="Profile"
                        />
                        {isEditing && (
                            <label htmlFor="photo-upload" className="photo-upload-overlay">
                                <span className="photo-upload-label">Change Photo</span>
                                <input
                                    id="photo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        )}
                    </div>
                    <div className="profile-title-info">
                        <h2>{faculty.firstName} {faculty.lastName}</h2>
                        <p>{faculty.title || 'Faculty Member'}</p>
                        <p>{faculty.department?.name}</p>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <button
                            onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                            className={isEditing ? "btn btn-secondary" : "btn edit-btn-floating"}
                        >
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                {!isEditing ? (
                    <div className="profile-view">
                        <div className="profile-row">
                            <span className="profile-label">Employee ID</span>
                            <span className="profile-value">{faculty.employeeId || 'N/A'}</span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Email Address</span>
                            <span className="profile-value">{faculty.email}</span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Courses Taught</span>
                            <div className="profile-value">
                                {faculty.courses && faculty.courses.length > 0 ? (
                                    <div className="course-list">
                                        {faculty.courses.map(course => (
                                            <div key={course.courseId} className="course-chip">
                                                <span className="course-code">{course.courseCode}</span>
                                                {course.name}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No courses assigned</span>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} className="edit-form">
                        <div className="form-group">
                            <label>Employee ID</label>
                            <input
                                type="text"
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled
                            />
                            <small>Email cannot be changed</small>
                        </div>
                        <div className="form-group">
                            <label>Designation / Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <select
                                value={formData.departmentId}
                                onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) })}
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
                            <label>Select Courses</label>
                            <div className="checkbox-group">
                                {courses.map(course => {
                                    // Check if course is taken by another faculty
                                    // It is taken if it has a faculty name AND it is not in the current user's initial course list
                                    const isMyCourse = faculty.courses?.some(c => c.courseId === course.courseId);
                                    const isTaken = course.faculty && !isMyCourse;

                                    return (
                                        <label key={course.courseId} className={`checkbox-label ${isTaken ? 'disabled' : ''}`} style={isTaken ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                                            <input
                                                type="checkbox"
                                                checked={formData.courseIds.includes(course.courseId)}
                                                onChange={() => handleCourseToggle(course.courseId)}
                                                disabled={!!isTaken}
                                            />
                                            <span>
                                                <strong style={{ color: 'var(--primary)' }}>{course.courseCode}</strong> {course.name}
                                                {isTaken && (
                                                    <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: 'var(--danger)', fontStyle: 'italic' }}>
                                                        (Taken by {course.faculty})
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" onClick={handleCancel} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default FacultyProfile
