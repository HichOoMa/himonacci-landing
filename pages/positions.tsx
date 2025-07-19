import { useState, useEffect } from 'react'
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
  Shield
} from 'lucide-react'
import { toast } from 'sonner'

interface Position {
  id: string
  symbol: string
  side: 'BUY' | 'SELL'
  status: string
  entryPrice: number
  currentPrice?: number
  quantity: number
  pnl: number
  pnlPercentage: number
  createdAt: string
  executedAt?: string
  closedAt?: string
}

interface PositionsData {
  positions: Position[]
  totalCount: number
  activeCount: number
  closedCount: number
  totalPnl: number
  winRate: number
  // Trading statistics
  totalTrades: number
  activeTrades: number
  winningTrades: number
  losingTrades: number
}

export default function PositionsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [positions, setPositions] = useState<PositionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'pnl' | 'symbol'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchPositions()
  }, [user, router])

  const fetchPositions = async () => {
    try {
      setRefreshing(true)
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch('/api/trading/positions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setPositions(data)
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

  const filteredPositions = positions?.positions?.filter(position => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && position.status === 'OPEN') ||
      (filter === 'closed' && position.status !== 'OPEN')
    
    const matchesSearch = position.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  }) || []

  const sortedPositions = [...filteredPositions].sort((a, b) => {
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
  })

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
            <motion.button
              onClick={fetchPositions}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { label: 'Total Positions', value: positions?.totalCount || 0, icon: Activity, color: 'text-white' },
              { label: 'Active Positions', value: positions?.activeCount || 0, icon: Play, color: 'text-secondary-400' },
              { label: 'Closed Positions', value: positions?.closedCount || 0, icon: Pause, color: 'text-gray-400' },
              { label: 'Win Rate', value: `${positions?.winRate?.toFixed(1) || '0.0'}%`, icon: Target, color: 'text-accent-400' },
              { label: 'Total P&L', value: `$${positions?.totalPnl?.toFixed(2) || '0.00'}`, icon: DollarSign, color: (positions?.totalPnl || 0) >= 0 ? 'text-success-400' : 'text-red-400' }
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

          {/* Comprehensive Trading Statistics */}
          <motion.div 
            className="bg-primary-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary-800/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div className="px-6 py-4 border-b border-primary-800/50 bg-gradient-to-r from-secondary-500/10 to-secondary-600/10 rounded-t-2xl">
              <div className="flex items-center">
                <BarChart3 className="w-6 h-6 text-secondary-400 mr-3" />
                <h3 className="text-lg font-semibold text-white">Trading Performance Analytics</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                  { label: 'Total Trades', value: positions?.totalTrades || 0, icon: Activity, color: 'text-white' },
                  { label: 'Active Trades', value: positions?.activeTrades || 0, icon: Play, color: 'text-secondary-400' },
                  { label: 'Winning Trades', value: positions?.winningTrades || 0, icon: TrendingUp, color: 'text-success-400' },
                  { label: 'Losing Trades', value: positions?.losingTrades || 0, icon: TrendingDown, color: 'text-red-400' },
                  { label: 'Success Rate', value: `${positions?.winRate?.toFixed(1) || '0.0'}%`, icon: Target, color: 'text-accent-400' }
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className="text-center p-4 bg-primary-800/30 rounded-xl border border-primary-700/50"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

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
                    onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'closed')}
                    className="bg-primary-800/50 border border-primary-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                  >
                    <option value="all">All Positions</option>
                    <option value="active">Active Only</option>
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
              </div>
            </div>
          </motion.div>

          {/* Positions Table */}
          <motion.div 
            className="bg-primary-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary-800/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div className="px-6 py-4 border-b border-primary-800/50 bg-gradient-to-r from-success-500/10 to-success-600/10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart3 className="w-6 h-6 text-success-400 mr-3" />
                  <h3 className="text-lg font-semibold text-white">
                    Trading Positions ({sortedPositions.length})
                  </h3>
                </div>
                {positions?.winRate && (
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-accent-400" />
                    <span className="text-accent-400 font-medium">
                      Win Rate: {positions.winRate.toFixed(1)}%
                    </span>
                  </div>
                )}
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
                        Side
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
                        Quantity
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
                            position.side === 'BUY' ? 'bg-success-500/20 text-success-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {position.side === 'BUY' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {position.side}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            position.status === 'OPEN' ? 'bg-secondary-500/20 text-secondary-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {position.status === 'OPEN' ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
                            {position.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          ${position.entryPrice.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {position.currentPrice ? `$${position.currentPrice.toFixed(4)}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {position.quantity}
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
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
