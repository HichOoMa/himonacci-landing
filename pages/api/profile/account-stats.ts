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

        const [accountResponse, pricesResponse] = await Promise.all([
          client.accountInfo(),
          client.prices()
        ])

        if (accountResponse && pricesResponse) {
          // Calculate total wallet balance in USDT
          let totalWalletBalanceUSDT = 0
          const balancesWithUSDT = accountResponse.balances?.map((balance: any) => {
            const asset = balance.asset
            const totalBalance = parseFloat(balance.free) + parseFloat(balance.locked)
            
            if (totalBalance === 0) return null
            
            let usdtValue = 0
            
            if (asset === 'USDT') {
              usdtValue = totalBalance
            } else if (asset === 'BUSD' || asset === 'FDUSD') {
              // Stable coins approximately equal to USDT
              usdtValue = totalBalance
            } else {
              // Try to get price against USDT
              const symbolPrice = pricesResponse[`${asset}USDT`]
              if (symbolPrice) {
                usdtValue = totalBalance * parseFloat(symbolPrice)
              } else {
                // If no direct USDT pair, try BTC pair and convert through BTC
                const btcPrice = pricesResponse[`${asset}BTC`]
                const btcUsdtPrice = pricesResponse['BTCUSDT']
                if (btcPrice && btcUsdtPrice) {
                  usdtValue = totalBalance * parseFloat(btcPrice) * parseFloat(btcUsdtPrice)
                }
              }
            }
            
            totalWalletBalanceUSDT += usdtValue
            
            return {
              ...balance,
              totalBalance: totalBalance.toFixed(8),
              usdtValue: usdtValue.toFixed(2)
            }
          }).filter(Boolean) || []

          binanceAccount = {
            ...accountResponse,
            balances: balancesWithUSDT,
            totalWalletBalanceUSDT: totalWalletBalanceUSDT.toFixed(2)
          }
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


    const recentPositions = await Position.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
    const stats = {
      user: {
        id: user._id,
        email: user.email,
        isAutoTradingEnabled: user.isAutoTradingEnabled,
        isAutoTradingAllowed: user.isAutoTradingAllowed !== false, // Default to true if undefined
        bnbBurnEnabled: user.bnbBurnEnabled !== false, // Default to true if undefined
        hasApiKeys: !!(user.binanceApiKey && user.binanceApiSecret),
        subscriptionStatus: user.subscriptionStatus,
      },
      binanceAccount: binanceAccount ? {
        accountType: binanceAccount.accountType,
        canTrade: binanceAccount.canTrade,
        canDeposit: binanceAccount.canDeposit,
        balances: binanceAccount.balances?.filter((b: any) => parseFloat(b.totalBalance) > 0) || [],
        totalWalletBalanceUSDT: binanceAccount.totalWalletBalanceUSDT
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
