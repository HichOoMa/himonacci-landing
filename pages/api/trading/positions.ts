import { NextApiRequest, NextApiResponse } from "next";
import Position from "@/models/position";
import connectDB from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import Authenticate, { AuthenticatedRequest } from "@/utils/Authentificate";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const authError = await Authenticate(req, res);
    if (authError) return;

    await connectDB();

    const { page = 1, limit = 20, status } = req.query;

    const filter: any = { userId: req.user?._id };
    if (status) {
      filter.status = status;
    }

    const positions = await Position.find(filter)
      .sort({ buyedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const totalCount = await Position.countDocuments(filter);
    const totalClosed = await Position.countDocuments({ status: 'closed', userId: req.user?._id });
    const totalOpen = await Position.countDocuments({ status: 'open', userId: req.user?._id });

    // Clean positions data and remove undefined properties
    const cleanedPositions = positions.map((position: any) => {
      const cleanedPosition: any = {
        id: position._id?.toString() || position.id,
        userId: position.userId?.toString(),
        symbol: position.symbol,
        platform: position.platform,
        status: position.status,
        margin: position.margin,
        entryPrice: position.entryPrice,
        quantity: position.quantity,
        magicCandle: position.magicCandle?.toString(),
        signalType: position.signalType,
        limitPrice: position.limitPrice,
        createdAt: position.createdAt,
        updatedAt: position.updatedAt,
      };

      // Only include optional fields if they have values
      if (position.exitPrice !== undefined && position.exitPrice !== null) {
        cleanedPosition.exitPrice = position.exitPrice;
      }
      if (position.stopLoss !== undefined && position.stopLoss !== null) {
        cleanedPosition.stopLoss = position.stopLoss;
      }
      if (position.takeProfit !== undefined && position.takeProfit !== null) {
        cleanedPosition.takeProfit = position.takeProfit;
      }
      if (position.binanceOrderId) {
        cleanedPosition.binanceOrderId = position.binanceOrderId;
      }
      if (position.buyedAt) {
        cleanedPosition.buyedAt = position.buyedAt;
      }
      if (position.closedAt) {
        cleanedPosition.closedAt = position.closedAt;
      }

      return cleanedPosition;
    });

    // Calculate today's start date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all positions for statistics (not paginated)
    const allPositions = await Position.find({ userId: req.user?._id }).lean();
    const todayPositions = allPositions.filter((pos: any) => {
      const posDate = new Date(pos.buyedAt || pos.createdAt);
      return posDate >= today;
    });

    // Calculate statistics
    let totalPnl = 0;
    let todayPnl = 0;
    let activeMargin = 0;
    let totalMargin = 0;
    let winningTrades = 0;
    let losingTrades = 0;

    allPositions.forEach((position: any) => {
      const margin = position.margin || 0;
      totalMargin += margin;

      if (position.status === 'open') {
        activeMargin += margin;
      }

      // Calculate PnL for closed positions
      if (position.status === 'closed' && position.exitPrice && position.entryPrice) {
        const pnl = margin * ((position.exitPrice - position.entryPrice) / position.entryPrice);
        totalPnl += pnl;
        
        if (pnl > 0) winningTrades++;
        else if (pnl < 0) losingTrades++;
      }
    });

    // Calculate today's PnL
    todayPositions.forEach((position: any) => {
      const margin = position.margin || 0;
      
      if (position.status === 'closed' && position.exitPrice && position.entryPrice) {
        const pnl = margin * ((position.exitPrice - position.entryPrice) / position.entryPrice);
        todayPnl += pnl;
      }
    });

    const totalClosedTrades = winningTrades + losingTrades;
    const winRate = totalClosedTrades > 0 ? (winningTrades / totalClosedTrades) * 100 : 0;

    res.status(200).json({
      positions: cleanedPositions,
      totalCount,
      activeCount: totalOpen,
      closedCount: totalClosed,
      statistics: {
        totalPnl,
        todayPnl,
        activeMargin,
        totalMargin,
        winningTrades,
        losingTrades,
        winRate,
        todayPositionsCount: todayPositions.length
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get positions error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
