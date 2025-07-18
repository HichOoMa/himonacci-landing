import type { NextApiRequest, NextApiResponse } from 'next'
import { checkTrialExpirations } from '@/lib/trialCron'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    await checkTrialExpirations()
    res.status(200).json({ message: 'Trial expiration check completed' })
  } catch (error) {
    console.error('Error running trial expiration check:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
