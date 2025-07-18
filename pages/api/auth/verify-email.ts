import type { NextApiRequest, NextApiResponse } from 'next'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Subscription from '@/models/Subscription'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await connectDB()

    const { token } = req.query

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Invalid verification token' })
    }

    // Find user with this verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' })
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' })
    }

    // Mark user as verified
    user.isVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined

    const subscription = await Subscription.findOne({ userId: user._id })
    if (!subscription && !user.hasUsedFreeTrial) {
      const now = new Date()
      const trialEnd = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now

      user.subscriptionStatus = 'trial'
      user.hasUsedFreeTrial = true
      user.freeTrialStartDate = now
      user.freeTrialEndDate = trialEnd

      // Create trial subscription record
      const trialSubscription = new Subscription({
        userId: user._id,
        plan: 'trial',
        status: 'active',
        startDate: now,
        endDate: trialEnd,
        monthlyPrice: 0,
        isFreeTrial: true,
        autoRenewal: false,
        nextPaymentDue: trialEnd,
        paymentHistory: []
      })

      await trialSubscription.save()
    }

    await user.save()

    res.status(200).json({
      message: 'Email verified successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
        subscriptionStatus: user.subscriptionStatus,
        freeTrialStartDate: user.freeTrialStartDate,
        freeTrialEndDate: user.freeTrialEndDate,
        hasUsedFreeTrial: user.hasUsedFreeTrial,
      },
    })
  } catch (error) {
    console.error('Email verification error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
