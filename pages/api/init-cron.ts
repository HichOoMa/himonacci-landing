import type { NextApiRequest, NextApiResponse } from 'next'
import { initializeServerCronJobs } from '@/lib/serverCron'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Initialize cron jobs on server
    await initializeServerCronJobs()
    
    res.status(200).json({
      success: true,
      message: 'Cron jobs initialized successfully'
    })
  } catch (error) {
    console.error('Error initializing cron jobs:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to initialize cron jobs'
    })
  }
}
