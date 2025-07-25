import { motion } from 'framer-motion'

const Reports = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Reports & Analytics</h1>
        <p className="text-gray-600 mb-8">Generate detailed reports, view analytics, and gain business insights</p>
        <div className="bg-orange-50 p-8 rounded-2xl">
          <p className="text-orange-800">📊 Advanced reporting system is coming soon!</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Reports