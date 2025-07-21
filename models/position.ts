import { Platforms } from "@/enums/platforms";
import { PositionStatus } from "@/enums/positionStatus";
import { model, Schema } from "mongoose";
import mongoose from "mongoose";

export interface IPosition {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  platform: Platforms;
  status: PositionStatus;
  margin: number;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  magicCandle: mongoose.Types.ObjectId; // Reference to Candle model
  limitPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  binanceOrderId?: string; // Optional for Binance orders
  buyedAt?: Date; // Optional, when the position was opened
  closedAt?: Date; // Optional, when the position was closed
}

const positionSchema = new Schema<IPosition>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  symbol: { type: String, required: true },
  platform: { type: String, enum: Platforms, required: true },
  status: { type: String, enum: PositionStatus, required: true },
  margin: { type: Number, required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number },
  quantity: { type: Number, required: true },
  magicCandle: { type: Schema.Types.ObjectId, ref: "Candle", required: true },
  limitPrice: { type: Number, required: true },
  buyedAt: { type: Date },
  closedAt: { type: Date },
}, { timestamps: true})

export default mongoose.models.position || model("position", positionSchema);