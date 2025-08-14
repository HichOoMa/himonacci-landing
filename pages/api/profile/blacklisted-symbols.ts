import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import User from '@/models/User'
import dbConnect from '@/lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()

    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const user = await User.findById(decoded.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    switch (req.method) {
      case 'GET':
        return handleGet(req, res, user)
      case 'PUT':
        return handlePut(req, res, user)
      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Blacklisted symbols API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    res.status(200).json({
      success: true,
      blacklistedSymbols: user.blacklistedSymbols || [],
    })
  } catch (error) {
    console.error('Get blacklisted symbols error:', error)
    res.status(500).json({ message: 'Failed to fetch blacklisted symbols' })
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    const { blacklistedSymbols } = req.body

    if (!Array.isArray(blacklistedSymbols)) {
      return res.status(400).json({ message: 'Blacklisted symbols must be an array' })
    }

    // Validate symbols format
    const invalidSymbols = blacklistedSymbols.filter(symbol => 
      typeof symbol !== 'string' || !/^[A-Z]{2,10}USDT$/.test(symbol.toUpperCase())
    )

    if (invalidSymbols.length > 0) {
      return res.status(400).json({ 
        message: 'Invalid symbols format. All symbols must be valid trading pairs ending with USDT',
        invalidSymbols 
      })
    }

    // Convert to uppercase and remove duplicates
    const normalizedSymbols = Array.from(new Set(blacklistedSymbols.map(symbol => symbol.toUpperCase())))

    // Update user's blacklisted symbols
    user.blacklistedSymbols = normalizedSymbols
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Blacklisted symbols updated successfully',
      blacklistedSymbols: normalizedSymbols,
    })
  } catch (error) {
    console.error('Update blacklisted symbols error:', error)
    res.status(500).json({ message: 'Failed to update blacklisted symbols' })
  }
}
