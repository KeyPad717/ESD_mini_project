import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { facultyAPI } from '../services/api'
import type { Faculty } from '../types/api'
import './FacultyList.css'

const FacultyList: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    void fetchFaculty()
  }, [])

  const fetchFaculty = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await facultyAPI.getAll()
      if (response.data.success) {
        setFaculty(response.data.data ?? [])
        setError(null)
      }
    } catch (err) {
      setError('Failed to fetch faculty data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) {
      return
    }

    try {
      await facultyAPI.delete(id)
      await fetchFaculty()
    } catch (err) {
      alert('Failed to delete faculty member')
      console.error(err)
    }
  }

  if (loading) {
    return <div className="loading">Loading faculty data...</div>
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Faculty Management</h1>
          {user && <p className="user-info">Welcome, {user.name}</p>}
        </div>
        <button onClick={() => void logout()} className="btn logout-btn">
          Logout
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="table-header">
          <h2>Faculty Members</h2>
          <button 
            onClick={() => navigate('/faculty/new')} 
            className="btn btn-primary"
          >
            + Add New Faculty
          </button>
        </div>

        {faculty.length === 0 ? (
          <p className="no-data">No faculty members found. Add one to get started.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Title</th>
                <th>Department</th>
                <th>Courses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map((f) => (
                <tr key={f.employeeId}>
                  <td>{f.employeeId}</td>
                  <td>{f.firstName} {f.lastName}</td>
                  <td>{f.email}</td>
                  <td>{f.title || 'N/A'}</td>
                  <td>{f.department?.name || 'N/A'}</td>
                  <td>{f.courses?.length ?? 0} course(s)</td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => navigate(`/faculty/edit/${f.employeeId}`)}
                        className="btn btn-secondary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(f.employeeId)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default FacultyList

