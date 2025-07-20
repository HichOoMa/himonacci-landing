import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth'
import SubscriptionCronService from '@/lib/subscriptionCron'
import { initializeServerCronJobs } from '@/lib/serverCron'
import User from '@/models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // return authenticateToken(req as AuthenticatedRequest, res, async () => {
  //   try {
  //     const userId = (req as AuthenticatedRequest).user.id
  //     const user = await User.findById(userId)
      
  //     // Check if user is admin
  //     if (!user || user.email !== process.env.ADMIN_EMAIL) {
  //       return res.status(403).json({ message: 'Admin access required' })
  //     }

  //     const cronService = SubscriptionCronService.getInstance()

  //     switch (req.method) {
  //       case 'GET':
  //         // Get cron job status
  //         const status = cronService.getJobStatus()
  //         return res.status(200).json({
  //           success: true,
  //           jobs: status
  //         })

  //       case 'POST':
  //         const { action } = req.body
          
  //         switch (action) {
  //           case 'start':
  //             await initializeServerCronJobs()
  //             return res.status(200).json({
  //               success: true,
  //               message: 'Cron jobs started'
  //             })
            
  //           case 'stop':
  //             cronService.stopAllJobs()
  //             return res.status(200).json({
  //               success: true,
  //               message: 'Cron jobs stopped'
  //             })
            
  //           case 'trigger':
  //             const results = await cronService.triggerManualCheck()
  //             return res.status(200).json({
  //               success: true,
  //               message: 'Manual check completed',
  //               results
  //             })
            
  //           default:
  //             return res.status(400).json({
  //               success: false,
  //               message: 'Invalid action. Use: start, stop, or trigger'
  //             })
  //         }

  //       default:
  //         return res.status(405).json({ message: 'Method not allowed' })
  //     }

  //   } catch (error) {
  //     console.error('Cron management error:', error)
  //     return res.status(500).json({
  //       success: false,
  //       message: 'Internal server error'
  //     })
  //   }
  // })
  return;
}
