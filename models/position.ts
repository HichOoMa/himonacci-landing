import { Platforms } from "@/enums/platforms";
import { PositionStatus } from "@/enums/positionStatus";
import { model, Schema } from "mongoose";
import mongoose from "mongoose";

const positionSchema = new Schema({
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
  stopLoss: { type: Number },
  takeProfit: { type: Number },
  binanceOrderId: { type: String },
  buyedAt: { type: Date },
  closedAt: { type: Date },
}, { timestamps: true})

export default mongoose.models.position || model("position", positionSchema);