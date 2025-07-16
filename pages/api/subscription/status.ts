import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth'
import SubscriptionManager from '@/lib/subscriptionManager'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  return authenticateToken(req as AuthenticatedRequest, res, async () => {
    try {
      const userId = (req as AuthenticatedRequest).user.id

      // Get subscription details
      const subscription = await SubscriptionManager.getUserSubscription(userId)
      
      if (!subscription) {
        return res.status(200).json({
          hasSubscription: false,
          status: 'inactive',
          message: 'No subscription found'
        })
      }

      // Check subscription status
      const statusCheck = await SubscriptionManager.checkSubscriptionStatus(userId)

      return res.status(200).json({
        hasSubscription: true,
        subscription: {
          id: subscription._id,
          status: subscription.status,
          plan: subscription.plan,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          nextPaymentDue: subscription.nextPaymentDue,
          gracePeriodEnd: subscription.gracePeriodEnd,
          autoRenewal: subscription.autoRenewal,
          paymentHistory: subscription.paymentHistory
        },
        statusCheck: {
          isActive: statusCheck.isActive,
          daysRemaining: statusCheck.daysRemaining,
          gracePeriodRemaining: statusCheck.gracePeriodRemaining,
          nextPaymentDue: statusCheck.nextPaymentDue
        }
      })

    } catch (error) {
      console.error('Subscription status error:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  })
}
