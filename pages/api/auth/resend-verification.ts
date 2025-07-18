import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { sendVerificationEmail } from '@/lib/emailService'
import { generateEmailVerificationToken } from '@/lib/emailValidation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()

    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' })
    }

    // Generate new verification token
    const verificationToken = generateEmailVerificationToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with new token
    user.emailVerificationToken = verificationToken
    user.emailVerificationExpires = verificationExpires
    await user.save()

    // Send verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      user.firstName,
      verificationToken
    )

    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send verification email' })
    }

    res.status(200).json({
      message: 'Verification email sent successfully',
      email: user.email,
    })
  } catch (error) {
    console.error('Resend verification email error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
