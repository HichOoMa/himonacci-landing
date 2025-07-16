import { Platforms } from "@/enums/platforms";
import { ValidationDirection } from "@/enums/validationDirections";
import { model, Schema } from "mongoose";

const CandleSchema = new Schema(
  {
    symbol: { type: String, required: true },
    timeframe: { type: Number, required: true },
    isMagic: { type: Boolean, default: false },
    platform: { type: String, enum: Platforms, required: true },
    ohlc: {
      open: { type: Number, required: true },
      close: { type: Number, required: true },
      high: { type: Number, required: true },
      low: { type: Number, required: true },
    },
    timestamp: { type: Number, required: true },
    expectedProfit: { type: Number },
    drowDown: { type: Number },
    status: {
      type: String,
      enum: ValidationDirection,
      default: ValidationDirection.NONE,
    },
    entry: { type: Number, min: 0, max: 100, required: true, default: 0 },
    limits: {
      shortEntry: { type: Number },
      longEntry: { type: Number },
      shortEntry1: { type: Number },
      longEntry1: { type: Number },
      shortEntry2: { type: Number },
      longEntry2: { type: Number },
      shortEntry3: { type: Number },
      longEntry3: { type: Number },
      shortClose: { type: Number },
      longClose: { type: Number },
      shortValidation: { type: Number },
      dynamicEntry: { type: Number },
      dynamicClose: { type: Number },
    },
    history: [
      {
        status: { type: String, enum: ValidationDirection, required: true },
        timestamp: { type: Number, required: true },
        price: { type: Number, price: Number },
      },
    ],
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CandleSchema.index({ entry: -1 })
CandleSchema.index({
  symbol: 1,
  status: 1,
  platform: 1,
  timeframe: 1,
  timestamp: -1,
}, { unique: true });
CandleSchema.index({ timestamp: -1 });

import mongoose from "mongoose";

export default mongoose.models.candle || model("candle", CandleSchema);
