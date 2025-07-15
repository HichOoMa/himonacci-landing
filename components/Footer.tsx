import { motion } from 'framer-motion'
import { TrendingUp, Mail, MessageCircle } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-primary-950 border-t border-gray-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold gradient-text">HiMonacci</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Premium automated trading system delivering stable crypto profits 
                through advanced pattern recognition and intelligent risk management.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex space-x-6"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-success-500">96-97%</div>
                <div className="text-gray-500 text-sm">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-500">12-18%</div>
                <div className="text-gray-500 text-sm">Monthly Returns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-500">365+</div>
                <div className="text-gray-500 text-sm">Days Proven</div>
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-secondary-500 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-gray-400 hover:text-secondary-500 transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-secondary-500 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-gray-400 hover:text-secondary-500 transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Contact */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-secondary-500" />
                  <span className="text-gray-400">support@himonacci.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-secondary-500" />
                  <span className="text-gray-400">Live Chat Support</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-500 text-sm">
              © 2024 HiMonacci. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-secondary-500 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-secondary-500 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-secondary-500 transition-colors">
                Risk Disclosure
              </a>
            </div>
          </div>
        </motion.div>

        {/* Final Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-800"
        >
          <p className="text-gray-500 text-xs leading-relaxed text-center">
            <strong>Risk Warning:</strong> Trading cryptocurrencies involves substantial risk and may not be suitable for all investors. 
            Past performance is not indicative of future results. Only invest what you can afford to lose. 
            HiMonacci provides automated trading services but cannot guarantee profits. All trading involves risk of loss.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
