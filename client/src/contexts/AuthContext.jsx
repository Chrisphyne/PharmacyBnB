import { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    default:
      return state
  }
}

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      try {
        // For demo mode, if token exists, assume valid and create demo user
        if (token.startsWith('demo-jwt-token-')) {
          const demoUser = {
            id: 1,
            name: 'Admin User',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@pharmacy.co.ke',
            role: 'ADMIN',
            pharmacy: 'PharmaCare Central'
          }
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: demoUser,
              token
            }
          })
        } else {
          // For production, use actual API call
          // const response = await authService.verifyToken(token)
          localStorage.removeItem('token')
          dispatch({ type: 'LOGOUT' })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        dispatch({ type: 'LOGOUT' })
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Demo credentials - replace with actual API call
      const demoUsers = {
        'admin@pharmacy.co.ke': {
          id: 1,
          name: 'Admin User',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@pharmacy.co.ke',
          role: 'ADMIN',
          pharmacy: 'PharmaCare Central'
        },
        'pharmacist@pharmacy.co.ke': {
          id: 2,
          name: 'John Pharmacist',
          firstName: 'John',
          lastName: 'Pharmacist',
          email: 'pharmacist@pharmacy.co.ke',
          role: 'PHARMACIST',
          pharmacy: 'PharmaCare Central'
        },
        'cashier@pharmacy.co.ke': {
          id: 3,
          name: 'Jane Cashier',
          firstName: 'Jane',
          lastName: 'Cashier',
          email: 'cashier@pharmacy.co.ke',
          role: 'CASHIER',
          pharmacy: 'PharmaCare Central'
        }
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const user = demoUsers[email]
      
      if (user && password.includes('123')) {
        const token = 'demo-jwt-token-' + Date.now()
        
        // Store token in localStorage
        localStorage.setItem('token', token)
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        })
        
        toast.success(`Welcome back, ${user.firstName}!`)
        return { success: true }
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Invalid credentials' })
        toast.error('Invalid email or password')
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      if (!error.message?.includes('Invalid')) {
        toast.error(errorMessage)
      }
      throw error
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await authService.register(userData)
      
      if (response.success) {
        const { user, token } = response.data
        
        // Store token in localStorage
        localStorage.setItem('token', token)
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        })
        
        toast.success(`Welcome to the pharmacy system, ${user.firstName}!`)
        return { success: true }
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message })
        toast.error(response.message || 'Registration failed')
        return { success: false, error: response.message }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      dispatch({ type: 'LOGOUT' })
      toast.success('Logged out successfully')
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData)
      
      if (response.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.user
        })
        toast.success('Profile updated successfully')
        return { success: true }
      } else {
        toast.error(response.message || 'Failed to update profile')
        return { success: false, error: response.message }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const changePassword = async (passwordData) => {
    try {
      const response = await authService.changePassword(passwordData)
      
      if (response.success) {
        toast.success('Password changed successfully')
        return { success: true }
      } else {
        toast.error(response.message || 'Failed to change password')
        return { success: false, error: response.message }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!state.user) return false
    
    const rolePermissions = {
      ADMIN: ['*'], // Admin has all permissions
      PHARMACIST: [
        'inventory:read', 'inventory:write', 'inventory:delete',
        'products:read', 'products:write', 'products:delete',
        'sales:read', 'sales:write',
        'orders:read', 'orders:write',
        'suppliers:read', 'suppliers:write',
        'reports:read',
        'knowledge:read', 'knowledge:write'
      ],
      PHARMACY_TECHNICIAN: [
        'inventory:read', 'inventory:write',
        'products:read', 'products:write',
        'sales:read', 'sales:write',
        'orders:read',
        'knowledge:read'
      ],
      CASHIER: [
        'inventory:read',
        'products:read',
        'sales:read', 'sales:write'
      ],
      INVENTORY_MANAGER: [
        'inventory:read', 'inventory:write', 'inventory:delete',
        'products:read', 'products:write', 'products:delete',
        'orders:read', 'orders:write', 'orders:delete',
        'suppliers:read', 'suppliers:write',
        'reports:read'
      ]
    }

    const userPermissions = rolePermissions[state.user.role] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    hasPermission,
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}