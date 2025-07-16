import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ message: 'Token is required' })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Check if token is for password reset
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid token type' })
    }

    res.status(200).json({ message: 'Token is valid', userId: decoded.userId })
  } catch (error) {
    console.error('Token validation error:', error)
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ message: 'Token has expired' })
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ message: 'Invalid token' })
    }
    
    res.status(500).json({ message: 'Internal server error' })
  }
}
