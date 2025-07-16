import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth'
import SubscriptionManager from '@/lib/subscriptionManager'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  return authenticateToken(req as AuthenticatedRequest, res, async () => {
    try {
      const userId = (req as AuthenticatedRequest).user.id

      // Cancel subscription
      const success = await SubscriptionManager.cancelSubscription(userId)

      if (success) {
        return res.status(200).json({
          success: true,
          message: 'Subscription cancelled successfully'
        })
      } else {
        return res.status(404).json({
          success: false,
          message: 'No active subscription found'
        })
      }

    } catch (error) {
      console.error('Subscription cancellation error:', error)
      return res.status(500).json({ 
        success: false,
        message: 'Internal server error' 
      })
    }
  })
}
