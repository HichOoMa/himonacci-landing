import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { validateEmailForRegistration, generateEmailVerificationToken, normalizeEmail } from '@/lib/emailValidation'
import { sendVerificationEmail } from '@/lib/emailService'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()

    const { firstName, lastName, email, password } = req.body

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Validate email format and check for spam
    const emailValidation = validateEmailForRegistration(email)
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.error })
    }

    // Normalize email to prevent duplicates
    const normalizedEmail = normalizeEmail(email)

    // Check if user already exists with normalized email
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' })
    }

    // Generate email verification token
    const verificationToken = generateEmailVerificationToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
      isVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      hasUsedFreeTrial: false,
    })

    await user.save()

    // Send verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      user.firstName,
      verificationToken
    )

    if (!emailResult.success) {
      // If email sending fails, we still want to create the user
      // but inform them that they need to request a new verification email
      console.error('Failed to send verification email:', emailResult.error)
    }

    // Generate JWT token (user can login but features will be restricted until verified)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User created successfully. Please check your email for verification link.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
        subscriptionStatus: user.subscriptionStatus,
        hasUsedFreeTrial: user.hasUsedFreeTrial,
      },
      emailSent: emailResult.success,
    })
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error) {
      // Handle mongoose validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation error', errors: error.message })
      }
      
      // Handle duplicate key error
      if (error.message.includes('E11000')) {
        return res.status(400).json({ message: 'User already exists with this email' })
      }
    }

    res.status(500).json({ message: 'Internal server error' })
  }
}
