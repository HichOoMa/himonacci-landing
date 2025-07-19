import { NextApiRequest, NextApiResponse } from 'next'
import User from '@/models/User'
import Position from '@/models/position'
import connectDB from '@/lib/mongodb'
import Binance from 'binance-api-node'
import Authenticate, { AuthenticatedRequest } from '@/utils/Authentificate'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Authenticate user
    const authError = await Authenticate(req, res);
    if (authError) return;

    await connectDB()
    const user = await User.findById(req.user?._id).select('+binanceApiKey +binanceApiSecret')
    // Get Binance account info if API keys are configured
    let binanceAccount = null
    let binanceError = null
    
    if (user.binanceApiKey && user.binanceApiSecret) {
      try {
        const client = Binance({
          apiKey: user.binanceApiKey,
          apiSecret: user.binanceApiSecret
        })

        const response = await client.accountInfo()

        if (response) {
          binanceAccount = response;
        } else {
          binanceError = 'Failed to fetch Binance account data'
        }
      } catch (error) {
        console.log('Binance API error:', error)
        binanceError = 'Error connecting to Binance API'
      }
    }

    // Get trading statistics
    const positions = await Position.find({ userId: user._id })
    const activePositions = positions.filter(p => p.status === 'OPEN')
    const closedPositions = positions.filter(p => p.status === 'CLOSED')
    
    const totalTrades = positions.length
    const activeTrades = activePositions.length
    const winningTrades = closedPositions.filter(p => p.pnl > 0).length
    const losingTrades = closedPositions.filter(p => p.pnl < 0).length
    
    const totalPnl = closedPositions.reduce((sum, p) => sum + (p.pnl || 0), 0)
    const winRate = closedPositions.length > 0 ? (winningTrades / closedPositions.length) * 100 : 0

    // Get recent positions
    const recentPositions = await Position.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('magicCandle')
    const stats = {
      user: {
        id: user._id,
        email: user.email,
        isAutoTradingEnabled: user.isAutoTradingEnabled,
        isAutoTradingAllowed: user.isAutoTradingAllowed !== false, // Default to true if undefined
        hasApiKeys: !!(user.binanceApiKey && user.binanceApiSecret),
        subscriptionStatus: user.subscriptionStatus,
      },
      binanceAccount: binanceAccount ? {
        accountType: binanceAccount.accountType,
        canTrade: binanceAccount.canTrade,
        canDeposit: binanceAccount.canDeposit,
        balances: binanceAccount.balances?.filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0) || [],
        totalWalletBalance: binanceAccount.balances?.reduce((sum: number, b: any) => sum + parseFloat(b.free) + parseFloat(b.locked), 0).toFixed(2)
      } : null,
      binanceError,
      trading: {
        totalTrades,
        activeTrades,
        winningTrades,
        losingTrades,
        totalPnl: totalPnl.toFixed(2),
        winRate: winRate.toFixed(2),
      },
      recentPositions: recentPositions.map(position => ({
        id: position._id,
        symbol: position.symbol,
        side: position.side,
        status: position.status,
        entryPrice: position.entryPrice,
        currentPrice: position.currentPrice,
        quantity: position.quantity,
        pnl: position.pnl,
        pnlPercentage: position.pnlPercentage,
        createdAt: position.createdAt,
        executedAt: position.executedAt,
        closedAt: position.closedAt,
      })),
    }

    res.status(200).json(stats)
  } catch (error) {
    console.error('Account stats error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
