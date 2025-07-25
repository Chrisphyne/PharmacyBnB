import { motion } from 'framer-motion'

const Settings = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Settings</h1>
        <p className="text-gray-600 mb-8">Configure system settings, user permissions, and preferences</p>
        <div className="bg-gray-50 p-8 rounded-2xl">
          <p className="text-gray-800">⚙️ Settings panel is coming soon!</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Settings