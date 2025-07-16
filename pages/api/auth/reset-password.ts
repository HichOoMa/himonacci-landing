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

    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Check if token is for password reset
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid token type' })
    }

    // Find user
    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update password
    user.password = password
    await user.save()

    res.status(200).json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ message: 'Token has expired' })
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ message: 'Invalid token' })
    }
    
    res.status(500).json({ message: 'Internal server error' })
  }
}
