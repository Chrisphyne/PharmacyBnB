import { motion } from 'framer-motion'

const Orders = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Management</h1>
        <p className="text-gray-600 mb-8">Manage purchase orders, supplier relationships, and procurement</p>
        <div className="bg-purple-50 p-8 rounded-2xl">
          <p className="text-purple-800">📦 Order Management system is coming soon!</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Orders