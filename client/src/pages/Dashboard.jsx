import { motion } from 'framer-motion'
import {
  CubeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import StatsCard from '../components/Charts/StatsCard'

const Dashboard = () => {
  // Sample data for demonstration
  const stats = [
    {
      name: 'Total Revenue',
      value: 'KSh 245,600',
      change: '+12.5%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Total Products',
      value: '1,247',
      change: '+3.2%',
      changeType: 'increase',
      icon: CubeIcon,
    },
    {
      name: 'Active Customers',
      value: '423',
      change: '+8.1%',
      changeType: 'increase',
      icon: UsersIcon,
    },
    {
      name: 'Pending Orders',
      value: '12',
      change: '-2.4%',
      changeType: 'decrease',
      icon: ShoppingCartIcon,
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'sale',
      description: 'Sale completed - Paracetamol 500mg',
      amount: 'KSh 450',
      time: '2 minutes ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'inventory',
      description: 'Stock updated - Amoxicillin 250mg',
      amount: '+50 units',
      time: '5 minutes ago',
      status: 'updated'
    },
    {
      id: 3,
      type: 'alert',
      description: 'Low stock alert - Vitamin C',
      amount: '5 units left',
      time: '10 minutes ago',
      status: 'warning'
    },
  ]

  const lowStockItems = [
    { name: 'Vitamin C 1000mg', stock: 5, reorderLevel: 20 },
    { name: 'Insulin Rapid Acting', stock: 3, reorderLevel: 10 },
    { name: 'Paracetamol 500mg', stock: 15, reorderLevel: 50 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening at your pharmacy.</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Sale
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-500' :
                        activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${
                      activity.status === 'completed' ? 'text-green-600' :
                      activity.status === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {activity.amount}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                  Low Stock Alerts
                </h3>
              </div>
              <div className="space-y-3">
                {lowStockItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 border border-red-200 rounded-lg bg-red-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          Reorder level: {item.reorderLevel} units
                        </p>
                      </div>
                      <span className="text-lg font-bold text-red-600">
                        {item.stock}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Reorder Items
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'New Sale', icon: CurrencyDollarIcon, color: 'green' },
              { name: 'Add Product', icon: PlusIcon, color: 'blue' },
              { name: 'View Reports', icon: ChartBarIcon, color: 'purple' },
              { name: 'Manage Inventory', icon: CubeIcon, color: 'orange' },
            ].map((action, index) => (
              <motion.button
                key={action.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <action.icon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">{action.name}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
