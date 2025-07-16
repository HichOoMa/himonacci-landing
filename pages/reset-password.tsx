import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { TrendingUp, Eye, EyeOff, Lock, ArrowRight } from 'lucide-react'

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isValidToken, setIsValidToken] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    const tokenFromQuery = router.query.token as string
    if (tokenFromQuery) {
      setToken(tokenFromQuery)
      validateToken(tokenFromQuery)
    }
  }, [router.query.token])

  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToValidate }),
      })

      if (response.ok) {
        setIsValidToken(true)
      } else {
        setIsValidToken(false)
        setMessage('Invalid or expired reset token')
      }
    } catch (error) {
      setIsValidToken(false)
      setMessage('Error validating reset token')
    }
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return

    setIsLoading(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      if (response.ok) {
        router.push('/login?message=Password reset successfully! Please log in with your new password.')
      } else {
        const errorData = await response.json()
        setMessage(errorData.message || 'Password reset failed')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setMessage('An error occurred during password reset')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-hero-pattern flex items-center justify-center px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h1>
          <p className="text-gray-400 mb-6">This password reset link is invalid or expired.</p>
          <Link href="/forgot-password" className="btn-primary px-6 py-2 rounded-lg text-white font-semibold">
            Request New Reset Link
          </Link>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-hero-pattern flex items-center justify-center px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h1>
          <p className="text-gray-400 mb-6">{message || 'This password reset link is invalid or expired.'}</p>
          <Link href="/forgot-password" className="btn-primary px-6 py-2 rounded-lg text-white font-semibold">
            Request New Reset Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hero-pattern flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">HiMonacci</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-gray-400">Enter your new password</p>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400"
          >
            {message}
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass rounded-2xl p-8 shadow-xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full pl-10 pr-12 py-3 bg-primary-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 transition-all duration-200"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="w-full pl-10 pr-12 py-3 bg-primary-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 transition-all duration-200"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 px-6 rounded-lg text-white font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="loading-dots">Updating password</div>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}
