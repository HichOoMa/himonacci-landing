import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Subscription from '@/models/Subscription'
import { ISubscription } from '@/models/Subscription'

export class SubscriptionManager {
  
  // Create a new subscription for a user
  static async createSubscription(userId: string, paymentData: any): Promise<ISubscription> {
    await connectDB()
    
    // Check if user already has a subscription
    const existingSubscription = await Subscription.findOne({ userId })
    
    if (existingSubscription) {
      // If subscription exists, add payment and extend it
      existingSubscription.addPayment(paymentData)
      await existingSubscription.save()
      
      // Update user subscription status
      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: 'active',
        subscriptionStartDate: existingSubscription.startDate,
        subscriptionEndDate: existingSubscription.endDate,
        paymentTransactionHash: paymentData.transactionHash
      })
      
      return existingSubscription
    } else {
      // Create new subscription
      const startDate = new Date()
      const endDate = new Date(startDate.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days
      const nextPaymentDue = new Date(endDate.getTime() + (24 * 60 * 60 * 1000)) // 1 day after expiry
      
      const subscription = new Subscription({
        userId,
        status: 'active',
        startDate,
        endDate,
        nextPaymentDue,
        paymentHistory: [paymentData]
      })
      
      await subscription.save()
      
      // Update user subscription status
      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: 'active',
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        paymentTransactionHash: paymentData.transactionHash
      })
      
      return subscription
    }
  }
  
  // Get user's subscription details
  static async getUserSubscription(userId: string): Promise<ISubscription | null> {
    await connectDB()
    return await Subscription.findOne({ userId }).populate('userId')
  }
  
  // Check and update subscription status
  static async checkSubscriptionStatus(userId: string): Promise<{
    status: string
    isActive: boolean
    daysRemaining: number
    nextPaymentDue: Date | null
    gracePeriodRemaining: number
  }> {
    await connectDB()
    
    const subscription = await Subscription.findOne({ userId })
    
    if (!subscription) {
      return {
        status: 'inactive',
        isActive: false,
        daysRemaining: 0,
        nextPaymentDue: null,
        gracePeriodRemaining: 0
      }
    }
    
    const now = new Date()
    const daysRemaining = Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isActive = subscription.isActive()
    const isInGracePeriod = subscription.isInGracePeriod()
    
    let gracePeriodRemaining = 0
    if (isInGracePeriod && subscription.gracePeriodEnd) {
      gracePeriodRemaining = Math.ceil((subscription.gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }
    
    // Update subscription status based on current state
    if (isActive) {
      subscription.status = 'active'
    } else if (isInGracePeriod) {
      subscription.status = 'expired'
    } else if (daysRemaining <= 0 && !isInGracePeriod) {
      subscription.status = 'expired'
      if (!subscription.gracePeriodEnd) {
        subscription.startGracePeriod(7) // 7 days grace period
      }
    }
    
    await subscription.save()
    
    // Update user status
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: isActive ? 'active' : 'expired'
    })
    
    return {
      status: subscription.status,
      isActive,
      daysRemaining: Math.max(0, daysRemaining),
      nextPaymentDue: subscription.nextPaymentDue,
      gracePeriodRemaining: Math.max(0, gracePeriodRemaining)
    }
  }
  
  // Process monthly subscription checks
  static async processMonthlyChecks(): Promise<{
    processed: number
    expired: number
    graceStarted: number
    cancelled: number
  }> {
    await connectDB()
    
    const now = new Date()
    let processed = 0
    let expired = 0
    let graceStarted = 0
    let cancelled = 0
    
    // Get all active subscriptions
    const subscriptions = await Subscription.find({
      status: { $in: ['active', 'expired'] }
    })
    
    for (const subscription of subscriptions) {
      processed++
      
      const daysRemaining = Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysRemaining <= 0) {
        if (subscription.status === 'active') {
          // Start grace period
          subscription.startGracePeriod(7)
          graceStarted++
          
          // Update user status
          await User.findByIdAndUpdate(subscription.userId, {
            subscriptionStatus: 'expired'
          })
        } else if (subscription.status === 'expired' && !subscription.isInGracePeriod()) {
          // Grace period ended, cancel subscription
          subscription.cancel()
          cancelled++
          
          // Update user status
          await User.findByIdAndUpdate(subscription.userId, {
            subscriptionStatus: 'inactive'
          })
        }
        
        expired++
      }
      
      await subscription.save()
    }
    
    return {
      processed,
      expired,
      graceStarted,
      cancelled
    }
  }
  
  // Get subscription statistics
  static async getSubscriptionStats(): Promise<{
    total: number
    active: number
    expired: number
    cancelled: number
    gracePeriod: number
    revenue: number
  }> {
    await connectDB()
    
    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$monthlyPrice' }
        }
      }
    ])
    
    const total = await Subscription.countDocuments()
    const active = stats.find(s => s._id === 'active')?.count || 0
    const expired = stats.find(s => s._id === 'expired')?.count || 0
    const cancelled = stats.find(s => s._id === 'cancelled')?.count || 0
    const gracePeriod = await Subscription.countDocuments({ 
      status: 'expired',
      gracePeriodEnd: { $gte: new Date() }
    })
    
    // Calculate total revenue from all confirmed payments
    const revenueResult = await Subscription.aggregate([
      { $unwind: '$paymentHistory' },
      { $match: { 'paymentHistory.status': 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$paymentHistory.amount' } } }
    ])
    
    const revenue = revenueResult[0]?.total || 0
    
    return {
      total,
      active,
      expired,
      cancelled,
      gracePeriod,
      revenue
    }
  }
  
  // Cancel subscription
  static async cancelSubscription(userId: string): Promise<boolean> {
    await connectDB()
    
    const subscription = await Subscription.findOne({ userId })
    if (!subscription) {
      return false
    }
    
    subscription.cancel()
    await subscription.save()
    
    // Update user status
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: 'cancelled'
    })
    
    return true
  }
  
  // Reactivate subscription with new payment
  static async reactivateSubscription(userId: string, paymentData: any): Promise<ISubscription | null> {
    await connectDB()
    
    const subscription = await Subscription.findOne({ userId })
    if (!subscription) {
      return null
    }
    
    // Add payment and extend subscription
    subscription.addPayment(paymentData)
    subscription.status = 'active'
    subscription.cancellationDate = undefined
    subscription.autoRenewal = true
    
    await subscription.save()
    
    // Update user status
    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: 'active',
      subscriptionStartDate: subscription.startDate,
      subscriptionEndDate: subscription.endDate,
      paymentTransactionHash: paymentData.transactionHash
    })
    
    return subscription
  }
}

export default SubscriptionManager
