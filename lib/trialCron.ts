import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Subscription from '@/models/Subscription'
import { sendTrialExpirationEmail } from '@/lib/emailService'

export async function checkTrialExpirations() {
  try {
    await connectDB()
    
    const now = new Date()
    
    // Find users with expired trials
    const expiredTrialUsers = await User.find({
      subscriptionStatus: 'trial',
      freeTrialEndDate: { $lt: now }
    })
    
    for (const user of expiredTrialUsers) {
      try {
        // Update user subscription status
        user.subscriptionStatus = 'inactive'
        await user.save()
        
        // Update subscription record
        await Subscription.findOneAndUpdate(
          { userId: user._id, isFreeTrial: true },
          { status: 'expired' }
        )
        
        // Send trial expiration email
        await sendTrialExpirationEmail(user.email, user.firstName)
        
        console.log(`Trial expired for user: ${user.email}`)
      } catch (error) {
        console.error(`Error processing trial expiration for user ${user.email}:`, error)
      }
    }
    
    console.log(`Processed ${expiredTrialUsers.length} expired trials`)
  } catch (error) {
    console.error('Error checking trial expirations:', error)
  }
}

// Run every minute to check for expired trials
export function startTrialExpirationCron() {
  setInterval(checkTrialExpirations, 60 * 1000) // Check every minute
  console.log('Trial expiration cron started')
}

// Export for manual execution
export default checkTrialExpirations
