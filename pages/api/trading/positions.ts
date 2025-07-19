import { NextApiRequest, NextApiResponse } from 'next'
import Position from '@/models/position'
import connectDB from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Authenticate user
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'Access token required' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    await connectDB()

    const { page = 1, limit = 20, status } = req.query

    const filter: any = { userId: decoded.id }
    if (status) {
      filter.status = status
    }

    const positions = await Position.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('magicCandle')

    const totalCount = await Position.countDocuments(filter)

    res.status(200).json({
      positions: positions.map(position => ({
        id: position._id,
        symbol: position.symbol,
        platform: position.platform,
        side: position.side,
        status: position.status,
        entryPrice: position.entryPrice,
        currentPrice: position.currentPrice,
        exitPrice: position.exitPrice,
        quantity: position.quantity,
        pnl: position.pnl,
        pnlPercentage: position.pnlPercentage,
        limitPrice: position.limitPrice,
        stopLoss: position.stopLoss,
        takeProfit: position.takeProfit,
        binanceOrderId: position.binanceOrderId,
        orderType: position.orderType,
        createdAt: position.createdAt,
        executedAt: position.executedAt,
        closedAt: position.closedAt,
        magicCandle: position.magicCandle,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    })
  } catch (error) {
    console.error('Get positions error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
