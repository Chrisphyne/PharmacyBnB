import { motion } from 'framer-motion'

const Products = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Catalog</h1>
        <p className="text-gray-600 mb-8">Manage your product catalog, categories, and product information</p>
        <div className="bg-blue-50 p-8 rounded-2xl">
          <p className="text-blue-800">🚧 Product Catalog management is coming soon!</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Products