import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play, TrendingUp, Shield, Target } from 'lucide-react'

const Hero = () => {
  const [counters, setCounters] = useState({
    successRate: 0,
    monthlyReturn: 0,
    dailyOpportunities: 0,
    trackRecord: 0
  })

  useEffect(() => {
    const animateCounters = () => {
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps

      let step = 0
      const interval = setInterval(() => {
        step++
        const progress = step / steps

        setCounters({
          successRate: Math.floor(96 + (progress * 1)), // 96-97%
          monthlyReturn: Math.floor(12 + (progress * 6)), // 12-18%
          dailyOpportunities: Math.floor(progress * 350), // 0-350
          trackRecord: Math.floor(progress * 365) // 0-365 days
        })

        if (step >= steps) {
          clearInterval(interval)
          setCounters({
            successRate: 97,
            monthlyReturn: 18,
            dailyOpportunities: 350,
            trackRecord: 365
          })
        }
      }, stepDuration)

      return () => clearInterval(interval)
    }

    const timer = setTimeout(animateCounters, 500)
    return () => clearTimeout(timer)
  }, [])

  const stats = [
    {
      icon: Target,
      value: `${counters.successRate}%`,
      label: 'Success Rate',
      color: 'text-success-500'
    },
    {
      icon: TrendingUp,
      value: `${counters.monthlyReturn}%`,
      label: 'Monthly Returns',
      color: 'text-secondary-500'
    },
    {
      icon: Shield,
      value: counters.dailyOpportunities,
      label: 'Daily Opportunities',
      color: 'text-accent-500'
    },
    {
      icon: Play,
      value: `${Math.floor(counters.trackRecord / 30)}+`,
      label: 'Months Proven',
      color: 'text-primary-400'
    }
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-white">Stable Crypto Profits</span>
            <br />
            <span className="gradient-text">Without the Hype</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Premium automated trading system delivering{' '}
            <span className="text-secondary-500 font-semibold">12-18% monthly returns</span>{' '}
            through advanced pattern recognition and risk management
          </motion.p>
        </motion.div>

        {/* Statistics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className="glass rounded-xl p-6 hover-lift"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-2 animate-counter`}>
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary px-8 py-4 rounded-xl text-white font-semibold text-lg flex items-center space-x-2 shadow-lg"
          >
            <span>Discover How It Works</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass px-8 py-4 rounded-xl text-white font-semibold text-lg border border-gray-600 hover:border-secondary-500 transition-colors"
          >
            View Live Demo
          </motion.button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-400"
        >
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-success-500" />
            <span>No Withdrawal Access</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-secondary-500" />
            <span>Binance Global Ready</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-accent-500" />
            <span>Crypto Payments Only</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-secondary-500 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero
