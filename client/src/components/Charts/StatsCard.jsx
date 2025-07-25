import { motion } from 'framer-motion'
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  MinusIcon 
} from '@heroicons/react/24/outline'

const StatsCard = ({
  title,
  value,
  previousValue,
  icon: Icon,
  trend,
  trendValue,
  className = '',
  color = 'blue'
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      accent: 'bg-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      accent: 'bg-green-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      accent: 'bg-purple-600'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      accent: 'bg-orange-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      accent: 'bg-red-600'
    }
  }

  const getTrendIcon = () => {
    if (trend === 'up') return ArrowUpIcon
    if (trend === 'down') return ArrowDownIcon
    return MinusIcon
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 bg-green-100'
    if (trend === 'down') return 'text-red-600 bg-red-100'
    return 'text-gray-600 bg-gray-100'
  }

  const TrendIcon = getTrendIcon()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        bg-white rounded-2xl shadow-sm border border-gray-100 p-6 
        hover:shadow-md transition-all duration-200
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <motion.p 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-3xl font-bold text-gray-900"
          >
            {value}
          </motion.p>
          
          {trendValue && (
            <div className="flex items-center mt-3">
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrendColor()}`}>
                <TrendIcon className="w-3 h-3 mr-1" />
                {trendValue}
              </div>
              <span className="text-xs text-gray-500 ml-2">vs last period</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${colorClasses[color].bg}`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].icon}`} />
        </div>
      </div>
      
      {/* Accent line */}
      <div className={`h-1 ${colorClasses[color].accent} rounded-full mt-4 opacity-20`} />
    </motion.div>
  )
}

export default StatsCard