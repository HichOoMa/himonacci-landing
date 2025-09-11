import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import NavigationDashboard from '@/components/NavigationDashboard'
import Footer from '@/components/Footer'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Play, 
  Pause, 
  RefreshCw,
  Activity,
  Target,
  Filter,
  Calendar,
  DollarSign,
  BarChart3,
  Search,
  ArrowUpDown,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'

interface Position {
  id: string
  symbol: string
  platform: string
  status: string // Will be normalized to uppercase
  margin: number
  entryPrice: number
  exitPrice?: number
  quantity?: number
  magicCandle: string
  signalType?: string
  limitPrice: number
  stopLoss?: number
  takeProfit?: number
  binanceOrderId?: string
  buyedAt?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
  // Calculated fields (client-side)
  side?: 'BUY' | 'SELL'
  currentPrice?: number
  pnl?: number
  pnlPercentage?: number
}

interface PositionsData {
  positions: Position[]
  totalCount: number
  activeCount: number
  closedCount: number
  statistics: {
    totalPnl: number
    todayPnl: number
    activeMargin: number
    totalMargin: number
    winningTrades: number
    losingTrades: number
    winRate: number
    todayPositionsCount: number
  }
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

interface AccountData {
  user: {
    id: string
    email: string
    isAutoTradingEnabled: boolean
    isAutoTradingAllowed: boolean
    bnbBurnEnabled: boolean
    hasApiKeys: boolean
    subscriptionStatus: string
    startBalance?: number
    targetBalance?: number
    primary?: number
    secondary?: number
    periodEndTime?: string
  }
  binanceAccount?: {
    accountType: string
    canTrade: boolean
    canDeposit: boolean
    balances: Array<{
      asset: string
      free: string
      locked: string
      totalBalance: string
      usdtValue: string
    }>
    totalWalletBalanceUSDT: string
  }
  binanceError?: string
  trading: {
    totalTrades: number
    activeTrades: number
    winningTrades: number
    losingTrades: number
    totalPnl: string
    winRate: string
  }
}

// Utility function to calculate PnL
const calculatePnL = (position: Position, currentPrice?: number): { pnl: number, pnlPercentage: number, side: 'BUY' | 'SELL' } => {
  // Default to BUY since quantity might not be available
  // In trading signals, we typically assume BUY positions unless specified otherwise
  const side: 'BUY' | 'SELL' = 'BUY';
  
  // Use margin as the investment amount for PnL calculations
  const margin = position.margin || 0;
  
  let pnl = 0;
  let pnlPercentage = 0;
  
  const normalizedStatus = position.status.toUpperCase();
  
  if (normalizedStatus === 'CLOSED' && position.exitPrice) {
    // Use exit price for closed positions
    if (side === 'BUY') {
      // For BUY positions: PnL = margin * ((exitPrice - entryPrice) / entryPrice)
      pnl = margin * ((position.exitPrice - position.entryPrice) / position.entryPrice);
    } else {
      // For SELL positions: PnL = margin * ((entryPrice - exitPrice) / entryPrice)
      pnl = margin * ((position.entryPrice - position.exitPrice) / position.entryPrice);
    }
    pnlPercentage = margin > 0 ? (pnl / margin) * 100 : 0;
  } else if (normalizedStatus === 'OPEN' && currentPrice) {
    // Use current price for open positions (prefer real-time price if available)
    if (side === 'BUY') {
      // For BUY positions: PnL = margin * ((currentPrice - entryPrice) / entryPrice)
      pnl = margin * ((currentPrice - position.entryPrice) / position.entryPrice);
    } else {
      // For SELL positions: PnL = margin * ((entryPrice - currentPrice) / entryPrice)
      pnl = margin * ((position.entryPrice - currentPrice) / position.entryPrice);
    }
    pnlPercentage = margin > 0 ? (pnl / margin) * 100 : 0;
  }
  
  return { pnl, pnlPercentage, side };
};

export default function PositionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [positions, setPositions] = useState<PositionsData | null>(null)
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'pnl' | 'symbol'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [realTimePrices, setRealTimePrices] = useState<Record<string, number>>({})
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  // Helper function to format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // WebSocket functions for real-time price updates
  const connectToWebSocket = useCallback((symbols: string[]) => {
    if (symbols.length === 0) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create streams for all symbols
    const streams = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Binance WebSocket connected for symbols:', symbols);
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle single ticker data
          if (data.s && data.c) {
            setRealTimePrices(prev => ({
              ...prev,
              [data.s]: parseFloat(data.c)
            }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setWsConnected(false);
        
        // Attempt to reconnect after 5 seconds if not intentionally closed
        if (event.code !== 1000 && symbols.length > 0) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connectToWebSocket(symbols);
          }, 5000);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000); // Normal closure
      wsRef.current = null;
    }
    
    setWsConnected(false);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (accountData?.user?.periodEndTime) {
      const remainingSeconds = Math.floor(
        new Date(accountData.user.periodEndTime).getTime() / 1000 -
          Date.now() / 1000
      );
      setTimeRemaining(remainingSeconds);

      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [accountData?.user?.periodEndTime]);

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchPositions(1, filter !== 'all' ? filter : undefined)
    fetchAccountData()
    setCurrentPage(1)
    
    // Cleanup WebSocket on component unmount
    return () => {
      disconnectWebSocket()
    }
  }, [user, router, filter, pageSize, disconnectWebSocket])

  // Separate effect for page changes
  useEffect(() => {
    if (user && currentPage > 1) {
      fetchPositions(currentPage, filter !== 'all' ? filter : undefined)
    }
  }, [currentPage])

  const fetchPositions = async (page: number = currentPage, status?: string) => {
    try {
      setRefreshing(true)
      const token = localStorage.getItem('token')
      if (!token) return
      
      let url = `/api/trading/positions?page=${page}&limit=${pageSize}`
      if (status && status !== 'all') {
        url += `&status=${status}`
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Normalize the positions data to handle API response format
        const normalizedData = {
          ...data,
          positions: data.positions?.map((pos: any) => ({
            ...pos,
            id: pos.id || pos._id, // Handle both id and _id
            status: pos.status.toUpperCase(), // Normalize status to uppercase
            quantity: pos.quantity || 1, // Default quantity if missing
            createdAt: pos.createdAt || pos.buyedAt, // Use buyedAt as fallback for createdAt
            updatedAt: pos.updatedAt || pos.createdAt || pos.buyedAt
          })) || []
        }
        
        setPositions(normalizedData)
      } else {
        toast.error('Failed to fetch positions')
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error)
      toast.error('Failed to fetch positions')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchAccountData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch('/api/profile/account-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setAccountData(data)
      } else {
        console.error('Failed to fetch account data')
      }
    } catch (error) {
      console.error('Failed to fetch account data:', error)
    }
  }

  // WebSocket effect to connect when positions change
  useEffect(() => {
    if (positions?.positions && positions.positions.length > 0) {
      // Get unique symbols from active positions
      const activeSymbols = positions.positions
        .filter(pos => pos.status.toUpperCase() === 'OPEN')
        .map(pos => pos.symbol)
        .filter((symbol, index, arr) => arr.indexOf(symbol) === index); // Remove duplicates

      if (activeSymbols.length > 0) {
        connectToWebSocket(activeSymbols);
      } else {
        disconnectWebSocket();
      }
    } else {
      disconnectWebSocket();
    }
  }, [positions, connectToWebSocket, disconnectWebSocket]);

  // Enhanced positions with calculated PnL (only for display purposes now, real stats come from API)
  const enhancedPositions = positions?.positions?.map(position => {
    const currentPrice = realTimePrices[position.symbol] || position.currentPrice;
    const { pnl, pnlPercentage, side } = calculatePnL(position, currentPrice);
    return {
      ...position,
      currentPrice,
      pnl,
      pnlPercentage,
      side
    };
  }) || [];

  const statistics = positions?.statistics || {
    totalPnl: 0,
    todayPnl: 0,
    activeMargin: 0,
    totalMargin: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    todayPositionsCount: 0
  };

  // Use positions directly since filtering is now done server-side for pagination
  const displayPositions = enhancedPositions.filter(position => {
    return position.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  });

  const sortedPositions = [...displayPositions].sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      case 'pnl':
        aValue = a.pnl
        bValue = b.pnl
        break
      case 'symbol':
        aValue = a.symbol
        bValue = b.symbol
        break
      default:
        aValue = a.createdAt
        bValue = b.createdAt
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-950">
        <NavigationDashboard />
        <div className="flex justify-center items-center h-screen">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-secondary-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading positions...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  // Restrict access for trial users
  if (user?.subscriptionStatus === "trial" as any) {
    return (
      <div className="min-h-screen bg-primary-950">
        <NavigationDashboard />
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-screen">
            <motion.div
              className="text-center bg-primary-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-primary-800/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-accent-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Premium Feature
              </h1>
              <p className="text-gray-300 text-lg mb-6">
                Trading positions and analytics are available for premium subscribers only.
              </p>
              <p className="text-gray-400 mb-8">
                Upgrade to premium to access detailed position tracking, trading statistics, 
                and advanced analytics.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="btn-primary px-8 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Back to Dashboard
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-950">
      <NavigationDashboard />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center pt-16">
            <motion.h1 
              className="text-4xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Trading Positions
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-300 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Monitor your trading performance and position history
            </motion.p>
            
            {/* Period Countdown in Header */}
            {accountData?.user?.periodEndTime && timeRemaining > 0 && (
              <motion.div
                className="mb-4 inline-flex items-center space-x-3 bg-indigo-900/30 border border-indigo-500/30 rounded-lg px-4 py-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <span className="text-indigo-300 text-sm">Next Period in:</span>
                <span className="text-indigo-200 font-mono font-bold">
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </motion.div>
            )}
            
            <motion.button
              onClick={() => {
                fetchPositions(currentPage, filter !== 'all' ? filter : undefined)
                fetchAccountData()
              }}
              disabled={refreshing}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Positions'}
            </motion.button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {[
              { label: 'Total Positions', value: positions?.totalCount || 0, icon: Activity, color: 'text-white' },
              { label: 'Active Positions', value: positions?.activeCount || 0, icon: Play, color: 'text-secondary-400' },
              { label: 'Active Margin', value: `$${statistics.activeMargin.toFixed(2)}`, icon: DollarSign, color: 'text-blue-400' },
              { label: 'Today\'s P&L', value: `$${statistics.todayPnl.toFixed(2)}`, icon: Calendar, color: statistics.todayPnl >= 0 ? 'text-success-400' : 'text-red-400' },
              { label: 'Win Rate', value: `${statistics.winRate.toFixed(1)}%`, icon: Target, color: 'text-accent-400' },
              { label: 'Total P&L', value: `$${statistics.totalPnl.toFixed(2)}`, icon: TrendingUp, color: statistics.totalPnl >= 0 ? 'text-success-400' : 'text-red-400' }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="bg-primary-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-primary-800/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary-800/50 flex items-center justify-center">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Account Overview */}
          {accountData?.binanceAccount && (
            <motion.div 
              className="bg-primary-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-primary-800/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Account Overview</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Connected to Binance</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">USDT Available</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${parseFloat(accountData.binanceAccount.balances.find(b => b.asset === 'USDT')?.free || '0').toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Wallet (USDT)</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${accountData.binanceAccount.totalWalletBalanceUSDT}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Start Balance</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ${accountData.user.startBalance || "0.00"}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Target Balance</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${accountData.user.targetBalance || "0.00"}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Primary Count</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {accountData.user.primary || 0}
                  </p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Secondary Count</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {accountData.user.secondary || 0}
                  </p>
                </div>
              </div>

              {/* Period Countdown */}
              {accountData.user.periodEndTime && (
                <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Next Period Countdown
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Next Period Starts:
                      </p>
                      <p className="text-lg font-medium text-gray-900">
                        {new Date(
                          accountData.user.periodEndTime
                        ).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(accountData.user.periodEndTime).toLocaleDateString()} at {new Date(accountData.user.periodEndTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Time Remaining:
                      </p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {formatTimeRemaining(timeRemaining || 0)}
                      </p>
                      {timeRemaining > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-500">
                            {timeRemaining.toLocaleString()} seconds
                          </p>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
                              style={{ 
                                width: timeRemaining > 0 ? `${Math.max(5, (timeRemaining / (24 * 60 * 60)) * 100)}%` : '0%'
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                      {timeRemaining <= 0 && (
                        <p className="text-sm text-red-500 mt-1">
                          Period has ended
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Account Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center justify-between bg-primary-800/30 p-3 rounded-lg">
                  <span className="text-sm text-gray-300">Can Trade:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    accountData.binanceAccount.canTrade
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {accountData.binanceAccount.canTrade ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-primary-800/30 p-3 rounded-lg">
                  <span className="text-sm text-gray-300">Can Deposit:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    accountData.binanceAccount.canDeposit
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {accountData.binanceAccount.canDeposit ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-primary-800/30 p-3 rounded-lg">
                  <span className="text-sm text-gray-300">Auto Trading:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    accountData.user.isAutoTradingEnabled
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {accountData.user.isAutoTradingEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-primary-800/30 p-3 rounded-lg">
                  <span className="text-sm text-gray-300">Account Type:</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {accountData.binanceAccount.accountType}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Binance Error */}
          {accountData?.binanceError && (
            <motion.div 
              className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-red-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-400">Binance Connection Error</h3>
                  <p className="text-red-300 mt-1">{accountData.binanceError}</p>
                  <p className="text-sm text-red-400 mt-2">
                    Please check your API credentials in your profile settings.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Filters and Search */}
          <motion.div 
            className="bg-primary-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-primary-800/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {/* Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value as 'all' | 'open' | 'closed');
                      setCurrentPage(1);
                    }}
                    className="bg-primary-800/50 border border-primary-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                  >
                    <option value="all">All Positions</option>
                    <option value="open">Open Only</option>
                    <option value="closed">Closed Only</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-5 h-5 text-gray-400" />
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-')
                      setSortBy(newSortBy as 'date' | 'pnl' | 'symbol')
                      setSortOrder(newSortOrder as 'asc' | 'desc')
                    }}
                    className="bg-primary-800/50 border border-primary-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="pnl-desc">Highest P&L</option>
                    <option value="pnl-asc">Lowest P&L</option>
                    <option value="symbol-asc">Symbol A-Z</option>
                    <option value="symbol-desc">Symbol Z-A</option>
                  </select>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>Page {currentPage} of {positions?.pagination?.totalPages || 1}</span>
                  {(positions?.statistics?.todayPositionsCount || 0) > 0 && (
                    <span className="text-accent-400">
                      {positions?.statistics?.todayPositionsCount || 0} today
                    </span>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-primary-800/50 border border-primary-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Positions Table */}
          <motion.div 
            className="bg-primary-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary-800/50 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            {refreshing && (
              <div className="absolute inset-0 bg-primary-900/75 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary-600 border-t-transparent mx-auto mb-2"></div>
                  <p className="text-gray-300 text-sm">Loading positions...</p>
                </div>
              </div>
            )}
            <div className="px-6 py-4 border-b border-primary-800/50 bg-gradient-to-r from-success-500/10 to-success-600/10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart3 className="w-6 h-6 text-success-400 mr-3" />
                  <h3 className="text-lg font-semibold text-white">
                    Trading Positions ({sortedPositions.length})
                  </h3>
                  {wsConnected && (
                    <div className="ml-3 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400">Live Prices</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {sortedPositions.length > 0 ? (
                <table className="min-w-full divide-y divide-primary-700/50">
                  <thead className="bg-primary-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Entry Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Current Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Limit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Margin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        P&L
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        P&L %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-primary-900/30 divide-y divide-primary-700/50">
                    {sortedPositions.map((position, index) => (
                      <motion.tr 
                        key={position.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 + index * 0.05 }}
                        className="hover:bg-primary-800/20 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-white">{position.symbol.charAt(0)}</span>
                            </div>
                            <span className="text-sm font-medium text-white">{position.symbol}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            position.status.toUpperCase() === 'OPEN' ? 'bg-secondary-500/20 text-secondary-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {position.status.toUpperCase() === 'OPEN' ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
                            {position.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          ${position.entryPrice.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          <div className="flex items-center space-x-2">
                            <span>
                              {position.currentPrice ? `$${position.currentPrice.toFixed(4)}` : '-'}
                            </span>
                            {realTimePrices[position.symbol] && position.status.toUpperCase() === 'OPEN' && (
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live price"></div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          ${position.limitPrice.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          <span className="font-medium text-blue-400">
                            ${position.margin.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            position.pnl >= 0 ? 'text-success-400' : 'text-red-400'
                          }`}>
                            {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            position.pnlPercentage >= 0 ? 'text-success-400' : 'text-red-400'
                          }`}>
                            {position.pnlPercentage >= 0 ? '+' : ''}{position.pnlPercentage.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(position.createdAt).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No positions found</p>
                  <p className="text-gray-500 text-sm">
                    {searchTerm ? 'Try adjusting your search terms' : 'Auto trading will create positions automatically when enabled'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Pagination Controls */}
            {positions?.pagination && positions.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-primary-800/50 bg-primary-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, positions.pagination.totalCount)} of {positions.pagination.totalCount} positions
                    </span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      className="bg-primary-800/50 border border-primary-700/50 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, positions.pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (positions.pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= positions.pagination.totalPages - 2) {
                          pageNum = positions.pagination.totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg ${
                              currentPage === pageNum
                                ? 'bg-secondary-500 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-primary-800/50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, positions.pagination.totalPages))}
                      disabled={currentPage === positions.pagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(positions.pagination.totalPages)}
                      disabled={currentPage === positions.pagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
