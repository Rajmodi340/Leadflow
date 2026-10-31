import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // On mount: try to restore session from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (token && storedUser) {
        try {
          // Verify token is still valid
          const res = await authService.getMe()
          setUser(res.data.user)
        } catch (err) {
          // Token expired or invalid
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }
      setLoading(false)
      setInitialized(true)
    }

    initAuth()
  }, [])

  const register = useCallback(async (data) => {
    const res = await authService.register(data)
    if (res.success) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      setUser(res.data.user)
      toast.success('Account created successfully!')
    }
    return res
  }, [])

  const login = useCallback(async (data) => {
    const res = await authService.login(data)
    if (res.success) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      setUser(res.data.user)
      toast.success(`Welcome back, ${res.data.user.name}!`)
    }
    return res
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (err) {
      // Ignore errors on logout
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  const value = {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    register,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
