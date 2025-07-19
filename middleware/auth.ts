import jwt from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: 'user' | 'admin'
  }
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Access token required' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    await connectDB()
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || 'user',
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' })
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' })
    }
    
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export default authenticateToken
