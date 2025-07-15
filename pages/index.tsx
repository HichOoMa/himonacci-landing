import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Hero from '@/components/Hero'
import ProblemSolution from '@/components/ProblemSolution'
import HowItWorks from '@/components/HowItWorks'
import RiskCalculator from '@/components/RiskCalculator'
import LiveDashboard from '@/components/LiveDashboard'
import Features from '@/components/Features'
import Results from '@/components/Results'
import Pricing from '@/components/Pricing'
import Security from '@/components/Security'
import FAQ from '@/components/FAQ'
import FinalCTA from '@/components/FinalCTA'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-hero-pattern">
      <Navigation />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Hero Section */}
        <Hero />
        
        {/* Problem/Solution Section */}
        <ProblemSolution />
        
        {/* How It Works Section */}
        <HowItWorks />
        
        {/* Interactive Risk Calculator */}
        <RiskCalculator />
        
        {/* Live Performance Dashboard */}
        <LiveDashboard />
        
        {/* Core Features */}
        <Features />
        
        {/* Results & Proof */}
        <Results />
        
        {/* Pricing Section */}
        <Pricing />
        
        {/* Security & Trust */}
        <Security />
        
        {/* FAQ Section */}
        <FAQ />
        
        {/* Final CTA */}
        <FinalCTA />
      </motion.main>
      
      <Footer />
    </div>
  )
}
