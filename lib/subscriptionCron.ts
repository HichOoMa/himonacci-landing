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
        const results = await this.processSubscriptionChecks()
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
        const results = await this.processSubscriptionChecks()
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
      const results = await this.processSubscriptionChecks()
      console.log('Manual subscription check completed:', results)
      return results
    } catch (error) {
      console.error('Error during manual subscription check:', error)
      throw error
    }
  }

  // Enhanced subscription check with date validation
  private async processSubscriptionChecks(): Promise<{
    processed: number
    expired: number
    graceStarted: number
    cancelled: number
    skipped: number
  }> {
    const Subscription = (await import('@/models/Subscription')).default
    const User = (await import('@/models/User')).default
    
    const now = new Date()
    let processed = 0
    let expired = 0
    let graceStarted = 0
    let cancelled = 0
    let skipped = 0

    // Get all active subscriptions
    const subscriptions = await Subscription.find({
      status: { $in: ['active', 'expired'] }
    })

    for (const subscription of subscriptions) {
      processed++
      
      // Get the corresponding user to check their subscriptionEndDate
      const user = await User.findById(subscription.userId)
      if (!user) {
        console.log(`User not found for subscription ${subscription._id}`)
        skipped++
        continue
      }

      // Check if the current date has actually passed the subscription end date
      // Use both subscription.endDate and user.subscriptionEndDate for validation
      const subscriptionHasExpired = now > subscription.endDate
      const userSubscriptionHasExpired = user.subscriptionEndDate ? now > user.subscriptionEndDate : true
      const hasExpired = subscriptionHasExpired && userSubscriptionHasExpired
      
      const daysRemaining = Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const userDaysRemaining = user.subscriptionEndDate ? 
        Math.ceil((user.subscriptionEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 
        daysRemaining

      // Validate that both subscription and user end dates are consistent
      if (user.subscriptionEndDate && Math.abs(subscription.endDate.getTime() - user.subscriptionEndDate.getTime()) > 24 * 60 * 60 * 1000) {
        console.log(`Date mismatch detected for user ${user._id}: subscription endDate ${subscription.endDate}, user endDate ${user.subscriptionEndDate}`)
        // Use the later date to be safe
        const laterDate = subscription.endDate > user.subscriptionEndDate ? subscription.endDate : user.subscriptionEndDate
        subscription.endDate = laterDate
        await User.findByIdAndUpdate(user._id, { subscriptionEndDate: laterDate })
      }
      
      if (hasExpired && daysRemaining <= 0 && userDaysRemaining <= 0) {
        if (subscription.status === 'active') {
          // Start grace period only if subscription has truly expired
          subscription.startGracePeriod(7)
          graceStarted++
          
          // Update user status
          await User.findByIdAndUpdate(subscription.userId, {
            subscriptionStatus: 'expired'
          })
          
          console.log(`Started grace period for subscription ${subscription._id}, expired on ${subscription.endDate} (user end date: ${user.subscriptionEndDate})`)
        } else if (subscription.status === 'expired' && !subscription.isInGracePeriod()) {
          // Grace period ended, cancel subscription
          subscription.cancel()
          cancelled++
          
          // Update user status
          await User.findByIdAndUpdate(subscription.userId, {
            subscriptionStatus: 'inactive'
          })
          
          console.log(`Cancelled subscription ${subscription._id}, grace period ended`)
        }
        
        expired++
      } else if ((daysRemaining <= 0 && !subscriptionHasExpired) || (userDaysRemaining <= 0 && !userSubscriptionHasExpired)) {
        // Edge case: calculation shows negative days but end date hasn't passed
        console.log(`Skipping subscription ${subscription._id}: calculation error detected (subscription days: ${daysRemaining}, user days: ${userDaysRemaining}, subscription endDate: ${subscription.endDate}, user endDate: ${user.subscriptionEndDate}, now: ${now})`)
        skipped++
      }
      
      await subscription.save()
    }

    return {
      processed,
      expired,
      graceStarted,
      cancelled,
      skipped
    }
  }
}

export default SubscriptionCronService
