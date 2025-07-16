import { Platforms } from "@/enums/platforms";
import { PositionStatus } from "@/enums/positionStatus";
import { model, Schema } from "mongoose";

const positionSchema = new Schema({
  symbol: { type: String, required: true },
  platform: { type: String, enum: Platforms, required: true },
  status: { type: String, enum: PositionStatus, required: true },
  margin: { type: Number, required: true },
  entryPrice: { type: Number, required: true },
  magicCandle: { type: Schema.Types.ObjectId, ref: "Candle", required: true },
  limitPrice: { type: Number, required: true },
}, { timestamps: true})

import mongoose from "mongoose";

export default mongoose.models.position || model("position", positionSchema);