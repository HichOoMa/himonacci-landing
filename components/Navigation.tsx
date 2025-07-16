import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Menu, X, TrendingUp, User, LogOut, ChevronDown, Sparkles, Shield, Zap } from 'lucide-react'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'How It Works', href: '#how-it-works', icon: Zap },
    { name: 'Features', href: '#features', icon: Sparkles },
    { name: 'Pricing', href: '#pricing', icon: Shield },
    { name: 'FAQ', href: '#faq', icon: null },
  ]

  const handleUserDropdown = () => {
    console.log('Toggle dropdown:', !showUserDropdown)
    setShowUserDropdown(!showUserDropdown)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserDropdown && !(event.target as Element).closest('.user-dropdown')) {
        setShowUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserDropdown])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-primary-950/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      {/* Animated gradient line */}
      <div className={`h-0.5 bg-gradient-to-r from-secondary-500 via-accent-500 to-secondary-500 transition-opacity duration-500 nav-shimmer ${
        scrolled ? 'opacity-100' : 'opacity-0'
      }`} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Enhanced Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3 group"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 via-accent-500 to-secondary-400 rounded-xl flex items-center justify-center shadow-lg shadow-secondary-500/25 group-hover:shadow-secondary-500/40 transition-shadow duration-300 nav-pulse">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/50 to-accent-500/50 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold gradient-text">HiMonacci</span>
              <span className="text-xs text-secondary-400 font-medium -mt-1">Trading Platform</span>
            </div>
          </motion.div>

          {/* Centered Navigation Items */}
          <div className="flex-1 flex justify-center">
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative group px-4 py-2 rounded-lg transition-all duration-300 hover:bg-secondary-500/10"
                >
                  <div className="flex items-center space-x-2">
                    {item.icon && <item.icon className="w-4 h-4 text-gray-400 group-hover:text-secondary-400 transition-colors" />}
                    <span className="text-gray-300 group-hover:text-secondary-400 transition-colors duration-200 font-medium">
                      {item.name}
                    </span>
                  </div>
                  {/* Animated underline */}
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-secondary-500 to-accent-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Enhanced User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative user-dropdown">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUserDropdown}
                  className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-800/50 to-primary-700/50 hover:from-primary-700/70 hover:to-primary-600/70 border border-secondary-500/20 hover:border-secondary-500/40 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium text-sm">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className={`text-xs ${
                      user.subscriptionStatus === 'active' 
                        ? 'text-success-400' 
                        : 'text-yellow-400'
                    }`}>
                      {user.subscriptionStatus === 'active' ? 'Premium' : 'Free'}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    showUserDropdown ? 'rotate-180' : ''
                  }`} />
                </motion.button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-primary-900/95 backdrop-blur-xl rounded-2xl border border-secondary-500/20 shadow-2xl shadow-secondary-500/10 overflow-hidden z-[60]"
                      style={{ zIndex: 60 }}
                    >
                      <div className="p-4 border-b border-gray-700/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-semibold">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-gray-400 text-sm">{user.email}</div>
                            <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                              user.subscriptionStatus === 'active' 
                                ? 'bg-success-500/20 text-success-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {user.subscriptionStatus === 'active' ? 'Premium Member' : 'Free Account'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        {user.subscriptionStatus === 'active' ? (
                          <Link href="/dashboard">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left hover:bg-secondary-500/10 transition-colors group"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              <TrendingUp className="w-5 h-5 text-secondary-400 group-hover:text-secondary-300" />
                              <span className="text-white font-medium">Dashboard</span>
                            </motion.button>
                          </Link>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left hover:bg-accent-500/10 transition-colors group"
                            onClick={() => {
                              setShowUserDropdown(false)
                              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                            }}
                          >
                            <Sparkles className="w-5 h-5 text-accent-400 group-hover:text-accent-300" />
                            <span className="text-white font-medium">Upgrade to Premium</span>
                          </motion.button>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            logout()
                            setShowUserDropdown(false)
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left hover:bg-red-500/10 transition-colors group"
                        >
                          <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                          <span className="text-white font-medium">Logout</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-primary-800/50 transition-all duration-300 font-medium border border-transparent hover:border-gray-600/50"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary px-8 py-2.5 rounded-xl text-white font-semibold shadow-lg shadow-secondary-500/25 hover:shadow-secondary-500/40 transition-all duration-300"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl bg-primary-800/50 hover:bg-primary-700/70 border border-secondary-500/20 hover:border-secondary-500/40 transition-all duration-300 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                  ) : (
                    <Menu className="w-6 h-6 text-white" />
                  )}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden bg-primary-900/95 backdrop-blur-xl rounded-2xl mx-4 mb-4 border border-secondary-500/20 shadow-2xl"
            >
              <div className="p-6 space-y-4">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 text-gray-300 hover:text-secondary-400 transition-colors duration-200 font-medium py-3 px-4 rounded-xl hover:bg-secondary-500/10 group"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && <item.icon className="w-5 h-5 text-gray-400 group-hover:text-secondary-400 transition-colors" />}
                    <span>{item.name}</span>
                  </motion.a>
                ))}
                
                {/* Mobile menu for authenticated/unauthenticated users */}
                {user ? (
                  <div className="space-y-4 pt-4 border-t border-gray-700/50">
                    <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-800/50 to-primary-700/50 border border-secondary-500/20">
                      <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className={`text-xs ${
                          user.subscriptionStatus === 'active' 
                            ? 'text-success-400' 
                            : 'text-yellow-400'
                        }`}>
                          {user.subscriptionStatus === 'active' ? 'Premium Member' : 'Free Account'}
                        </div>
                      </div>
                    </div>
                    
                    {user.subscriptionStatus === 'active' ? (
                      <Link href="/dashboard">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-white font-semibold shadow-lg transition-all duration-300"
                          onClick={() => setIsOpen(false)}
                        >
                          <TrendingUp className="w-5 h-5" />
                          <span>Dashboard</span>
                        </motion.button>
                      </Link>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-500 to-secondary-500 hover:from-accent-600 hover:to-secondary-600 text-white font-semibold shadow-lg transition-all duration-300"
                        onClick={() => {
                          setIsOpen(false)
                          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                      >
                        <Sparkles className="w-5 h-5" />
                        <span>Upgrade to Premium</span>
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors font-medium"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 border-t border-gray-700/50">
                    <Link href="/login">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-primary-800/50 transition-all duration-300 font-medium border border-gray-600/50"
                        onClick={() => setIsOpen(false)}
                      >
                        Login
                      </motion.button>
                    </Link>
                    <Link href="/register">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-secondary-500 to-accent-500 hover:from-secondary-600 hover:to-accent-600 text-white font-semibold shadow-lg transition-all duration-300"
                        onClick={() => setIsOpen(false)}
                      >
                        Get Started
                      </motion.button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

export default Navigation
