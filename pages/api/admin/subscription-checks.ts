import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth'
import SubscriptionManager from '@/lib/subscriptionManager'
import User from '@/models/User'

// Admin endpoint to manually trigger monthly subscription checks
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Use middleware pattern
  return authenticateToken(req as AuthenticatedRequest, res, async () => {
    try {
      const userId = (req as AuthenticatedRequest).user.id
      const user = await User.findById(userId)
    
      // Check if user is admin (you can add admin role to User model)
      if (!user || user.email !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ message: 'Admin access required' })
      }

      // Run monthly subscription checks
      const results = await SubscriptionManager.processMonthlyChecks()
      
      // Get updated statistics
      const stats = await SubscriptionManager.getSubscriptionStats()

      res.status(200).json({
        success: true,
        message: 'Monthly subscription checks completed',
        results,
        stats
      })

    } catch (error) {
      console.error('Subscription check error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error during subscription checks'
      })
    }
  })
}
