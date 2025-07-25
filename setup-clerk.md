# 🔐 Clerk Authentication Setup Guide

This guide will help you configure Clerk authentication for the PharmaCare AI Pharmacy Management System.

## 📋 Prerequisites

- ✅ Your Clerk account is set up
- ✅ You have your Clerk API keys
- ✅ Node.js and npm are installed

## 🔑 Your Clerk Configuration

Based on your provided keys:

```bash
CLERK_PUBLISHABLE_KEY=pk_test_ZGlzdGluY3QtbW9vc2UtOTEuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_tKw95x8blJyf0RXiFebkWLLbukHGJA2vtrIhFABAc3
Frontend API URL: https://distinct-moose-91.clerk.accounts.dev
```

## 🚀 Quick Setup

### 1. Environment Variables (Already Configured!)

Your environment variables are already set up in:
- **Server**: `.env`
- **Client**: `client/.env.local`

### 2. Start the Development Servers

```bash
# Install dependencies (if not done already)
npm install
cd client && npm install && cd ..

# Start both client and server
npm run dev
```

This will start:
- **Server**: http://localhost:5000
- **Client**: http://localhost:3000

### 3. Test Authentication

1. **Open your browser** to http://localhost:3000
2. **Click "Sign In"** - you'll be redirected to Clerk's authentication
3. **Create an account** or sign in with existing credentials
4. **You'll be redirected back** to the pharmacy dashboard

## 🏢 Setting Up Organizations (Multi-Tenant)

For pharmacy chains or multiple locations:

### In Clerk Dashboard:

1. **Go to**: https://dashboard.clerk.com
2. **Navigate to**: Organizations → Settings
3. **Enable Organizations** for your application
4. **Configure organization roles**:
   - `pharmacy_owner` - Full access
   - `pharmacy_manager` - Operational access  
   - `pharmacist` - Clinical access
   - `pharmacy_technician` - Limited access
   - `cashier` - Sales only
   - `inventory_manager` - Stock management

### User Roles Setup:

1. **In Clerk Dashboard**: Users → [Select User] → Metadata
2. **Add Public Metadata**:
   ```json
   {
     "role": "pharmacy_owner",
     "pharmacyName": "Central Pharmacy",
     "pharmacyLocation": "Nairobi, Kenya"
   }
   ```

## 🔐 Authentication Flow

### 1. User Signs In
- Clerk handles authentication
- JWT token is issued
- User is redirected to dashboard

### 2. API Requests
- Client sends JWT token in Authorization header
- Server validates token with Clerk
- User permissions are checked
- API response is returned

### 3. Role-Based Access
- **Pharmacy Owner**: Full system access
- **Pharmacist**: Clinical + operational features
- **Cashier**: Sales and basic inventory
- **Admin**: System management

## 🎯 Testing Different Roles

### Create Test Users:

1. **Pharmacy Owner**:
   ```json
   {
     "role": "pharmacy_owner",
     "pharmacyName": "PharmaCare Central",
     "pharmacyLocation": "Nairobi"
   }
   ```

2. **Pharmacist**:
   ```json
   {
     "role": "pharmacist",
     "pharmacyName": "PharmaCare Central",
     "pharmacyLocation": "Nairobi"
   }
   ```

3. **Cashier**:
   ```json
   {
     "role": "cashier",
     "pharmacyName": "PharmaCare Central",
     "pharmacyLocation": "Nairobi"
   }
   ```

### Test Features by Role:

- **Dashboard**: ✅ All roles
- **Inventory Management**: ✅ Owner, Manager, Pharmacist
- **AI Assistant**: ✅ Owner, Manager, Pharmacist  
- **User Management**: ✅ Owner only
- **Organization Settings**: ✅ Owner only
- **Sales**: ✅ All roles
- **Reports**: ✅ Owner, Manager, Pharmacist

## 🌐 SSO Configuration

### Enable Google (Gmail) SSO:

1. **In Clerk Dashboard**: Authentication → Social Connections
2. **Add Google** connection
3. **Configure OAuth**:
   - Authorized domains: your-domain.com
   - Redirect URLs: handled automatically by Clerk

### Enable Other Providers:

- **GitHub**: For developer access
- **Microsoft**: For enterprise customers
- **LinkedIn**: For professional networks
- **Facebook**: For broader user base

## 🔧 Advanced Configuration

### Webhooks (Optional):

1. **In Clerk Dashboard**: Webhooks
2. **Add endpoint**: `https://your-domain.com/api/webhooks/clerk`
3. **Select events**: user.created, user.updated, organization.created

### Custom Claims:

Add pharmacy-specific data to JWT tokens:
```javascript
// In Clerk Dashboard → JWT Templates
{
  "pharmacyId": "{{user.public_metadata.pharmacyId}}",
  "role": "{{user.public_metadata.role}}",
  "pharmacyName": "{{user.public_metadata.pharmacyName}}"
}
```

## 🛠️ Troubleshooting

### Common Issues:

1. **"Authentication required" error**:
   - Check environment variables are set
   - Verify Clerk keys are correct
   - Ensure client is sending Authorization header

2. **"Insufficient permissions" error**:
   - Check user role in Clerk Dashboard
   - Verify public metadata is set correctly
   - Confirm role permissions in server code

3. **CORS errors**:
   - Add your domain to Clerk dashboard
   - Check CORS_ORIGIN environment variable
   - Verify allowed origins in server configuration

### Debug Commands:

```bash
# Check environment variables
echo $CLERK_PUBLISHABLE_KEY
echo $CLERK_SECRET_KEY

# Test server health
curl http://localhost:5000/health

# Test AI connection (with auth token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/ai/test
```

## 📊 Monitoring & Analytics

### Clerk Dashboard Provides:

- **User Analytics**: Sign-ups, active users, retention
- **Authentication Logs**: Login attempts, security events
- **Organization Metrics**: Member counts, role distribution
- **Security Reports**: Failed attempts, suspicious activity

## 🚀 Production Deployment

### Environment Variables for Production:

```bash
# Production Clerk keys (replace with your production keys)
CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_key

# Security settings
NODE_ENV=production
CORS_ORIGIN=https://your-pharmacy-domain.com
```

### Security Checklist:

- ✅ Use production Clerk keys
- ✅ Enable 2FA for admin accounts
- ✅ Set up organization roles properly
- ✅ Configure allowed domains
- ✅ Set up monitoring and alerts
- ✅ Backup user data regularly

## 💡 Tips & Best Practices

1. **Role Management**: Start with basic roles, add complexity as needed
2. **Organizations**: Use for pharmacy chains or locations
3. **Metadata**: Store pharmacy-specific data in user metadata
4. **Security**: Always use HTTPS in production
5. **Testing**: Test with different roles during development
6. **Monitoring**: Set up alerts for authentication failures

## 📞 Support

- **Clerk Documentation**: https://clerk.com/docs
- **Clerk Discord**: https://clerk.com/discord
- **GitHub Issues**: Create issues for pharmacy-specific problems

---

🎉 **You're all set!** Your pharmacy management system now has enterprise-grade authentication with Clerk!