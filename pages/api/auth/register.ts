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

    const { firstName, lastName, email, password } = req.body

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' })
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
      },
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
