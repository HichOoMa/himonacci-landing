import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calculator, DollarSign, TrendingUp, Shield } from 'lucide-react'

const RiskCalculator = () => {
  const [capital, setCapital] = useState(10000)
  const [parts, setParts] = useState(100)
  const [calculations, setCalculations] = useState({
    perPosition: 0,
    dailyProfit: 0,
    monthlyProfit: 0,
    lossScenario: 0,
    profitScenario: 0,
    netResult: 0
  })

  useEffect(() => {
    const perPosition = capital / parts
    const profitPerPosition = perPosition * 0.02 // 2% profit per position
    const positions = 49 // 49 winning positions
    const dailyProfit = profitPerPosition * positions
    const monthlyProfit = capital * 0.15 // 15% monthly average
    const lossScenario = perPosition * 1 // 1 position loss (assume total loss)
    const profitScenario = profitPerPosition * positions
    const netResult = profitScenario - lossScenario

    setCalculations({
      perPosition,
      dailyProfit,
      monthlyProfit,
      lossScenario,
      profitScenario,
      netResult
    })
  }, [capital, parts])

  const scenarios = [
    {
      title: "Best Case Day",
      description: "49 wins, 1 loss",
      profit: calculations.netResult,
      color: "text-success-500"
    },
    {
      title: "Average Day",
      description: "30 wins, 0 losses",
      profit: (calculations.perPosition * 0.02 * 30),
      color: "text-secondary-500"
    },
    {
      title: "Conservative Day",
      description: "15 wins, 0 losses",
      profit: (calculations.perPosition * 0.02 * 15),
      color: "text-accent-500"
    }
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/3 w-72 h-72 bg-accent-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl"></div>
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
            <span className="gradient-text">Risk Management</span> Calculator
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See how our intelligent capital distribution turns potential losses into consistent profits. 
            Adjust your capital to see real-time calculations.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Calculator Controls */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Calculator className="w-6 h-6 text-secondary-500" />
                <h3 className="text-2xl font-bold text-white">Your Capital</h3>
              </div>

              {/* Capital Input */}
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-3 font-medium">
                    Total Capital (USDT)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={capital}
                      onChange={(e) => setCapital(Number(e.target.value))}
                      min="1000"
                      max="1000000"
                      step="1000"
                      className="w-full pl-10 pr-4 py-3 bg-primary-900/50 border border-gray-600 rounded-lg text-white focus:border-secondary-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    Minimum: $3,000 USDT for optimal results
                  </div>
                </div>

                {/* Parts Slider */}
                <div>
                  <label className="block text-gray-300 mb-3 font-medium">
                    Risk Distribution: {parts} parts
                  </label>
                  <input
                    type="range"
                    value={parts}
                    onChange={(e) => setParts(Number(e.target.value))}
                    min="40"
                    max="200"
                    step="10"
                    className="w-full h-2 bg-primary-900 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-2">
                    <span>40 parts</span>
                    <span>200 parts</span>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-primary-900/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-secondary-500">
                    ${calculations.perPosition.toFixed(0)}
                  </div>
                  <div className="text-gray-400 text-sm">Per Position</div>
                </div>
                <div className="bg-primary-900/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-accent-500">
                    ${calculations.monthlyProfit.toFixed(0)}
                  </div>
                  <div className="text-gray-400 text-sm">Monthly Target</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Profit Scenarios */}
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-6 h-6 text-success-500" />
                <h3 className="text-2xl font-bold text-white">Daily Scenarios</h3>
              </div>

              <div className="space-y-4">
                {scenarios.map((scenario, index) => (
                  <motion.div
                    key={scenario.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex justify-between items-center p-4 bg-primary-900/30 rounded-lg hover:bg-primary-900/50 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white">{scenario.title}</div>
                      <div className="text-gray-400 text-sm">{scenario.description}</div>
                    </div>
                    <div className={`text-xl font-bold ${scenario.color}`}>
                      +${scenario.profit.toFixed(0)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Risk Explanation */}
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-6 h-6 text-accent-500" />
                <h3 className="text-2xl font-bold text-white">Risk Protection</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Worst Case Loss:</span>
                  <span className="text-red-400 font-semibold">
                    -${calculations.lossScenario.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Same Day Recovery:</span>
                  <span className="text-success-500 font-semibold">
                    +${calculations.profitScenario.toFixed(0)}
                  </span>
                </div>
                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Net Result:</span>
                    <span className="text-success-500 font-bold text-xl">
                      +${calculations.netResult.toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-success-500/10 border border-success-500/20 rounded-lg">
                <p className="text-success-400 text-sm">
                  <strong>Key Insight:</strong> Even with 1 complete loss, 49 small wins (2% each) 
                  still generate significant daily profit. This is the power of intelligent risk distribution.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to See This <span className="gradient-text">In Action</span>?
            </h3>
            <p className="text-gray-300 mb-6 text-lg">
              Experience the power of intelligent risk management with real market data
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary px-8 py-3 rounded-xl text-white font-semibold text-lg"
            >
              View Live Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #00D4FF;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #00D4FF;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }
      `}</style>
    </section>
  )
}

export default RiskCalculator
