import { motion } from 'framer-motion'
import { 
  Eye, 
  Shield, 
  Target, 
  Clock, 
  TrendingUp, 
  Zap,
  BarChart3,
  Settings
} from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: Eye,
      title: "Non-Standard Timeframes",
      description: "We detect patterns others miss by analyzing unique timeframes that most traders overlook",
      color: "text-secondary-500"
    },
    {
      icon: Shield,
      title: "Advanced Risk Management",
      description: "Capital divided into 40+ parts for stable results and calculated losses that turn into profits",
      color: "text-success-500"
    },
    {
      icon: Target,
      title: "Smart Priority System",
      description: "Scoring algorithm selects the best opportunities from 350+ daily signals automatically",
      color: "text-accent-500"
    },
    {
      icon: Clock,
      title: "Monthly Target Management",
      description: "Weekly targets tracked to optimize position closing timing and reduce loss possibility",
      color: "text-primary-400"
    },
    {
      icon: TrendingUp,
      title: "Auto Symbol Selection",
      description: "System automatically follows the best market conditions where opportunities happen",
      color: "text-purple-500"
    },
    {
      icon: Zap,
      title: "Real-time Monitoring",
      description: "24/7 monitoring of your positions, account details, and market opportunities",
      color: "text-orange-500"
    }
  ]

  const platforms = [
    {
      name: "Binance",
      status: "Active",
      description: "Currently supported with full integration"
    },
    {
      name: "MEXC",
      status: "Coming Soon",
      description: "Next phase integration planned"
    },
    {
      name: "ByBit",
      status: "Coming Soon", 
      description: "Future platform expansion"
    },
    {
      name: "OKX",
      status: "Coming Soon",
      description: "Roadmap inclusion confirmed"
    }
  ]

  return (
    <section id="features" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary-500/5 rounded-full blur-3xl"></div>
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
            Core <span className="gradient-text">Features</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Advanced technology and proven strategies combined to deliver 
            consistent results without the complexity of traditional trading.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-8 hover-lift group"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Platform Support */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Platform <span className="gradient-text">Roadmap</span>
            </h3>
            <p className="text-gray-300">
              Multi-exchange support expanding across major trading platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  platform.status === 'Active' 
                    ? 'border-success-500 bg-success-500/10' 
                    : 'border-gray-600 bg-gray-600/10'
                }`}
              >
                <div className="text-center">
                  <div className="text-xl font-bold text-white mb-2">
                    {platform.name}
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                    platform.status === 'Active'
                      ? 'bg-success-500 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {platform.status}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {platform.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Why Choose <span className="gradient-text">HiMonacci</span>?
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Proven Results</h4>
                  <p className="text-gray-400">1+ year track record with 96-97% success rate and consistent monthly returns</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">No Technical Setup</h4>
                  <p className="text-gray-400">Simple signup, add API keys, deposit funds, and start automated trading</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Complete Security</h4>
                  <p className="text-gray-400">No withdrawal access, encrypted API keys, transparent operations</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold gradient-text mb-2">350+</div>
              <div className="text-gray-400">Daily Opportunities Analyzed</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-success-500">96-97%</div>
                <div className="text-gray-400 text-sm">Success Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary-500">12-18%</div>
                <div className="text-gray-400 text-sm">Monthly Returns</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent-500">24/7</div>
                <div className="text-gray-400 text-sm">Monitoring</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-400">$3K+</div>
                <div className="text-gray-400 text-sm">Min Capital</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
