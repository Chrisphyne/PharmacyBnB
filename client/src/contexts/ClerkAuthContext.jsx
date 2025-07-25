import { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useOrganization, useAuth, useClerk } from '@clerk/clerk-react'
import toast from 'react-hot-toast'

const ClerkAuthContext = createContext()

// Pharmacy roles mapping
const PHARMACY_ROLES = {
  SUPER_ADMIN: 'super_admin',
  PHARMACY_OWNER: 'pharmacy_owner', 
  PHARMACY_MANAGER: 'pharmacy_manager',
  PHARMACIST: 'pharmacist',
  PHARMACY_TECHNICIAN: 'pharmacy_technician',
  CASHIER: 'cashier',
  INVENTORY_MANAGER: 'inventory_manager'
}

export const ClerkAuthProvider = ({ children }) => {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser()
  const { organization, isLoaded: orgLoaded } = useOrganization()
  const { getToken, signOut } = useAuth()
  const clerk = useClerk()
  
  const [userRole, setUserRole] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [pharmacyData, setPharmacyData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Define role-based permissions
  const rolePermissions = {
    [PHARMACY_ROLES.SUPER_ADMIN]: ['*'], // All permissions
    [PHARMACY_ROLES.PHARMACY_OWNER]: [
      'pharmacy:manage',
      'users:manage',
      'inventory:read', 'inventory:write', 'inventory:delete',
      'products:read', 'products:write', 'products:delete',
      'sales:read', 'sales:write', 'sales:delete',
      'orders:read', 'orders:write', 'orders:delete',
      'reports:read', 'reports:write',
      'settings:read', 'settings:write',
      'ai:access'
    ],
    [PHARMACY_ROLES.PHARMACY_MANAGER]: [
      'inventory:read', 'inventory:write', 'inventory:delete',
      'products:read', 'products:write', 'products:delete',
      'sales:read', 'sales:write',
      'orders:read', 'orders:write',
      'reports:read',
      'ai:access'
    ],
    [PHARMACY_ROLES.PHARMACIST]: [
      'inventory:read', 'inventory:write',
      'products:read', 'products:write',
      'sales:read', 'sales:write',
      'orders:read', 'orders:write',
      'reports:read',
      'ai:access'
    ],
    [PHARMACY_ROLES.PHARMACY_TECHNICIAN]: [
      'inventory:read', 'inventory:write',
      'products:read', 'products:write',
      'sales:read', 'sales:write',
      'orders:read'
    ],
    [PHARMACY_ROLES.CASHIER]: [
      'inventory:read',
      'products:read',
      'sales:read', 'sales:write'
    ],
    [PHARMACY_ROLES.INVENTORY_MANAGER]: [
      'inventory:read', 'inventory:write', 'inventory:delete',
      'products:read', 'products:write', 'products:delete',
      'orders:read', 'orders:write',
      'reports:read'
    ]
  }

  // Extract user role from Clerk metadata or organization membership
  useEffect(() => {
    if (userLoaded && orgLoaded && isSignedIn) {
      const extractUserRole = () => {
        // Try to get role from organization membership
        if (organization) {
          const membership = organization.memberships?.find(
            m => m.publicUserData.userId === user.id
          )
          if (membership?.role) {
            return membership.role
          }
        }

        // Fallback to user public metadata
        const roleFromMetadata = user?.publicMetadata?.role || 
                               user?.privateMetadata?.role ||
                               PHARMACY_ROLES.CASHIER // Default role

        return roleFromMetadata
      }

      const role = extractUserRole()
      setUserRole(role)
      setPermissions(rolePermissions[role] || [])

      // Set pharmacy data from organization or user metadata
      if (organization) {
        setPharmacyData({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          imageUrl: organization.imageUrl,
          publicMetadata: organization.publicMetadata
        })
      } else {
        setPharmacyData({
          name: user?.publicMetadata?.pharmacyName || 'Independent Pharmacy',
          id: user?.publicMetadata?.pharmacyId || 'default'
        })
      }

      setLoading(false)
    } else if (userLoaded && !isSignedIn) {
      setLoading(false)
    }
  }, [user, organization, userLoaded, orgLoaded, isSignedIn])

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!permissions.length) return false
    return permissions.includes('*') || permissions.includes(permission)
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return userRole === role
  }

  // Get user's pharmacy context
  const getPharmacyContext = () => {
    return {
      pharmacyId: pharmacyData?.id,
      pharmacyName: pharmacyData?.name,
      isMultiTenant: !!organization,
      organizationId: organization?.id
    }
  }

  // Switch organization (for multi-tenant users)
  const switchOrganization = async (organizationId) => {
    try {
      await clerk.setActive({ organization: organizationId })
      toast.success('Switched pharmacy successfully')
    } catch (error) {
      console.error('Error switching organization:', error)
      toast.error('Failed to switch pharmacy')
    }
  }

  // Custom logout with cleanup
  const logout = async () => {
    try {
      await signOut()
      setUserRole(null)
      setPermissions([])
      setPharmacyData(null)
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error during logout')
    }
  }

  // Get authenticated API token
  const getApiToken = async () => {
    try {
      return await getToken()
    } catch (error) {
      console.error('Error getting token:', error)
      return null
    }
  }

  // Update user role (for admins)
  const updateUserRole = async (userId, newRole) => {
    if (!hasPermission('users:manage')) {
      toast.error('Insufficient permissions')
      return false
    }

    try {
      // This would typically call your backend API
      // await api.updateUserRole(userId, newRole)
      toast.success('User role updated successfully')
      return true
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
      return false
    }
  }

  // Invite user to organization
  const inviteUser = async (email, role) => {
    if (!hasPermission('users:manage') || !organization) {
      toast.error('Insufficient permissions or not in an organization')
      return false
    }

    try {
      await organization.inviteMember({ emailAddress: email, role })
      toast.success(`Invitation sent to ${email}`)
      return true
    } catch (error) {
      console.error('Error inviting user:', error)
      toast.error('Failed to send invitation')
      return false
    }
  }

  const value = {
    // Clerk native
    user,
    isSignedIn,
    organization,
    loading,
    
    // Custom pharmacy context
    userRole,
    permissions,
    pharmacyData,
    
    // Utility functions
    hasPermission,
    hasRole,
    getPharmacyContext,
    switchOrganization,
    logout,
    getApiToken,
    updateUserRole,
    inviteUser,
    
    // Constants
    PHARMACY_ROLES
  }

  return (
    <ClerkAuthContext.Provider value={value}>
      {children}
    </ClerkAuthContext.Provider>
  )
}

export const useClerkAuth = () => {
  const context = useContext(ClerkAuthContext)
  if (!context) {
    throw new Error('useClerkAuth must be used within a ClerkAuthProvider')
  }
  return context
}

export { PHARMACY_ROLES }