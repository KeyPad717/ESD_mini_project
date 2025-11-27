import React, { ReactElement } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import FacultyProfile from './components/FacultyProfile'
import NotFound from './components/NotFound'
import { AuthProvider, useAuth } from './context/AuthContext'
import './App.css'

type ProtectedRouteProps = {
  children: ReactElement
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/faculty"
              element={
                <ProtectedRoute>
                  <FacultyProfile />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
