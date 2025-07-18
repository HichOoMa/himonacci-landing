import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  password: string
  isVerified: boolean
  emailVerificationToken?: string
  emailVerificationExpires?: Date
  subscriptionStatus: 'inactive' | 'active' | 'expired' | 'trial'
  subscriptionStartDate?: Date
  subscriptionEndDate?: Date
  paymentTransactionHash?: string
  hasUsedFreeTrial: boolean
  freeTrialStartDate?: Date
  freeTrialEndDate?: Date
  tradingFavorites?: Array<{
    signalId: string
    type: 'candle' | 'zone'
    addedAt: Date
  }>
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    subscriptionStatus: {
      type: String,
      enum: ['inactive', 'active', 'expired', 'trial'],
      default: 'inactive',
    },
    subscriptionStartDate: {
      type: Date,
    },
    subscriptionEndDate: {
      type: Date,
    },
    paymentTransactionHash: {
      type: String,
    },
    hasUsedFreeTrial: {
      type: Boolean,
      default: false,
    },
    freeTrialStartDate: {
      type: Date,
    },
    freeTrialEndDate: {
      type: Date,
    },
    tradingFavorites: [{
      signalId: { type: String, required: true },
      type: { type: String, enum: ['candle', 'zone'], required: true },
      addedAt: { type: Date, default: Date.now },
    }],
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject()
  delete userObject.password
  return userObject
}

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

export default User
