// This file should only be imported on the server side
import SubscriptionCronService from '@/lib/subscriptionCron'
import { startTrialExpirationCron } from '@/lib/trialCron'

let cronJobsInitialized = false

// Server-only initialization function
export async function initializeServerCronJobs() {
  // Prevent multiple initializations
  if (cronJobsInitialized) {
    console.log('Server cron jobs already initialized')
    return
  }

  // Only run in Node.js server environment
  if (typeof window !== 'undefined') {
    console.log('Skipping cron initialization in browser environment')
    return
  }

  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
    console.log('Initializing server-side cron jobs...')
    
    try {
      const cronService = SubscriptionCronService.getInstance()
      cronService.startMonthlyChecks()
      
      // Start trial expiration cron job
      startTrialExpirationCron()
      
      cronJobsInitialized = true
      console.log('Server-side cron jobs initialized successfully')
    } catch (error) {
      console.error('Failed to initialize server-side cron jobs:', error)
    }
    
    // Graceful shutdown handlers
    if (!process.listenerCount('SIGTERM')) {
      process.on('SIGTERM', () => {
        console.log('Received SIGTERM, stopping server cron jobs...')
        const cronService = SubscriptionCronService.getInstance()
        cronService.stopAllJobs()
        process.exit(0)
      })
    }
    
    if (!process.listenerCount('SIGINT')) {
      process.on('SIGINT', () => {
        console.log('Received SIGINT, stopping server cron jobs...')
        const cronService = SubscriptionCronService.getInstance()
        cronService.stopAllJobs()
        process.exit(0)
      })
    }
  } else {
    console.log('Server cron jobs disabled in development mode')
  }
}

// Auto-initialize when module is loaded on server
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  // Add a delay to ensure the application is fully loaded
  setTimeout(() => {
    initializeServerCronJobs()
  }, 5000)
}
