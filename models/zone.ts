import { ZoneStatus } from "@/enums/validationDirections";
import { model, Schema } from "mongoose";

const ZoneSchema = new Schema({
  candle: { type: Schema.Types.ObjectId, ref: "candle" },
  status: { type: String, enum: ZoneStatus, default: "NONE" },
  direction: { type: String, enum: ["LONG", "SHORT"] },
  entry: { type: Number, min: 1, max: 3, required: true },
  expectedProfit: { type: Number },
  entryPrice: { type: Number },
  closePrice: { type: Number },
  entryTimestamp: { type: Number },
  closeTimestamp: { type: Number },
}, { timestamps: true });

ZoneSchema.index({ candle: 1, entry: 1 }, { unique: true });
ZoneSchema.index({ status: 1 });
ZoneSchema.index({ expectedProfit: -1 });
ZoneSchema.index({ entryTimestamp: -1 });
ZoneSchema.index({ closeTimestamp: -1 });

import mongoose from "mongoose";

export default mongoose.models.zone || model("zone", ZoneSchema);
