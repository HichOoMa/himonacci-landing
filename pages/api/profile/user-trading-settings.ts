import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import User from '@/models/User'
import TradingSettings from '@/models/TradingSettings'
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
    console.error('User trading settings API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    // Get all available trading settings
    const allSettings = await TradingSettings.find().sort({ isDefault: -1, createdAt: -1 })
    
    // Get user's current trading settings
    let currentSettings = null
    if (user.tradingSettingsId) {
      currentSettings = await TradingSettings.findById(user.tradingSettingsId)
    }
    
    // If user doesn't have settings or their settings don't exist, use default
    if (!currentSettings) {
      currentSettings = await TradingSettings.findOne({ isDefault: true })
    }

    res.status(200).json({
      success: true,
      currentSettings,
      allSettings,
    })
  } catch (error) {
    console.error('Get user trading settings error:', error)
    res.status(500).json({ message: 'Failed to fetch trading settings' })
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    const { tradingSettingsId } = req.body

    if (!tradingSettingsId) {
      return res.status(400).json({ message: 'Trading settings ID is required' })
    }

    // Verify the trading settings exist
    const tradingSettings = await TradingSettings.findById(tradingSettingsId)
    if (!tradingSettings) {
      return res.status(404).json({ message: 'Trading settings not found' })
    }

    // Update user's trading settings
    user.tradingSettingsId = tradingSettingsId
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Trading settings updated successfully',
      tradingSettings,
    })
  } catch (error) {
    console.error('Update user trading settings error:', error)
    res.status(500).json({ message: 'Failed to update trading settings' })
  }
}
