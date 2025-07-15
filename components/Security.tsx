import { motion } from 'framer-motion'
import { Shield, Lock, Eye, CheckCircle } from 'lucide-react'

const Security = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: "Bank-Level API Security",
      description: "Your API keys are encrypted and never stored in plain text using industry-standard security protocols"
    },
    {
      icon: Shield,
      title: "Read-Only Access",
      description: "We only need trading permissions, never withdrawal access. Your funds stay completely under your control"
    },
    {
      icon: Eye,
      title: "Transparent Operations",
      description: "All trades visible in real-time dashboard with complete transparency of system operations"
    },
    {
      icon: CheckCircle,
      title: "No Hidden Fees",
      description: "Clear pricing with no surprise charges. What you see is exactly what you pay"
    }
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-success-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl"></div>
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
            Security & <span className="gradient-text">Trust</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your security is our priority. We implement industry-leading practices 
            to protect your data and ensure complete transparency.
          </p>
        </motion.div>

        {/* Security Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-xl p-8 hover-lift"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-success-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Why You Can <span className="gradient-text">Trust</span> HiMonacci
            </h3>
            <p className="text-gray-300">
              Built with security and transparency as core principles
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-success-500 mb-2">100%</div>
              <div className="text-white font-semibold mb-2">Transparent</div>
              <p className="text-gray-400 text-sm">
                All operations visible in real-time with complete trade history
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-500 mb-2">0</div>
              <div className="text-white font-semibold mb-2">Withdrawal Access</div>
              <p className="text-gray-400 text-sm">
                We never have access to withdraw your funds from your account
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-500 mb-2">24/7</div>
              <div className="text-white font-semibold mb-2">Monitoring</div>
              <p className="text-gray-400 text-sm">
                Continuous system monitoring and account protection
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data Protection */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Data <span className="gradient-text">Protection</span>
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Encrypted Storage</h4>
                  <p className="text-gray-400">All user data encrypted using AES-256 encryption standards</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">GDPR Compliant</h4>
                  <p className="text-gray-400">Full compliance with data protection regulations</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Regular Audits</h4>
                  <p className="text-gray-400">Continuous security assessments and improvements</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-8">
            <h4 className="text-xl font-bold text-white mb-6 text-center">
              Security Checklist
            </h4>
            <div className="space-y-4">
              {[
                "API keys encrypted at rest",
                "No withdrawal permissions required",
                "Real-time trade monitoring",
                "Secure data transmission (SSL/TLS)",
                "Regular security updates",
                "Transparent fee structure"
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-success-500/10 border border-success-500/20 rounded-lg">
              <p className="text-success-400 text-sm text-center">
                <strong>Your funds remain in your control at all times</strong>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Security
