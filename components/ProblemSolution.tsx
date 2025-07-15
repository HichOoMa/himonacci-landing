import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Clock, DollarSign } from 'lucide-react'

const ProblemSolution = () => {
  const problems = [
    {
      icon: AlertTriangle,
      title: "Unrealistic Promises",
      description: "Tired of '1000% gains' and other crypto trading lies that never deliver?"
    },
    {
      icon: TrendingDown,
      title: "Emotional Trading",
      description: "Losing money due to fear, greed, and poor timing decisions?"
    },
    {
      icon: Clock,
      title: "No Time to Learn",
      description: "Don't have time to master complex trading strategies and market analysis?"
    }
  ]

  const solutions = [
    {
      icon: CheckCircle,
      title: "Realistic Returns",
      description: "Stable 12-18% monthly profits based on 1+ year of proven results"
    },
    {
      icon: TrendingUp,
      title: "Automated System",
      description: "Remove emotions with AI-powered pattern recognition and execution"
    },
    {
      icon: DollarSign,
      title: "Passive Income",
      description: "Set it up once and let the system work 24/7 for consistent profits"
    }
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-success-500/5 rounded-full blur-3xl"></div>
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
            Tired of Crypto Trading <span className="text-red-400">Lies</span>?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            HiMonacci targets everyone - beginners, busy professionals, passive income seekers - 
            with a proven, automated system that delivers real results.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Problems Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-red-400 mb-4">
                Common Problems
              </h3>
              <p className="text-gray-400">
                These issues plague most crypto traders and prevent consistent profits
              </p>
            </div>

            <div className="space-y-6">
              {problems.map((problem, index) => (
                <motion.div
                  key={problem.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 p-6 rounded-xl bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <problem.icon className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {problem.title}
                    </h4>
                    <p className="text-gray-400">
                      {problem.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Solutions Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-success-500 mb-4">
                HiMonacci Solutions
              </h3>
              <p className="text-gray-400">
                Our premium system addresses each problem with proven technology
              </p>
            </div>

            <div className="space-y-6">
              {solutions.map((solution, index) => (
                <motion.div
                  key={solution.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 p-6 rounded-xl bg-success-500/5 border border-success-500/20 hover:border-success-500/40 transition-colors hover-lift"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-success-500/20 rounded-lg flex items-center justify-center">
                    <solution.icon className="w-6 h-6 text-success-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {solution.title}
                    </h4>
                    <p className="text-gray-400">
                      {solution.description}
                    </p>
                  </div>
                </motion.div>
              ))}
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
              Ready for a <span className="gradient-text">Different Approach</span>?
            </h3>
            <p className="text-gray-300 mb-6 text-lg">
              Join traders who've moved beyond hype to achieve consistent, realistic profits
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary px-8 py-3 rounded-xl text-white font-semibold text-lg"
            >
              Learn How It Works
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ProblemSolution
