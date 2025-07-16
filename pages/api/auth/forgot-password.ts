import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()

    const { email } = req.body

    // Validate required fields
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ message: 'If an account with that email exists, we have sent you a reset link' })
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email, type: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    // In a real application, you would send an email here
    // For now, we'll just log it or return it in development
    console.log('Password reset token:', resetToken)
    console.log('Reset URL:', `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`)

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, resetToken)

    res.status(200).json({ message: 'If an account with that email exists, we have sent you a reset link' })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
