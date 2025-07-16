import * as cron from 'node-cron'
import SubscriptionManager from '@/lib/subscriptionManager'
import connectDB from '@/lib/mongodb'

export class SubscriptionCronService {
  private static instance: SubscriptionCronService
  private jobs: Map<string, cron.ScheduledTask> = new Map()

  private constructor() {}

  static getInstance(): SubscriptionCronService {
    if (!SubscriptionCronService.instance) {
      SubscriptionCronService.instance = new SubscriptionCronService()
    }
    return SubscriptionCronService.instance
  }

  // Start the monthly subscription check job
  startMonthlyChecks() {
    // Run every day at 2 AM to check for expired subscriptions
    const dailyJob = cron.schedule('0 2 * * *', async () => {
      console.log('Running daily subscription checks...')
      try {
        await connectDB()
        const results = await SubscriptionManager.processMonthlyChecks()
        console.log('Daily subscription checks completed:', results)
      } catch (error) {
        console.error('Error during daily subscription checks:', error)
      }
    }, {
      timezone: 'UTC'
    })

    // Run every hour to check for recent expirations (more frequent checks)
    const hourlyJob = cron.schedule('0 * * * *', async () => {
      console.log('Running hourly subscription checks...')
      try {
        await connectDB()
        const results = await SubscriptionManager.processMonthlyChecks()
        console.log('Hourly subscription checks completed:', results)
      } catch (error) {
        console.error('Error during hourly subscription checks:', error)
      }
    }, {
      timezone: 'UTC'
    })

    // Start the jobs
    dailyJob.start()
    hourlyJob.start()

    // Store jobs for later management
    this.jobs.set('daily', dailyJob)
    this.jobs.set('hourly', hourlyJob)

    console.log('Subscription cron jobs started')
  }

  // Stop all cron jobs
  stopAllJobs() {
    this.jobs.forEach((job, name) => {
      job.stop()
      console.log(`Stopped ${name} subscription check job`)
    })
    this.jobs.clear()
  }

  // Get job status
  getJobStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {}
    this.jobs.forEach((job, name) => {
      status[name] = this.jobs.has(name)
    })
    return status
  }

  // Manual trigger for immediate check
  async triggerManualCheck(): Promise<any> {
    console.log('Running manual subscription check...')
    try {
      await connectDB()
      const results = await SubscriptionManager.processMonthlyChecks()
      console.log('Manual subscription check completed:', results)
      return results
    } catch (error) {
      console.error('Error during manual subscription check:', error)
      throw error
    }
  }
}

export default SubscriptionCronService
