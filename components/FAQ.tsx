import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "What is the minimum capital required?",
      answer: "For the Auto-Trading package, the minimum capital is $3,000 USDT. This minimum ensures our risk management system can work effectively to deliver optimal results. For Dashboard Access only, any amount is acceptable as you'll be manually following signals."
    },
    {
      question: "How are payments processed?",
      answer: "All payments are processed in cryptocurrency only (USDT or other major cryptocurrencies). The subscription fee is $100 USDT monthly, and for auto-trading, we take 25% of the monthly profits. No traditional payment methods are accepted."
    },
    {
      question: "Can I stop auto-trading mid-month?",
      answer: "No, once auto-trading starts, it cannot be stopped before the end of the month. This is essential for the system to achieve optimal results through our monthly target management approach. All operations are handled monthly for consistency."
    },
    {
      question: "What exchanges do you support?",
      answer: "Currently, we support Binance Global with full integration. MEXC, ByBit, and OKX are planned for future phases. You need a Binance Global account to use our auto-trading features."
    },
    {
      question: "How secure are my API keys?",
      answer: "Your API keys are encrypted using bank-level security and never stored in plain text. We only require trading permissions, never withdrawal access. Your funds remain completely under your control at all times."
    },
    {
      question: "What's your success rate?",
      answer: "Based on over 1 year of testing, our success rate is consistently 96-97%. We achieve 12-18% monthly returns through our advanced pattern recognition and risk management system. These are realistic, proven results, not unrealistic promises."
    },
    {
      question: "How does the risk management work?",
      answer: "We divide your capital into 40+ parts for intelligent risk distribution. Even if one position results in a complete loss, 49 small wins (2% each) still generate significant daily profit. This approach turns potential losses into consistent profits."
    },
    {
      question: "Do you provide trading signals?",
      answer: "Yes, both plans include access to our signals and analytics. However, the system must be taken as a complete package for optimal results. Individual signal following may produce different outcomes than our automated approach."
    }
  ]

  return (
    <section id="faq" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-xl text-gray-300">
            Everything you need to know about HiMonacci and our automated trading system
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-secondary-500" />
                  ) : (
                    <Plus className="w-5 h-5 text-secondary-500" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-6">
                      <p className="text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Still Have <span className="gradient-text">Questions</span>?
            </h3>
            <p className="text-gray-300 mb-6">
              Our team is here to help you understand how HiMonacci can work for your trading goals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary px-8 py-3 rounded-xl text-white font-semibold"
              >
                Get Started Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass px-8 py-3 rounded-xl text-white font-semibold border border-gray-600 hover:border-secondary-500 transition-colors"
              >
                Contact Support
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FAQ
