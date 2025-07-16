import mongoose from 'mongoose'

export interface ISubscription {
  _id: string
  userId: mongoose.Types.ObjectId
  plan: 'premium' | 'basic'
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  startDate: Date
  endDate: Date
  monthlyPrice: number
  paymentHistory: {
    transactionHash: string
    amount: number
    network: string
    paymentDate: Date
    status: 'confirmed' | 'pending' | 'failed'
    verificationMethod: string
  }[]
  autoRenewal: boolean
  cancellationDate?: Date
  nextPaymentDue: Date
  gracePeriodEnd?: Date
  createdAt: Date
  updatedAt: Date
}

const subscriptionSchema = new mongoose.Schema<ISubscription>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // One subscription per user
    },
    plan: {
      type: String,
      enum: ['premium', 'basic'],
      default: 'premium'
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending'],
      default: 'pending'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    monthlyPrice: {
      type: Number,
      required: true,
      default: 100
    },
    paymentHistory: [{
      transactionHash: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      network: {
        type: String,
        required: true,
        enum: ['TRC20', 'ERC20', 'BEP20']
      },
      paymentDate: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['confirmed', 'pending', 'failed'],
        default: 'confirmed'
      },
      verificationMethod: {
        type: String,
        enum: ['transaction_id', 'address_scan'],
        default: 'transaction_id'
      }
    }],
    autoRenewal: {
      type: Boolean,
      default: true
    },
    cancellationDate: {
      type: Date
    },
    nextPaymentDue: {
      type: Date,
      required: true
    },
    gracePeriodEnd: {
      type: Date
    }
  },
  {
    timestamps: true,
  }
)

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function(): boolean {
  const now = new Date()
  return this.status === 'active' && this.endDate > now
}

// Method to check if subscription is in grace period
subscriptionSchema.methods.isInGracePeriod = function(): boolean {
  const now = new Date()
  return this.gracePeriodEnd ? now <= this.gracePeriodEnd : false
}

// Method to extend subscription
subscriptionSchema.methods.extend = function(days: number = 30): void {
  const currentEndDate = new Date(this.endDate)
  this.endDate = new Date(currentEndDate.getTime() + (days * 24 * 60 * 60 * 1000))
  this.nextPaymentDue = new Date(this.endDate.getTime() + (24 * 60 * 60 * 1000)) // Next payment due 1 day after expiry
  this.status = 'active'
  this.gracePeriodEnd = undefined
}

// Method to add payment to history
subscriptionSchema.methods.addPayment = function(paymentData: any): void {
  this.paymentHistory.push(paymentData)
  this.extend() // Extend subscription by 30 days
}

// Method to cancel subscription
subscriptionSchema.methods.cancel = function(): void {
  this.status = 'cancelled'
  this.cancellationDate = new Date()
  this.autoRenewal = false
}

// Method to start grace period
subscriptionSchema.methods.startGracePeriod = function(days: number = 7): void {
  this.status = 'expired'
  this.gracePeriodEnd = new Date(Date.now() + (days * 24 * 60 * 60 * 1000))
}

const Subscription = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', subscriptionSchema)

export default Subscription
