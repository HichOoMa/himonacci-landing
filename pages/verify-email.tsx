import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Check, X, Clock, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmail() {
  const router = useRouter()
  const { token } = router.query
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [userData, setUserData] = useState<any>(null)
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!token) return

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message)
          setUserData(data.user)
          
          // Store token for auto-login
          if (data.token) {
            localStorage.setItem('token', data.token)
          }
        } else {
          setStatus('error')
          setMessage(data.message || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred during verification')
      }
    }

    verifyEmail()
  }, [token])

  // Update trial countdown
  useEffect(() => {
    if (userData?.freeTrialEndDate) {
      const interval = setInterval(() => {
        const now = new Date()
        const endTime = new Date(userData.freeTrialEndDate)
        const timeLeft = endTime.getTime() - now.getTime()

        if (timeLeft > 0) {
          const minutes = Math.floor(timeLeft / (1000 * 60))
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)
          setTimeRemaining({ minutes, seconds })
        } else {
          setTimeRemaining({ minutes: 0, seconds: 0 })
          clearInterval(interval)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [userData])

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0')
  }

  return (
    <div className="min-h-screen bg-hero-pattern flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-8 text-center"
        >
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-secondary-500/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-secondary-500 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-white">Verifying Email...</h1>
              <p className="text-gray-400">Please wait while we verify your email address.</p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500"></div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-success-500/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-success-500" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
                <p className="text-gray-400">{message}</p>
              </div>

              {userData?.subscriptionStatus === 'trial' && (
                <div className="bg-gradient-to-r from-success-500/20 to-accent-500/20 rounded-xl p-6 border border-success-500/30">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Clock className="w-5 h-5 text-success-500" />
                    <span className="text-success-500 font-semibold">Free Trial Active</span>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-white mb-2">
                      {formatTime(timeRemaining.minutes)}:{formatTime(timeRemaining.seconds)}
                    </div>
                    <p className="text-sm text-gray-400">Minutes remaining in your free trial</p>
                  </div>

                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center justify-center space-x-2">
                      <Check className="w-4 h-4 text-success-500" />
                      <span>Full access to all premium features</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Check className="w-4 h-4 text-success-500" />
                      <span>Real-time trading signals</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Check className="w-4 h-4 text-success-500" />
                      <span>Advanced market analysis</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Link href="/dashboard">
                  <button className="w-full btn-primary py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2">
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                
                {userData?.subscriptionStatus === 'trial' && (
                  <p className="text-xs text-gray-400">
                    Start trading immediately with your free trial access
                  </p>
                )}
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <X className="w-8 h-8 text-red-500" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
                <p className="text-gray-400">{message}</p>
              </div>

              <div className="space-y-3">
                <Link href="/resend-verification">
                  <button className="w-full btn-secondary py-3 px-6 rounded-xl font-semibold">
                    Request New Verification Email
                  </button>
                </Link>
                
                <Link href="/login">
                  <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors">
                    Back to Login
                  </button>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
