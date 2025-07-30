import { Routes, Route, Navigate } from 'react-router-dom'
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react'
import { useClerkAuth } from './contexts/ClerkAuthContext'
import Layout from './components/Layout/Layout-Clerk'
import LoadingSpinner from './components/UI/LoadingSpinner'

// Import pages
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Products from './pages/Products'
import Sales from './pages/Sales'
import Orders from './pages/Orders'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import AIAssistant from './pages/AIAssistant-Gemini'
import UserManagement from './pages/UserManagement'
import OrganizationSettings from './pages/OrganizationSettings'

// Protected Route Component
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { hasPermission, isLoaded } = useClerkAuth()
  
  if (!isLoaded) {
    return <LoadingSpinner />
  }
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function App() {
  const { isSignedIn, isLoaded } = useAuth()
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PharmaCare</h1>
            <p className="text-gray-600">AI-Powered Pharmacy Management</p>
          </div>
        </div>
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Routes>
              <Route path="/sign-up/*" element={
                <SignUp 
                  routing="path" 
                  path="/sign-up"
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm',
                      card: 'shadow-none'
                    }
                  }}
                />
              } />
              <Route path="*" element={
                <SignIn 
                  routing="path" 
                  path="/sign-in"
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm',
                      card: 'shadow-none'
                    }
                  }}
                />
              } />
            </Routes>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="products" element={<Products />} />
        <Route path="sales" element={<Sales />} />
        <Route path="orders" element={<Orders />} />
        <Route path="reports" element={<Reports />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
        <Route path="settings" element={<Settings />} />
        <Route 
          path="users" 
          element={
            <ProtectedRoute requiredPermission="users:manage">
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="organization" 
          element={
            <ProtectedRoute requiredPermission="pharmacy:manage">
              <OrganizationSettings />
            </ProtectedRoute>
          } 
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
