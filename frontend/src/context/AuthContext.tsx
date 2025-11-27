import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode
} from 'react'
import axios from 'axios'

interface AuthUser {
  name?: string
  email?: string
  picture?: string
}

interface AuthContextValue {
  isAuthenticated: boolean
  user: AuthUser | null
  loading: boolean
  login: () => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

type AuthProviderProps = {
  children: ReactNode
}

// Create BroadcastChannel for cross-tab communication
// const authChannel = new BroadcastChannel('auth_channel')

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  /* 
  // Removed single-tab enforcement logic
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // ...
    }
    authChannel.addEventListener('message', handleMessage)
    return () => {
      authChannel.removeEventListener('message', handleMessage)
    }
  }, [])
  */

  const login = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Clear cookies immediately on client side
      document.cookie.split(";").forEach(function (c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Call backend logout
      await axios.post(
        'http://localhost:8080/api/auth/logout',
        {},
        {
          withCredentials: true
        }
      )
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear state
      setIsAuthenticated(false)
      setUser(null)

      // Small delay to ensure cookies are cleared
      setTimeout(() => {
        window.location.replace('/login')
      }, 100)
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/auth/user', {
        withCredentials: true
      })

      if (response.data.success && response.data.data) {
        setUser(response.data.data)
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.log('Not authenticated:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void checkAuth()
  }, [checkAuth])

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
