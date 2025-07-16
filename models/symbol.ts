import { model, Schema } from "mongoose";
import { Platforms } from "../enums/platforms";

const SymbolSchema = new Schema({
  name: { type: String, required: true, unique: true },
  platforms: [{
    name: { type: String, enum: Platforms, required: true },
    quantityPrecision: { type: Number, required: true },
    pricePrecision: { type: Number, required: true },
    priceUnit: { type: Number, required: true },
    stepSize: { type: Number },
    volume: { type: Number, required: true },
    volatility: { type: Number, required: true },
  }],
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

export default model("symbol", SymbolSchema);
