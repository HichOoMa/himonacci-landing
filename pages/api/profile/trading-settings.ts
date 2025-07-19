import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import User from '@/models/User'
import dbConnect from '@/lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await dbConnect()

    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const user = await User.findById(decoded.userId).select('+binanceApiKey +binanceApiSecret')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Return trading settings without exposing the full API secret
    const tradingSettings = {
      binanceApiKey: user.binanceApiKey || '',
      binanceApiSecret: user.binanceApiSecret ? '***************' : '',
      hasApiCredentials: !!(user.binanceApiKey && user.binanceApiSecret),
      isAutoTradingEnabled: user.isAutoTradingEnabled || false,
      acceptedTermsOfUse: user.acceptedTermsOfUse || false,
      termsAcceptedAt: user.termsAcceptedAt,
      riskTolerance: user.riskTolerance || 'medium',
      maxDailyLoss: user.maxDailyLoss || 100,
      maxPositionSize: user.maxPositionSize || 1000,
      preferredTradingPairs: user.preferredTradingPairs || ['BTCUSDT', 'ETHUSDT'],
    }

    res.status(200).json({
      tradingSettings,
    })
  } catch (error) {
    console.error('Trading settings fetch error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
