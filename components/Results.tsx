import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Calendar, Target } from 'lucide-react'

const Results = () => {
  const stats = [
    {
      icon: Trophy,
      value: "96-97%",
      label: "Success Rate",
      description: "Consistent performance across all market conditions",
      color: "text-success-500"
    },
    {
      icon: TrendingUp,
      value: "12-18%",
      label: "Monthly Returns",
      description: "Stable profits without unrealistic promises",
      color: "text-secondary-500"
    },
    {
      icon: Calendar,
      value: "365+",
      label: "Days Proven",
      description: "Over 1 year of consistent track record",
      color: "text-accent-500"
    },
    {
      icon: Target,
      value: "350+",
      label: "Daily Opportunities",
      description: "Maximum market coverage for best results",
      color: "text-primary-400"
    }
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-success-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-secondary-500/5 rounded-full blur-3xl"></div>
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
            Proven <span className="gradient-text">Results</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Based on over 1 year of testing and real market performance. 
            No hype, just consistent, realistic returns.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-8 text-center hover-lift"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 mb-6">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className="text-white font-semibold mb-3">
                {stat.label}
              </div>
              <p className="text-gray-400 text-sm">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Key Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              What Makes Us <span className="gradient-text">Different</span>
            </h3>
            <p className="text-gray-300">
              Away from lies and big dreams that are everywhere in the crypto market
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-success-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-success-500" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Realistic Expectations</h4>
              <p className="text-gray-400">
                No "1000% gains" promises. Just stable, achievable returns based on proven data.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-secondary-500" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Consistent Performance</h4>
              <p className="text-gray-400">
                Monthly targets achieved through systematic approach and risk management.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-accent-500" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Transparent Operations</h4>
              <p className="text-gray-400">
                Full visibility into system performance, positions, and results.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Performance Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Performance <span className="gradient-text">Breakdown</span>
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 glass rounded-lg">
                <span className="text-gray-300">Best Month Performance</span>
                <span className="text-success-500 font-bold">+18.2%</span>
              </div>
              <div className="flex justify-between items-center p-4 glass rounded-lg">
                <span className="text-gray-300">Average Monthly Return</span>
                <span className="text-secondary-500 font-bold">+15.1%</span>
              </div>
              <div className="flex justify-between items-center p-4 glass rounded-lg">
                <span className="text-gray-300">Lowest Month Performance</span>
                <span className="text-accent-500 font-bold">+12.3%</span>
              </div>
              <div className="flex justify-between items-center p-4 glass rounded-lg">
                <span className="text-gray-300">Total Winning Months</span>
                <span className="text-success-500 font-bold">12/12</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-8">
            <h4 className="text-xl font-bold text-white mb-6 text-center">
              Risk vs Reward Analysis
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Maximum Drawdown</span>
                  <span>2.1%</span>
                </div>
                <div className="w-full bg-primary-900 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '2.1%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Average Monthly Gain</span>
                  <span>15.1%</span>
                </div>
                <div className="w-full bg-primary-900 rounded-full h-2">
                  <div className="bg-success-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Consistency Score</span>
                  <span>96.8%</span>
                </div>
                <div className="w-full bg-primary-900 rounded-full h-2">
                  <div className="bg-secondary-500 h-2 rounded-full" style={{ width: '96.8%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-success-500/10 border border-success-500/20 rounded-lg">
              <p className="text-success-400 text-sm text-center">
                <strong>Exceptional Risk-Reward Ratio:</strong> High returns with minimal risk exposure
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Results
