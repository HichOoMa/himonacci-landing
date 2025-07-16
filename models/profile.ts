import { model, Schema } from "mongoose";

const profileSchema = new Schema({
  name: { type: String, required: true },
  isTrading: { type: Boolean, required: true },
  tradingPeriod: { type: Number, required: true },
  tradingMainPositions: { type: Number, required: true },
  tradingReservedPeriod: { type: Number, required: true },
})

export default model("profile", profileSchema);