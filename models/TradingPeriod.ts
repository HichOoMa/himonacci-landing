import mongoose from 'mongoose'
import { IPosition } from './position'

export interface ITradingPeriod {
  _id?: string
  userId: mongoose.Types.ObjectId
  startTime: Date
  endTime: Date
  positionIds: mongoose.Types.ObjectId[]
  positions?: IPosition[] // Populated positions for queries
  primaryCount: number
  secondaryCount: number
  createdAt?: Date
  updatedAt?: Date
}

const tradingPeriodSchema = new mongoose.Schema<ITradingPeriod>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator: function (this: ITradingPeriod, value: Date) {
          return value > this.startTime
        },
        message: 'End time must be after start time',
      },
    },
    positionIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position',
    }],
    primaryCount: {
      type: Number,
      required: [true, 'Primary count is required'],
      min: [0, 'Primary count cannot be negative'],
      default: 0,
    },
    secondaryCount: {
      type: Number,
      required: [true, 'Secondary count is required'],
      min: [0, 'Secondary count cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "trading_periods"
  }
)

// Virtual for populating positions
tradingPeriodSchema.virtual('positions', {
  ref: 'Position',
  localField: 'positionIds',
  foreignField: '_id',
})

// Index for efficient queries
tradingPeriodSchema.index({ userId: 1, startTime: -1 })
tradingPeriodSchema.index({ userId: 1, endTime: -1 })
tradingPeriodSchema.index({ startTime: 1, endTime: 1 })

// Instance methods
tradingPeriodSchema.methods.isActive = function (): boolean {
  const now = new Date()
  return this.startTime <= now && this.endTime >= now
}

tradingPeriodSchema.methods.getDuration = function (): number {
  return this.endTime.getTime() - this.startTime.getTime()
}

tradingPeriodSchema.methods.getTotalPositions = function (): number {
  return this.primaryCount + this.secondaryCount
}

// Static methods
tradingPeriodSchema.statics.findActiveForUser = function (userId: string | mongoose.Types.ObjectId) {
  const now = new Date()
  return this.findOne({
    userId,
    startTime: { $lte: now },
    endTime: { $gte: now },
  }).sort({ startTime: -1 })
}

const TradingPeriod = mongoose.models.TradingPeriod || mongoose.model<ITradingPeriod>('TradingPeriod', tradingPeriodSchema)

export default TradingPeriod
