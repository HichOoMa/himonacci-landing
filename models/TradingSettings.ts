import mongoose from 'mongoose'

export interface ITradingSettings {
  _id: string
  name: string
  isDefault: boolean
  periodDuration: number // Duration in minutes
  positionsPerPeriod: number
  reservedPeriodsBalance: number
  closeAllCheckPeriod: number // Duration in minutes
  closeAllProfitThreshold: number
  minExpectedProfit: number // Minimum expected profit percentage
  minVolume: number // Minimum trading volume required
  createdAt: Date
  updatedAt: Date
}

const tradingSettingsSchema = new mongoose.Schema<ITradingSettings>(
  {
    name: {
      type: String,
      required: [true, 'Trading settings name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    periodDuration: {
      type: Number,
      required: [true, 'Period duration is required'],
      min: [1, 'Period duration must be at least 1 minute'],
    },
    positionsPerPeriod: {
      type: Number,
      required: [true, 'Positions per period is required'],
      min: [1, 'Positions per period must be at least 1'],
    },
    reservedPeriodsBalance: {
      type: Number,
      required: [true, 'Reserved periods balance is required'],
      min: [0, 'Reserved periods balance must be non-negative'],
    },
    closeAllCheckPeriod: {
      type: Number,
      required: [true, 'Close all check period is required'],
      min: [1, 'Close all check period must be at least 1 minute'],
    },
    closeAllProfitThreshold: {
      type: Number,
      required: [true, 'Close all profit threshold is required'],
      min: [0, 'Close all profit threshold must be non-negative'],
    },
    minExpectedProfit: {
      type: Number,
      required: [true, 'Minimum expected profit is required'],
      min: [0, 'Minimum expected profit must be non-negative'],
    },
    minVolume: {
      type: Number,
      required: [true, 'Minimum volume is required'],
      min: [0, 'Minimum volume must be non-negative'],
    },
  },
  {
    timestamps: true,
  }
)

// Ensure only one default trading setting exists
tradingSettingsSchema.pre('save', async function (next) {
  if (this.isDefault) {
    // Remove default flag from all other settings
    await mongoose.model('TradingSettings').updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    )
  }
  next()
})

const TradingSettings = mongoose.models.TradingSettings || mongoose.model<ITradingSettings>('TradingSettings', tradingSettingsSchema)

export default TradingSettings
