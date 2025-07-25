import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BuildingStorefrontIcon,
  CogIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  UsersIcon,
  BellIcon,
  KeyIcon
} from '@heroicons/react/24/outline'
import { useClerkAuth } from '../contexts/ClerkAuthContext'
import { useOrganization } from '@clerk/clerk-react'

const OrganizationSettings = () => {
  const { hasPermission, pharmacyData } = useClerkAuth()
  const { organization } = useOrganization()
  
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    general: {
      name: pharmacyData?.name || 'PharmaCare Central',
      description: 'Modern AI-powered pharmacy serving the community',
      address: '123 Main Street, Nairobi, Kenya',
      phone: '+254 700 000 000',
      email: 'info@pharmacare.co.ke',
      website: 'https://pharmacare.co.ke',
      logo: null
    },
    business: {
      licenseNumber: 'PH/2024/001',
      taxId: 'KRA123456789',
      businessType: 'retail_pharmacy',
      operatingHours: {
        monday: { open: '08:00', close: '20:00', closed: false },
        tuesday: { open: '08:00', close: '20:00', closed: false },
        wednesday: { open: '08:00', close: '20:00', closed: false },
        thursday: { open: '08:00', close: '20:00', closed: false },
        friday: { open: '08:00', close: '20:00', closed: false },
        saturday: { open: '09:00', close: '18:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: false }
      }
    },
    notifications: {
      lowStockAlerts: true,
      expiryAlerts: true,
      salesReports: true,
      userActivity: false,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: 'standard',
      apiAccess: true,
      auditLogs: true
    },
    integrations: {
      paymentGateways: ['mpesa', 'card'],
      inventorySync: false,
      accountingSoftware: null,
      loyaltyProgram: false
    }
  })

  const tabs = [
    { id: 'general', name: 'General', icon: BuildingStorefrontIcon },
    { id: 'business', name: 'Business Info', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'integrations', name: 'Integrations', icon: GlobeAltIcon }
  ]

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const handleOperatingHoursChange = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      business: {
        ...prev.business,
        operatingHours: {
          ...prev.business.operatingHours,
          [day]: {
            ...prev.business.operatingHours[day],
            [field]: value
          }
        }
      }
    }))
  }

  if (!hasPermission('pharmacy:manage')) {
    return (
      <div className="text-center py-12">
        <ShieldCheckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to manage organization settings.</p>
      </div>
    )
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pharmacy Name
          </label>
          <input
            type="text"
            value={settings.general.name}
            onChange={(e) => handleSettingChange('general', 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={settings.general.email}
            onChange={(e) => handleSettingChange('general', 'email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={settings.general.description}
          onChange={(e) => handleSettingChange('general', 'description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <input
          type="text"
          value={settings.general.address}
          onChange={(e) => handleSettingChange('general', 'address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={settings.general.phone}
            onChange={(e) => handleSettingChange('general', 'phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={settings.general.website}
            onChange={(e) => handleSettingChange('general', 'website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            License Number
          </label>
          <input
            type="text"
            value={settings.business.licenseNumber}
            onChange={(e) => handleSettingChange('business', 'licenseNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax ID
          </label>
          <input
            type="text"
            value={settings.business.taxId}
            onChange={(e) => handleSettingChange('business', 'taxId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Type
        </label>
        <select
          value={settings.business.businessType}
          onChange={(e) => handleSettingChange('business', 'businessType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="retail_pharmacy">Retail Pharmacy</option>
          <option value="hospital_pharmacy">Hospital Pharmacy</option>
          <option value="clinic_pharmacy">Clinic Pharmacy</option>
          <option value="wholesale_pharmacy">Wholesale Pharmacy</option>
        </select>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Operating Hours</h4>
        <div className="space-y-3">
          {Object.entries(settings.business.operatingHours).map(([day, hours]) => (
            <div key={day} className="grid grid-cols-4 gap-3 items-center">
              <div className="capitalize font-medium text-gray-700">{day}</div>
              <div>
                <input
                  type="time"
                  value={hours.open}
                  onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                  disabled={hours.closed}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="time"
                  value={hours.close}
                  onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                  disabled={hours.closed}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hours.closed}
                    onChange={(e) => handleOperatingHoursChange(day, 'closed', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Closed</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Alert Preferences</h4>
        {Object.entries({
          lowStockAlerts: 'Low Stock Alerts',
          expiryAlerts: 'Product Expiry Alerts',
          salesReports: 'Daily Sales Reports',
          userActivity: 'User Activity Notifications'
        }).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-gray-700">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications[key]}
                onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Delivery Methods</h4>
        {Object.entries({
          emailNotifications: 'Email Notifications',
          smsNotifications: 'SMS Notifications',
          pushNotifications: 'Push Notifications'
        }).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-gray-700">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications[key]}
                onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Authentication</h4>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-700">Two-Factor Authentication</span>
            <p className="text-sm text-gray-500">Add an extra layer of security to user accounts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Session Timeout (minutes)
        </label>
        <select
          value={settings.security.sessionTimeout}
          onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={60}>1 hour</option>
          <option value={120}>2 hours</option>
          <option value={480}>8 hours</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password Policy
        </label>
        <select
          value={settings.security.passwordPolicy}
          onChange={(e) => handleSettingChange('security', 'passwordPolicy', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="basic">Basic (8+ characters)</option>
          <option value="standard">Standard (8+ chars, numbers, symbols)</option>
          <option value="strict">Strict (12+ chars, mixed case, numbers, symbols)</option>
        </select>
      </div>
    </div>
  )

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Gateways</h4>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'mpesa', name: 'M-Pesa', description: 'Mobile money payments' },
            { id: 'card', name: 'Card Payments', description: 'Visa, Mastercard, etc.' },
            { id: 'bank', name: 'Bank Transfer', description: 'Direct bank payments' },
            { id: 'cash', name: 'Cash', description: 'Physical cash payments' }
          ].map((gateway) => (
            <div key={gateway.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{gateway.name}</span>
                <input
                  type="checkbox"
                  checked={settings.integrations.paymentGateways.includes(gateway.id)}
                  onChange={(e) => {
                    const currentGateways = settings.integrations.paymentGateways
                    const newGateways = e.target.checked
                      ? [...currentGateways, gateway.id]
                      : currentGateways.filter(g => g !== gateway.id)
                    handleSettingChange('integrations', 'paymentGateways', newGateways)
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <p className="text-sm text-gray-500">{gateway.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Third-Party Services</h4>
        {Object.entries({
          inventorySync: 'Inventory Synchronization',
          loyaltyProgram: 'Customer Loyalty Program',
          apiAccess: 'API Access',
          auditLogs: 'Audit Logging'
        }).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-gray-700">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.integrations[key] || settings.security[key]}
                onChange={(e) => {
                  const section = key === 'apiAccess' || key === 'auditLogs' ? 'security' : 'integrations'
                  handleSettingChange(section, key, e.target.checked)
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your pharmacy settings, preferences, and integrations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'general' && renderGeneralSettings()}
              {activeTab === 'business' && renderBusinessSettings()}
              {activeTab === 'notifications' && renderNotificationSettings()}
              {activeTab === 'security' && renderSecuritySettings()}
              {activeTab === 'integrations' && renderIntegrationsSettings()}

              <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizationSettings