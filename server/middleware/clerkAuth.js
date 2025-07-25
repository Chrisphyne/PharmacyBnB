const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Pharmacy roles mapping
const PHARMACY_ROLES = {
  SUPER_ADMIN: 'super_admin',
  PHARMACY_OWNER: 'pharmacy_owner', 
  PHARMACY_MANAGER: 'pharmacy_manager',
  PHARMACIST: 'pharmacist',
  PHARMACY_TECHNICIAN: 'pharmacy_technician',
  CASHIER: 'cashier',
  INVENTORY_MANAGER: 'inventory_manager'
};

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
};

// Middleware to extract user role and permissions
const enrichUserData = async (req, res, next) => {
  try {
    if (req.auth && req.auth.userId) {
      const user = req.auth;
      
      // Extract role from user metadata or organization membership
      let userRole = PHARMACY_ROLES.CASHIER; // Default role
      
      // Try to get role from public metadata first
      if (user.sessionClaims?.metadata?.role) {
        userRole = user.sessionClaims.metadata.role;
      } else if (user.sessionClaims?.publicMetadata?.role) {
        userRole = user.sessionClaims.publicMetadata.role;
      }
      
      // Get permissions for the role
      const permissions = rolePermissions[userRole] || [];
      
      // Enrich the user object
      req.user = {
        id: user.userId,
        role: userRole,
        permissions,
        organizationId: user.sessionClaims?.org_id,
        pharmacyName: user.sessionClaims?.publicMetadata?.pharmacyName || 'PharmaCare',
        pharmacyLocation: user.sessionClaims?.publicMetadata?.pharmacyLocation,
        pharmacyId: user.sessionClaims?.org_id || 'default',
        email: user.sessionClaims?.email,
        firstName: user.sessionClaims?.given_name,
        lastName: user.sessionClaims?.family_name
      };
    }
    
    next();
  } catch (error) {
    console.error('Error enriching user data:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// Combined middleware: Clerk auth + user enrichment
const clerkAuthMiddleware = [
  ClerkExpressRequireAuth({
    // Optional: Add custom error handling
    onError: (error) => {
      console.error('Clerk authentication error:', error);
      return {
        status: 401,
        message: 'Authentication required'
      };
    }
  }),
  enrichUserData
];

// Permission checking middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const hasPermission = req.user.permissions.includes('*') || 
                         req.user.permissions.includes(permission);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions. Required: ${permission}`
      });
    }

    next();
  };
};

// Role checking middleware
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions. Required role: ${role}`
      });
    }

    next();
  };
};

// Admin-only middleware
const requireAdmin = requireRole(PHARMACY_ROLES.PHARMACY_OWNER);

module.exports = {
  clerkAuthMiddleware,
  requirePermission,
  requireRole,
  requireAdmin,
  PHARMACY_ROLES,
  rolePermissions
};