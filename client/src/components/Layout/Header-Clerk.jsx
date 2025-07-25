import { useState, Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { UserButton, OrganizationSwitcher } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  BellIcon,
  MicrophoneIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { useClerkAuth } from '../../contexts/ClerkAuthContext'

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const { user, organization, pharmacyData, getPharmacyContext } = useClerkAuth()

  const notifications = [
    { id: 1, message: 'Low stock alert: Paracetamol (5 units left)', type: 'warning', time: '5 min ago' },
    { id: 2, message: '3 products expiring in 7 days', type: 'error', time: '10 min ago' },
    { id: 3, message: 'New order received from Nairobi Central', type: 'info', time: '15 min ago' },
  ]

  const handleVoiceSearch = () => {
    setIsListening(!isListening)
    // Voice recognition logic will be implemented here
  }

  const handleSearch = (e) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
  }

  const pharmacyContext = getPharmacyContext()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Search and Organization */}
        <div className="flex items-center space-x-4 flex-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors lg:hidden"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>

          {/* Organization Switcher for Multi-tenant */}
          {pharmacyContext.isMultiTenant && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
              <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
              <OrganizationSwitcher 
                appearance={{
                  elements: {
                    organizationSwitcherTrigger: "text-blue-700 font-medium text-sm",
                    organizationSwitcherPopoverCard: "shadow-lg border border-gray-200"
                  }
                }}
              />
            </div>
          )}

          <form onSubmit={handleSearch} className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all sm:text-sm"
                placeholder="Search products, orders, customers..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <motion.button
                  type="button"
                  onClick={handleVoiceSearch}
                  whileTap={{ scale: 0.95 }}
                  className={`p-1.5 rounded-lg transition-all ${
                    isListening 
                      ? 'bg-red-100 text-red-600 animate-pulse' 
                      : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <MicrophoneIcon className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </form>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {darkMode ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </motion.button>

          {/* Notifications */}
          <Menu as="div" className="relative">
            <Menu.Button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <BellIcon className="w-5 h-5" />
              {notifications.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                >
                  {notifications.length}
                </motion.span>
              )}
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                </div>
                <div className="py-1 max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <Menu.Item key={notification.id}>
                      {({ active }) => (
                        <div className={`px-4 py-3 ${active ? 'bg-gray-50' : ''}`}>
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'error' ? 'bg-red-500' :
                              notification.type === 'warning' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Menu.Item>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-gray-100">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View all notifications
                  </button>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Pharmacy Context Display */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="text-right">
              <p className="text-xs text-gray-500">Current Pharmacy</p>
              <p className="text-sm font-medium text-gray-900">{pharmacyData?.name}</p>
            </div>
          </div>

          {/* User Button from Clerk */}
          <div className="flex items-center">
            <UserButton 
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full",
                  userButtonPopoverCard: "shadow-lg border border-gray-200 rounded-xl",
                  userButtonPopoverActions: "p-2"
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header