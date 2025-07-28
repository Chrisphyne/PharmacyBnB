import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CurrencyDollarIcon,
  CubeIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  ArrowArrowArrowTrendingUpIcon,
  ClockIcon,
  PlusIcon,
  MicrophoneIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import StatsCard from '../components/Charts/StatsCard'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [isListening, setIsListening] = useState(false)

  // Sample data - replace with real API calls
  const stats = {
    todaysSales: { value: 'KSh 24,500', trend: 'up', trendValue: '+12%' },
    totalProducts: { value: '1,247', trend: 'up', trendValue: '+23' },
    lowStock: { value: '8', trend: 'down', trendValue: '-3' },
    expiringSoon: { value: '5', trend: 'neutral', trendValue: '0' },
    customers: { value: '342', trend: 'up', trendValue: '+18%' },
    revenue: { value: 'KSh 185K', trend: 'up', trendValue: '+8%' }
  }

  const salesData = [
    { day: 'Mon', sales: 12000, orders: 45 },
    { day: 'Tue', sales: 19000, orders: 67 },
    { day: 'Wed', sales: 15000, orders: 52 },
    { day: 'Thu', sales: 22000, orders: 78 },
    { day: 'Fri', sales: 28000, orders: 89 },
    { day: 'Sat', sales: 25000, orders: 82 },
    { day: 'Sun', sales: 18000, orders: 61 }
  ]

  const topProducts = [
    { name: 'Paracetamol 500mg', sales: 45, revenue: 4500 },
    { name: 'Amoxicillin 250mg', sales: 38, revenue: 7600 },
    { name: 'Ibuprofen 400mg', sales: 32, revenue: 3200 },
    { name: 'Vitamin C', sales: 28, revenue: 2800 },
    { name: 'Aspirin 75mg', sales: 25, revenue: 2500 }
  ]

  const categoryData = [
    { name: 'Prescription', value: 45, color: '#3B82F6' },
    { name: 'OTC', value: 30, color: '#10B981' },
    { name: 'Supplements', value: 15, color: '#F59E0B' },
    { name: 'Personal Care', value: 10, color: '#8B5CF6' }
  ]

  const recentActivities = [
    { id: 1, type: 'sale', message: 'Sale completed - KSh 2,400', time: '2 min ago', icon: CurrencyDollarIcon },
    { id: 2, type: 'stock', message: 'Low stock alert: Paracetamol', time: '5 min ago', icon: ExclamationTriangleIcon },
    { id: 3, type: 'order', message: 'New order from Nairobi Central', time: '8 min ago', icon: ShoppingBagIcon },
    { id: 4, type: 'customer', message: 'New customer registered', time: '12 min ago', icon: UsersIcon }
  ]

  const quickActions = [
    { name: 'New Sale', icon: PlusIcon, color: 'blue', action: () => {} },
    { name: 'Add Stock', icon: CubeIcon, color: 'green', action: () => {} },
    { name: 'Voice Search', icon: MicrophoneIcon, color: 'purple', action: () => setIsListening(!isListening) },
    { name: 'Reports', icon: ChartBarIcon, color: 'orange', action: () => {} }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening at your pharmacy today.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Export Report
          </motion.button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.action}
            className={`
              p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all
              ${action.name === 'Voice Search' && isListening ? 'ring-2 ring-purple-500 bg-purple-50' : ''}
            `}
          >
            <action.icon className={`w-6 h-6 mx-auto mb-2 ${
              action.color === 'blue' ? 'text-blue-600' :
              action.color === 'green' ? 'text-green-600' :
              action.color === 'purple' ? 'text-purple-600' :
              'text-orange-600'
            }`} />
            <p className="text-sm font-medium text-gray-900">{action.name}</p>
          </motion.button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard
          title="Today's Sales"
          value={stats.todaysSales.value}
          trend={stats.todaysSales.trend}
          trendValue={stats.todaysSales.trendValue}
          icon={CurrencyDollarIcon}
          color="blue"
        />
        <StatsCard
          title="Total Products"
          value={stats.totalProducts.value}
          trend={stats.totalProducts.trend}
          trendValue={stats.totalProducts.trendValue}
          icon={CubeIcon}
          color="green"
        />
        <StatsCard
          title="Low Stock Items"
          value={stats.lowStock.value}
          trend={stats.lowStock.trend}
          trendValue={stats.lowStock.trendValue}
          icon={ExclamationTriangleIcon}
          color="orange"
        />
        <StatsCard
          title="Expiring Soon"
          value={stats.expiringSoon.value}
          trend={stats.expiringSoon.trend}
          trendValue={stats.expiringSoon.trendValue}
          icon={ClockIcon}
          color="red"
        />
        <StatsCard
          title="Customers"
          value={stats.customers.value}
          trend={stats.customers.trend}
          trendValue={stats.customers.trendValue}
          icon={UsersIcon}
          color="purple"
        />
        <StatsCard
          title="Monthly Revenue"
          value={stats.revenue.value}
          trend={stats.revenue.trend}
          trendValue={stats.revenue.trendValue}
          icon={ArrowArrowArrowTrendingUpIcon}
          color="blue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Sales</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((category) => (
              <div key={category.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-gray-600">{category.name}</span>
                <span className="text-sm font-medium text-gray-900">{category.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Selling Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} units sold</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">KSh {product.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'sale' ? 'bg-green-100 text-green-600' :
                  activity.type === 'stock' ? 'bg-orange-100 text-orange-600' :
                  activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all activities
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard