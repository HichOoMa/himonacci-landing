import mongoose from 'mongoose'

interface AlgorithmEntry {
  enabled: boolean
  priority: number
}

interface AlgorithmPriority {
  candles: {
    entry1: AlgorithmEntry
    entry2: AlgorithmEntry
    entry3: AlgorithmEntry
  }
  zones: {
    entry1: AlgorithmEntry
    entry2: AlgorithmEntry
    entry3: AlgorithmEntry
  }
}

export interface ITradingSettings {
  _id: string
  name: string
  isDefault: boolean
  periodDuration: number // Duration in minutes
  positionsPerPeriod: number
  reservedPeriodsBalance: number
  balancePartitions: number // Number of balance partitions
  closeAllCheckPeriod: number // Duration in minutes
  closeAllProfitThreshold: number
  minExpectedProfit: number // Minimum expected profit percentage
  minVolume: number // Minimum trading volume required
  trackingDrawDown: number // Tracking draw down percentage
  blacklistedSymbols: string[] // List of symbols to exclude from trading
  algorithmPriority?: AlgorithmPriority // Algorithm priority configuration
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
    balancePartitions: {
      type: Number,
      required: [true, 'Balance partitions is required'],
      min: [1, 'Balance partitions must be at least 1'],
      max: [100, 'Balance partitions must not exceed 100'],
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
    trackingDrawDown: {
      type: Number,
      required: [true, 'Tracking draw down is required'],
      min: [0, 'Tracking draw down must be non-negative'],
      max: [100, 'Tracking draw down must not exceed 100%'],
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
    algorithmPriority: {
      type: {
        candles: {
          entry1: {
            enabled: { type: Boolean, default: true },
            priority: { type: Number, default: 1 }
          },
          entry2: {
            enabled: { type: Boolean, default: true },
            priority: { type: Number, default: 2 }
          },
          entry3: {
            enabled: { type: Boolean, default: true },
            priority: { type: Number, default: 3 }
          }
        },
        zones: {
          entry1: {
            enabled: { type: Boolean, default: true },
            priority: { type: Number, default: 4 }
          },
          entry2: {
            enabled: { type: Boolean, default: true },
            priority: { type: Number, default: 5 }
          },
          entry3: {
            enabled: { type: Boolean, default: true },
            priority: { type: Number, default: 6 }
          }
        }
      },
      default: {
        candles: {
          entry1: { enabled: true, priority: 1 },
          entry2: { enabled: true, priority: 2 },
          entry3: { enabled: true, priority: 3 }
        },
        zones: {
          entry1: { enabled: true, priority: 4 },
          entry2: { enabled: true, priority: 5 },
          entry3: { enabled: true, priority: 6 }
        }
      }
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
