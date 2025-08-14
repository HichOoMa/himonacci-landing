import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  normalizedEmail: string // Lowercase and trimmed email for uniqueness
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
  binanceApiKey?: string
  binanceApiSecret?: string
  isAutoTradingEnabled: boolean
  isAutoTradingAllowed: boolean // Admin can control this
  bnbBurnEnabled: boolean // Whether to use BNB for trading fee discount
  tradingSettingsId?: string // Reference to TradingSettings
  blacklistedSymbols?: string[] // User's personal blacklisted symbols
  role: 'user' | 'admin'
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
    normalizedEmail: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
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
    binanceApiKey: {
      type: String,
      select: false, // Don't include in default queries for security
    },
    binanceApiSecret: {
      type: String,
      select: false, // Don't include in default queries for security
    },
    isAutoTradingEnabled: {
      type: Boolean,
      default: false,
    },
    isAutoTradingAllowed: {
      type: Boolean,
      default: true, // Allow by default, admin can disable
    },
    bnbBurnEnabled: {
      type: Boolean,
      default: true, // Enable BNB burn for trading fees by default
    },
    tradingSettingsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TradingSettings',
    },
    blacklistedSymbols: {
      type: [String],
      default: [],
      validate: {
        validator: function(symbols: string[]) {
          // Validate that all symbols are valid format (e.g., BTCUSDT, ETHUSDT)
          return symbols.every(symbol => /^[A-Z]{2,10}USDT$/.test(symbol.toUpperCase()))
        },
        message: 'All symbols must be valid trading pairs ending with USDT'
      }
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
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
