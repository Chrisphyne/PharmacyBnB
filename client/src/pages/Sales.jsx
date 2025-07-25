import { motion } from 'framer-motion'

const Sales = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Sales & POS</h1>
        <p className="text-gray-600 mb-8">Process sales, manage transactions, and handle customer payments</p>
        <div className="bg-green-50 p-8 rounded-2xl">
          <p className="text-green-800">💰 POS System is coming soon!</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Sales