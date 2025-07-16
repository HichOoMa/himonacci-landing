import SubscriptionCronService from '@/lib/subscriptionCron'

let cronJobsInitialized = false

// Initialize subscription cron service on server startup
export function initializeSubscriptionCronJobs() {
  // Prevent multiple initializations
  if (cronJobsInitialized) {
    console.log('Cron jobs already initialized')
    return
  }

  // Only initialize in server environment
  if (typeof window !== 'undefined') {
    return
  }

  // Only run in Node.js environment
  if (typeof process === 'undefined' || !process.env) {
    return
  }

  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
    console.log('Initializing subscription cron jobs...')
    
    try {
      const cronService = SubscriptionCronService.getInstance()
      cronService.startMonthlyChecks()
      cronJobsInitialized = true
      console.log('Subscription cron jobs initialized successfully')
    } catch (error) {
      console.error('Failed to initialize subscription cron jobs:', error)
    }
    
    // Graceful shutdown - only add listeners once
    if (!process.listenerCount('SIGTERM')) {
      process.on('SIGTERM', () => {
        console.log('Received SIGTERM, stopping cron jobs...')
        const cronService = SubscriptionCronService.getInstance()
        cronService.stopAllJobs()
        process.exit(0)
      })
    }
    
    if (!process.listenerCount('SIGINT')) {
      process.on('SIGINT', () => {
        console.log('Received SIGINT, stopping cron jobs...')
        const cronService = SubscriptionCronService.getInstance()
        cronService.stopAllJobs()
        process.exit(0)
      })
    }
  } else {
    console.log('Cron jobs disabled in development mode')
  }
}

export default initializeSubscriptionCronJobs
