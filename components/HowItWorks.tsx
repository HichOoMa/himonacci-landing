import { motion } from 'framer-motion'
import { Search, Brain, Target, ArrowRight } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Pattern Detection",
      description: "Our system analyzes non-standard timeframes that most traders miss, identifying unique patterns with 96-97% accuracy.",
      details: [
        "Scans 350+ daily opportunities",
        "Focuses on overlooked timeframes",
        "Advanced pattern recognition"
      ]
    },
    {
      number: "02",
      icon: Brain,
      title: "Smart Risk Management",
      description: "Capital is divided into 40+ parts, ensuring stable results and calculated losses that turn into profits quickly.",
      details: [
        "Intelligent capital distribution",
        "Risk calculated across all positions",
        "No traditional stop-losses needed"
      ]
    },
    {
      number: "03",
      icon: Target,
      title: "Automated Execution",
      description: "Priority scoring system selects the best opportunities and executes trades automatically on your Binance account.",
      details: [
        "24/7 automated trading",
        "Monthly target management",
        "Direct API integration"
      ]
    }
  ]

  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent-500/5 rounded-full blur-3xl"></div>
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
            How <span className="gradient-text">HiMonacci</span> Works
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our three-step process combines advanced technology with proven risk management 
            to deliver consistent results without the complexity.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
            >
              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="text-6xl font-bold text-secondary-500/20">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-lg">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {step.details.map((detail, detailIndex) => (
                    <motion.div
                      key={detailIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.2 + detailIndex * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                      <span className="text-gray-300">{detail}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Visual */}
              <div className="flex-1 flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className="w-80 h-80 glass rounded-2xl flex items-center justify-center hover-lift">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                        <step.icon className="w-12 h-12 text-white" />
                      </div>
                      <div className="text-4xl font-bold gradient-text mb-2">
                        {step.number}
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {step.title}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connection Arrow */}
                  {index < steps.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                      viewport={{ once: true }}
                      className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 hidden lg:block"
                    >
                      <ArrowRight className="w-8 h-8 text-secondary-500 rotate-90" />
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="glass rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-secondary-500 mb-2">96-97%</div>
                <div className="text-gray-400">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent-500 mb-2">350+</div>
                <div className="text-gray-400">Daily Opportunities</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-success-500 mb-2">12-18%</div>
                <div className="text-gray-400">Monthly Returns</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary px-8 py-4 rounded-xl text-white font-semibold text-lg flex items-center space-x-2 mx-auto"
          >
            <span>See It In Action</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks
