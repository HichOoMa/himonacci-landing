import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, TrendingUp, TrendingDown, Clock, Target, DollarSign } from 'lucide-react'

const LiveDashboard = () => {
  const [liveData, setLiveData] = useState({
    dailyOpportunities: 287,
    activePositions: 23,
    todayProfit: 1247,
    weeklyProgress: 67,
    successRate: 96.8,
    totalProfit: 15420
  })

  const [positions, setPositions] = useState([
    {
      symbol: 'BTCUSDT',
      entry: 43250,
      current: 43891,
      pnl: 1.48,
      time: '2h 15m',
      status: 'winning'
    },
    {
      symbol: 'ETHUSDT',
      entry: 2567,
      current: 2598,
      pnl: 1.21,
      time: '1h 42m',
      status: 'winning'
    }
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        dailyOpportunities: prev.dailyOpportunities + Math.floor(Math.random() * 3),
        todayProfit: prev.todayProfit + Math.floor(Math.random() * 50),
        weeklyProgress: Math.min(100, prev.weeklyProgress + Math.random() * 0.5)
      }))

      setPositions(prev => prev.map(pos => ({
        ...pos,
        current: pos.current + (Math.random() - 0.5) * 20,
        pnl: ((pos.current + (Math.random() - 0.5) * 20) / pos.entry - 1) * 100
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const metrics = [
    {
      icon: Activity,
      label: 'Daily Opportunities',
      value: liveData.dailyOpportunities,
      color: 'text-secondary-500',
      change: '+12 today'
    },
    {
      icon: Target,
      label: 'Active Positions',
      value: liveData.activePositions,
      color: 'text-accent-500',
      change: '2 new'
    },
    {
      icon: DollarSign,
      label: "Today's Profit",
      value: `$${liveData.todayProfit}`,
      color: 'text-success-500',
      change: '+$127 last hour'
    },
    {
      icon: TrendingUp,
      label: 'Weekly Progress',
      value: `${liveData.weeklyProgress.toFixed(1)}%`,
      color: 'text-primary-400',
      change: 'On track'
    }
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-success-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            <span className="gradient-text">Live Performance</span> Dashboard
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real-time view of HiMonacci in action. Data updates every few seconds to show 
            live market opportunities and active positions.
          </p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
            <span className="text-success-500 font-medium">Live Data</span>
          </div>
        </motion.div>

        {/* Live Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-6 hover-lift"
            >
              <div className="flex items-center justify-between mb-4">
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              </div>
              <div className={`text-2xl font-bold ${metric.color} mb-2`}>
                {metric.value}
              </div>
              <div className="text-gray-400 text-sm mb-2">{metric.label}</div>
              <div className="text-xs text-gray-500">{metric.change}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Live Positions */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Live Positions</h3>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Updates every 12h</span>
              </div>
            </div>

            <div className="space-y-4">
              {positions.map((position, index) => (
                <motion.div
                  key={position.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-primary-900/30 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-white text-lg">
                        {position.symbol}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Entry: ${position.entry.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-lg ${
                        position.pnl > 0 ? 'text-success-500' : 'text-red-400'
                      }`}>
                        {position.pnl > 0 ? '+' : ''}{position.pnl.toFixed(2)}%
                      </div>
                      <div className="text-gray-400 text-sm">{position.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-gray-300">
                      Current: ${position.current.toLocaleString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      {position.pnl > 0 ? (
                        <TrendingUp className="w-4 h-4 text-success-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-sm font-medium ${
                        position.status === 'winning' ? 'text-success-500' : 'text-red-400'
                      }`}>
                        {position.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-secondary-500/10 border border-secondary-500/20 rounded-lg">
              <p className="text-secondary-400 text-sm">
                <strong>Note:</strong> System must be taken as complete package for optimal results. 
                Individual signal following may produce different outcomes.
              </p>
            </div>
          </motion.div>

          {/* Performance Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Performance Overview</h3>
            
            {/* Mock Chart */}
            <div className="h-64 bg-primary-900/30 rounded-lg flex items-center justify-center mb-6">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-success-500 mx-auto mb-4" />
                <div className="text-2xl font-bold text-success-500 mb-2">
                  +{liveData.successRate}%
                </div>
                <div className="text-gray-400">Success Rate</div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-900/30 rounded-lg p-4">
                <div className="text-xl font-bold text-success-500">
                  ${liveData.totalProfit.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">Total Profit</div>
              </div>
              <div className="bg-primary-900/30 rounded-lg p-4">
                <div className="text-xl font-bold text-secondary-500">
                  {liveData.weeklyProgress.toFixed(1)}%
                </div>
                <div className="text-gray-400 text-sm">Weekly Target</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Weekly Progress</span>
                <span>{liveData.weeklyProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-primary-900 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-secondary-500 to-success-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${liveData.weeklyProgress}%` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  viewport={{ once: true }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Start <span className="gradient-text">Your Journey</span>?
            </h3>
            <p className="text-gray-300 mb-6 text-lg">
              Join the system that's delivering consistent results to traders worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary px-8 py-3 rounded-xl text-white font-semibold text-lg"
              >
                Get Started Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass px-8 py-3 rounded-xl text-white font-semibold text-lg border border-gray-600 hover:border-secondary-500 transition-colors"
              >
                View Pricing
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default LiveDashboard
