import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Candle from "@/models/candle";
import Zone from "@/models/zone";
import { ValidationDirection, ZoneStatus } from "@/enums/validationDirections";
import Authenticate from "@/utils/Authentificate";

interface AuthenticatedRequest extends NextApiRequest {
  user?: any;
}

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const authError = await Authenticate(req, res);
  if (authError) return;

  // Check if user has active subscription
  if (req.user.subscriptionStatus !== "active") {
    return res.status(403).json({ message: "Active subscription required" });
  }

  try {
    const {
      sortBy = "type",
      sortOrder = "desc",
      filterBy,
      filterValue,
      page = 1,
      limit = 50,
      favoritesOnly = "false",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const isFavoritesOnly = favoritesOnly === "true";

    // 24 hours ago
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    let candlesQuery;
    let zonesQuery;

    if (isFavoritesOnly) {
      // Get user's favorites
      const favorites = req.user.tradingFavorites || [];
      const favoriteCandles = favorites.filter((fav: any) => fav.type === "candle").map((fav: any) => fav.signalId);
      const favoriteZones = favorites.filter((fav: any) => fav.type === "zone").map((fav: any) => fav.signalId);

      // Fetch favorite candles (no time restriction)
      candlesQuery = Candle.find({
        _id: { $in: favoriteCandles },
        isMagic: true,
        status: ValidationDirection.GET_LONG_ENTRY,
        entry: { $in: [2, 3] },
        // expectedProfit: { $gte: 1 },
        deleted: false,
      }).lean();

      // Fetch favorite zones (no time restriction)
      zonesQuery = Zone.find({
        _id: { $in: favoriteZones },
        status: ZoneStatus.ENTRY,
        // expectedProfit: { $gte: 1 },
      })
        .populate({
          path: "candle",
          select: "symbol",
          match: { deleted: { $ne: true } },
        })
        .lean();
    } else {
      // Regular query with 24-hour restriction
      candlesQuery = Candle.find({
        isMagic: true,
        status: ValidationDirection.GET_LONG_ENTRY,
        entry: { $in: [2, 3] },
        // expectedProfit: { $gte: 1 },
        updatedAt: { $gte: new Date(oneDayAgo) },
        deleted: false,
      }).lean();

      zonesQuery = Zone.find({
        status: ZoneStatus.ENTRY,
        // expectedProfit: { $gte: 1 },
        updatedAt: { $gte: new Date(oneDayAgo) },
      })
        .populate({
          path: "candle",
          select: "symbol",
          match: { deleted: { $ne: true } },
        })
        .lean();
    }

    const [candles, zones] = await Promise.all([candlesQuery, zonesQuery]);

    // Filter out zones with null candle (deleted candles)
    const validZones = zones.filter(zone => zone.candle);
    
    // Transform data to common format
    const candleSignals = candles.map(candle => ({
      id: candle._id,
      symbol: candle.symbol,
      closePrice: candle.limits?.dynamicClose,
      currentPrice: candle.ohlc?.close,
      expectedProfit: candle.expectedProfit || 0,
      algo: "candle" as const,
      entry: candle.entry,
      status: candle.status,
      updatedAt: candle.updatedAt,
      type: "candle" as const,
      priority: candle.entry === 3 ? 1 : 2,
    }));

    const zoneSignals = validZones.map(zone => ({
      id: zone._id,
      symbol: zone.candle.symbol,
      closePrice: zone.closePrice,
      currentPrice: zone.candle.ohlc?.close,
      expectedProfit: zone.expectedProfit || 0,
      algo: "zone" as const,
      entry: zone.entry,
      status: zone.status,
      updatedAt: zone.updatedAt,
      type: "zone" as const,
      priority: 3,
    }));

    // Combine and filter by expected profit > 1%
    const symbols = Array.from(new Set([...candleSignals, ...zoneSignals].map(s => s.symbol)));
    const fetchBinancePrices = async (symbols: string[]) => {
      const prices: Record<string, number> = {};
      try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price`);
      const data = await res.json();
      symbols.forEach(symbol => {
        // Binance uses e.g. BTCUSDT, ETHUSDT, etc.
        const priceObj = data.find((item: any) => item.symbol === symbol);
        if (priceObj) prices[symbol] = parseFloat(priceObj.price);
      });
      } catch (err) {
      console.error("Error fetching Binance prices", err);
      }
      return prices;
    };

    const binancePrices = await fetchBinancePrices(symbols);

    // Merge Binance price into signals
    let allSignals = [...candleSignals, ...zoneSignals].map(signal => ({
      ...signal,
      currentPrice: binancePrices[signal.symbol] ?? signal.currentPrice,
    })).filter(signal => {
      if (!signal.closePrice || !signal.currentPrice) return false;
      const profitPercent = ((signal.closePrice - signal.currentPrice) / signal.currentPrice) * 100;
      return profitPercent >= 1;
    });

    // Remove duplicates: keep only one signal with same symbol and same closePrice
    const uniqueSignals = new Map<string, any>();
    allSignals.forEach(signal => {
      const key = `${signal.symbol}_${signal.closePrice}`;
      if (!uniqueSignals.has(key)) {
      uniqueSignals.set(key, signal);
      }
    });
    allSignals = Array.from(uniqueSignals.values());
    // Apply filters
    if (filterBy && filterValue) {
      const filterVal = filterValue as string;
      switch (filterBy) {
        case "symbol":
          allSignals = allSignals.filter(signal => 
            signal.symbol.toLowerCase().includes(filterVal.toLowerCase())
          );
          break;
        case "algo":
          allSignals = allSignals.filter(signal => signal.algo === filterVal);
          break;
        case "minProfit":
          allSignals = allSignals.filter(signal => {
            const profitPercent = ((signal.closePrice - signal.currentPrice) / signal.currentPrice) * 100;
            return profitPercent >= parseFloat(filterVal);
          });
          break;
      }
    }

    // Apply sorting
    allSignals.sort((a, b) => {
      switch (sortBy) {
        case "type":
          // Default sort: candles before zones, then by priority
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          // For same priority, sort by updatedAt (newest first)
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        
        case "symbol":
          const symbolCompare = a.symbol.localeCompare(b.symbol);
          return sortOrder === "asc" ? symbolCompare : -symbolCompare;
        
        case "expectedProfit":
          const profitA = ((a.closePrice - a.currentPrice) / a.currentPrice) * 100;
          const profitB = ((b.closePrice - b.currentPrice) / b.currentPrice) * 100;
          return sortOrder === "asc" ? profitA - profitB : profitB - profitA;
        
        case "updatedAt":
          const dateA = new Date(a.updatedAt).getTime();
          const dateB = new Date(b.updatedAt).getTime();
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        
        default:
          return 0;
      }
    });

    // Pagination
    const total = allSignals.length;
    const paginatedSignals = allSignals.slice(skip, skip + limitNum);

    res.status(200).json({
      signals: paginatedSignals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });

  } catch (error) {
    console.error("Error fetching trading signals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
