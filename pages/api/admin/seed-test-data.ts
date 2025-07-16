import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import Candle from "@/models/candle";
import Zone from "@/models/zone";
import { ValidationDirection, ZoneStatus } from "@/enums/validationDirections";
import { Platforms } from "@/enums/platforms";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  try {
    // Clear existing test data
    await Candle.deleteMany({ symbol: { $in: ["BTCUSDT", "ETHUSDT", "ADAUSDT"] } });
    await Zone.deleteMany({});

    // Create sample candles with GET_LONG_ENTRY status
    const sampleCandles = [
      {
        symbol: "BTCUSDT",
        timeframe: 15,
        platform: Platforms.BINANCE,
        isMagic: true,
        ohlc: {
          open: 42000,
          high: 42500,
          low: 41800,
          close: 42200,
        },
        timestamp: Date.now() - 60000, // 1 minute ago
        status: ValidationDirection.GET_LONG_ENTRY,
        entry: 3,
        expectedProfit: 3.5,
        limits: {
          longEntry: 42000,
          longClose: 43500,
        },
      },
      {
        symbol: "ETHUSDT",
        timeframe: 15,
        platform: Platforms.BINANCE,
        isMagic: true,
        ohlc: {
          open: 2500,
          high: 2520,
          low: 2480,
          close: 2510,
        },
        timestamp: Date.now() - 120000, // 2 minutes ago
        status: ValidationDirection.GET_LONG_ENTRY,
        entry: 1,
        expectedProfit: 2.8,
        limits: {
          longEntry: 2500,
          longClose: 2570,
        },
      },
      {
        symbol: "ADAUSDT",
        timeframe: 15,
        platform: Platforms.BINANCE,
        isMagic: true,
        ohlc: {
          open: 0.45,
          high: 0.46,
          low: 0.44,
          close: 0.452,
        },
        timestamp: Date.now() - 300000, // 5 minutes ago
        status: ValidationDirection.GET_LONG_ENTRY,
        entry: 2,
        expectedProfit: 4.2,
        limits: {
          longEntry: 0.45,
          longClose: 0.47,
        },
      },
    ];

    const createdCandles = await Candle.insertMany(sampleCandles);

    // Create sample zones with ENTRY status
    const sampleZones = [
      {
        candle: createdCandles[0]._id,
        status: ZoneStatus.ENTRY,
        direction: "LONG",
        entry: 1,
        expectedProfit: 5.5,
        entryPrice: 42100,
        closePrice: 44300,
        entryTimestamp: Date.now() - 180000, // 3 minutes ago
      },
      {
        candle: createdCandles[1]._id,
        status: ZoneStatus.ENTRY,
        direction: "LONG",
        entry: 2,
        expectedProfit: 6.2,
        entryPrice: 2505,
        closePrice: 2660,
        entryTimestamp: Date.now() - 240000, // 4 minutes ago
      },
    ];

    await Zone.insertMany(sampleZones);

    res.status(200).json({ 
      message: "Test data created successfully",
      candles: createdCandles.length,
      zones: sampleZones.length,
    });

  } catch (error) {
    console.error("Error creating test data:", error);
    res.status(500).json({ message: "Failed to create test data" });
  }
}
