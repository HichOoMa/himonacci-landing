import { EntryType } from "@/enums/entryType";
import { model, Schema } from "mongoose";
import mongoose from "mongoose";

export interface ITrackPosition {
  positionId: mongoose.Types.ObjectId;
  type: EntryType; // "candle" or "zone"
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  entryUSDTValue: number;
  quantity: number;
  isClosed: boolean;
}

export interface ITrackingPeriods {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  balance: number;
  startBalance: number;
  startTime: Date;
  endTime?: Date;
  isTrading: boolean;
  positions?: ITrackPosition[];
  openSymbols?: string[];
  primaryCount: number;
  secondaryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const trackPositionSchema = new Schema<ITrackPosition>({
  positionId: { type: Schema.Types.ObjectId, ref: "position", required: true },
  type: { type: String, enum: Object.values(EntryType), required: true },
  symbol: { type: String, required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number, required: true },
  entryUSDTValue: { type: Number, required: true },
  quantity: { type: Number, required: true },
  isClosed: { type: Boolean, required: true, default: false }
}, { _id: false });

const trackingPeriodsSchema = new Schema<ITrackingPeriods>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, required: true },
  startBalance: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  isTrading: { type: Boolean, required: true, default: false },
  positions: { type: [trackPositionSchema], default: [] },
  openSymbols: { type: [String], default: [] },
  primaryCount: { type: Number, required: true, default: 0 },
  secondaryCount: { type: Number, required: true, default: 0 }
}, { timestamps: true });

// Create indexes for better query performance
trackingPeriodsSchema.index({ userId: 1 });
trackingPeriodsSchema.index({ userId: 1, isTrading: 1 });
trackingPeriodsSchema.index({ startTime: 1 });
trackingPeriodsSchema.index({ endTime: 1 });

export default mongoose.models.TrackingPeriods || model("TrackingPeriods", trackingPeriodsSchema, "tracking_periods");
