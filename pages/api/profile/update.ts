import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import User from '@/models/User'
import dbConnect from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await dbConnect()

    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const user = await User.findById(decoded.userId)
    console.log('User found:', user)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const {
      firstName,
      lastName,
      email,
      binanceApiKey,
      binanceApiSecret,
      isAutoTradingEnabled,
      bnbBurnEnabled,
      acceptedTermsOfUse,
      riskTolerance,
      maxDailyLoss,
      maxPositionSize,
      preferredTradingPairs,
    } = req.body

        console.log("bnb burn enabled:", bnbBurnEnabled)

    // Update basic profile fields
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (email) user.email = email

    // Update trading settings
    if (binanceApiKey !== undefined) user.binanceApiKey = binanceApiKey
    if (binanceApiSecret !== undefined) user.binanceApiSecret = binanceApiSecret
    if (isAutoTradingEnabled !== undefined) user.isAutoTradingEnabled = isAutoTradingEnabled
    if (bnbBurnEnabled !== undefined) user.bnbBurnEnabled = bnbBurnEnabled
    if (acceptedTermsOfUse !== undefined) {
      user.acceptedTermsOfUse = acceptedTermsOfUse
      if (acceptedTermsOfUse) {
        user.termsAcceptedAt = new Date()
      }
    }
    if (riskTolerance) user.riskTolerance = riskTolerance
    if (maxDailyLoss !== undefined) user.maxDailyLoss = maxDailyLoss
    if (maxPositionSize !== undefined) user.maxPositionSize = maxPositionSize
    if (preferredTradingPairs) user.preferredTradingPairs = preferredTradingPairs

    console.log('Updating user:', user)
    await user.save()

    // Return user data without sensitive fields
    const userResponse = user.toJSON()
    delete userResponse.binanceApiKey
    delete userResponse.binanceApiSecret

    res.status(200).json({
      message: 'Profile updated successfully',
      user: userResponse,
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
