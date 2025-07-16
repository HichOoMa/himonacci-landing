import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Menu, X, TrendingUp, User, LogOut } from 'lucide-react'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-primary-950/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">HiMonacci</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                whileHover={{ scale: 1.05 }}
                className="text-gray-300 hover:text-secondary-500 transition-colors duration-200 font-medium"
              >
                {item.name}
              </motion.a>
            ))}
            
            {/* Show different buttons based on authentication status */}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300 font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                {user.subscriptionStatus === 'active' ? (
                  <Link href="/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary px-6 py-2 rounded-lg text-white font-semibold"
                    >
                      Dashboard
                    </motion.button>
                  </Link>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary px-6 py-2 rounded-lg text-white font-semibold"
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Subscribe Now
                  </motion.button>
                )}
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/30 rounded-full"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary px-6 py-2 rounded-lg text-white font-semibold"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block text-gray-300 hover:text-secondary-500 transition-colors duration-200 font-medium"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}
            
            {/* Mobile menu for authenticated/unauthenticated users */}
            {user ? (
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300 font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                {user.subscriptionStatus === 'active' ? (
                  <Link href="/dashboard">
                    <button className="btn-primary w-full py-2 rounded-lg text-white font-semibold">
                      Dashboard
                    </button>
                  </Link>
                ) : (
                  <button 
                    className="btn-primary w-full py-2 rounded-lg text-white font-semibold"
                    onClick={() => {
                      setIsOpen(false)
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    Subscribe Now
                  </button>
                )}
                <button 
                  onClick={logout}
                  className="w-full text-left text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <Link href="/login">
                  <button className="block w-full text-left text-gray-300 hover:text-white transition-colors font-medium">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="btn-primary w-full py-2 rounded-lg text-white font-semibold">
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  )
}

export default Navigation
