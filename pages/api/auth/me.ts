import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Subscription from '@/models/Subscription'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  authenticateToken(req as AuthenticatedRequest, res, async () => {
    try {
      await connectDB()
      
      const { user } = req as AuthenticatedRequest
      
      // Fetch complete user data from database
      const userData = await User.findById(user.id).select('-password')
      
      if (!userData) {
        return res.status(404).json({ message: 'User not found' })
      }
      const subscription = await Subscription.findOne({ userId: user.id })

      if (!subscription) {
        return res.status(403).json({ message: 'Subscription not found' })
      }

      res.status(200).json({
        message: 'User profile retrieved successfully',
        user: {
          id: userData._id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          isVerified: userData.isVerified,
          subscriptionStatus: subscription.isActive() ? 'active' : 'inactive',
          subscriptionStartDate: subscription.startDate,
          subscriptionEndDate: subscription.endDate,
          paymentTransactionHash: subscription.paymentTransactionHash,
        },
      })
    } catch (error) {
      console.error('Error fetching user data:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  })
}
