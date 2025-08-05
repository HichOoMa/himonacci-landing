import mongoose from 'mongoose';

export interface IAccountHistory {
  _id: string;
  userId: string;
  timestamp: Date;
  event: 'auto_trading_enabled' | 'auto_trading_disabled';
  accountBalance: {
    totalUSDTValue: number;
    balances: Array<{
      asset: string;
      free: string;
      locked: string;
      total: string;
      usdtValue: number;
    }>;
  };
  accountInfo: {
    accountType: string;
    canTrade: boolean;
    canWithdraw: boolean;
    canDeposit: boolean;
    updateTime: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const accountHistorySchema = new mongoose.Schema<IAccountHistory>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    event: {
      type: String,
      required: true,
      enum: ['auto_trading_enabled', 'auto_trading_disabled'],
    },
    accountBalance: {
      totalUSDTValue: {
        type: Number,
        required: true,
      },
      balances: [{
        asset: {
          type: String,
          required: true,
        },
        free: {
          type: String,
          required: true,
        },
        locked: {
          type: String,
          required: true,
        },
        total: {
          type: String,
          required: true,
        },
        usdtValue: {
          type: Number,
          required: true,
        },
      }],
    },
    accountInfo: {
      accountType: String,
      canTrade: Boolean,
      canWithdraw: Boolean,
      canDeposit: Boolean,
      updateTime: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
accountHistorySchema.index({ userId: 1, timestamp: -1 });
accountHistorySchema.index({ userId: 1, event: 1 });

export default mongoose.models.AccountHistory || mongoose.model<IAccountHistory>('AccountHistory', accountHistorySchema);
