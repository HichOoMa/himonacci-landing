import { motion } from 'framer-motion'
import { ArrowRight, Star, TrendingUp } from 'lucide-react'

interface FinalCTAProps {
  onCTAClick?: () => void
}

const FinalCTA = ({ onCTAClick }: FinalCTAProps) => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-950 via-primary-900 to-primary-950"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-success-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main CTA Content */}
          <div className="max-w-4xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Start Your <span className="gradient-text">Stable Crypto Journey</span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                Join the system that's delivering consistent 12-18% monthly returns 
                to traders worldwide. No hype, just proven results.
              </p>
            </motion.div>

            {/* Key Benefits Reminder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            >
              <div className="glass rounded-xl p-6">
                <div className="w-12 h-12 bg-success-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-success-500" />
                </div>
                <div className="text-2xl font-bold text-success-500 mb-2">96-97%</div>
                <div className="text-gray-300">Success Rate</div>
              </div>
              <div className="glass rounded-xl p-6">
                <div className="w-12 h-12 bg-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-secondary-500" />
                </div>
                <div className="text-2xl font-bold text-secondary-500 mb-2">12-18%</div>
                <div className="text-gray-300">Monthly Returns</div>
              </div>
              <div className="glass rounded-xl p-6">
                <div className="w-12 h-12 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="w-6 h-6 text-accent-500" />
                </div>
                <div className="text-2xl font-bold text-accent-500 mb-2">365+</div>
                <div className="text-gray-300">Days Proven</div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCTAClick}
                className="btn-primary px-10 py-4 rounded-xl text-white font-bold text-xl flex items-center space-x-3 shadow-2xl"
              >
                <span>Start Free Trial Now</span>
                <ArrowRight className="w-6 h-6" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass px-10 py-4 rounded-xl text-white font-bold text-xl border-2 border-gray-600 hover:border-secondary-500 transition-colors"
              >
                View Dashboard Demo
              </motion.button>
            </motion.div>

            {/* Free Trial Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="bg-success-500/10 border border-success-500/20 rounded-lg p-4 mb-8 max-w-2xl mx-auto"
            >
              <p className="text-success-400 text-sm text-center font-semibold">
                🚀 Start with a FREE 1-hour trial • No payment required • Experience all features instantly
              </p>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-400"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span>No Withdrawal Access Required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-secondary-500 rounded-full"></div>
                <span>Crypto Payments Only</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                <span>$3,000 USDT Minimum</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="glass rounded-xl p-6 border border-gray-700">
              <p className="text-gray-400 text-sm leading-relaxed">
                <strong className="text-white">Important Disclaimer:</strong> Past performance doesn't guarantee future results. 
                System must be taken as complete package for optimal results. Individual signal following may produce 
                different outcomes. Auto-trading cannot be stopped mid-month once started. All operations handled monthly 
                for consistency and optimal performance.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA
