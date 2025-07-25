import { Routes, Route, Navigate } from 'react-router-dom'
import { SignIn, SignUp, useUser } from '@clerk/clerk-react'
import { useClerkAuth } from './contexts/ClerkAuthContext'
import Layout from './components/Layout/Layout-Clerk'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Products from './pages/Products'
import Sales from './pages/Sales'
import Orders from './pages/Orders'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import AIAssistant from './pages/AIAssistant'
import UserManagement from './pages/UserManagement'
import OrganizationSettings from './pages/OrganizationSettings'
import LoadingSpinner from './components/UI/LoadingSpinner'
import { motion } from 'framer-motion'

function App() {
  const { isSignedIn } = useUser()
  const { loading, hasPermission } = useClerkAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading PharmaCare AI System...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Authentication routes */}
        <Route 
          path="/sign-in/*" 
          element={
            isSignedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
                >
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-4">
                      <span className="text-white text-2xl font-bold">💊</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">PharmaCare AI</h1>
                    <p className="text-gray-600">Sign in to your pharmacy</p>
                  </div>
                  <SignIn 
                    routing="path" 
                    path="/sign-in" 
                    redirectUrl="/dashboard"
                    appearance={{
                      elements: {
                        formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                        footerActionLink: 'text-blue-600 hover:text-blue-700'
                      }
                    }}
                  />
                </motion.div>
              </div>
            )
          } 
        />
        
        <Route 
          path="/sign-up/*" 
          element={
            isSignedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
                >
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-4">
                      <span className="text-white text-2xl font-bold">💊</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">PharmaCare AI</h1>
                    <p className="text-gray-600">Create your pharmacy account</p>
                  </div>
                  <SignUp 
                    routing="path" 
                    path="/sign-up" 
                    redirectUrl="/dashboard"
                    appearance={{
                      elements: {
                        formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                        footerActionLink: 'text-blue-600 hover:text-blue-700'
                      }
                    }}
                  />
                </motion.div>
              </div>
            )
          } 
        />
        
        {/* Protected routes */}
        {isSignedIn ? (
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
            
            {/* Admin-only routes */}
            {hasPermission('users:manage') && (
              <Route path="users" element={<UserManagement />} />
            )}
            
            {hasPermission('pharmacy:manage') && (
              <Route path="organization" element={<OrganizationSettings />} />
            )}
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/sign-in" replace />} />
        )}
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to={isSignedIn ? "/dashboard" : "/sign-in"} replace />} />
      </Routes>
    </div>
  )
}

export default App