import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import NavigationAdmin from '@/components/NavigationAdmin'
import { 
  Users, 
  Settings, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  BarChart3,
  Zap,
  RefreshCw,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react'

interface SubscriptionStats {
  total: number
  active: number
  expired: number
  cancelled: number
  gracePeriod: number
  revenue: number
}

interface CronJobStatus {
  daily: boolean
  hourly: boolean
}

interface UserStats {
  totalUsers: number
  verifiedUsers: number
  autoTradingUsers: number
  usersWithApiKeys: number
}

interface AutoTradingStats {
  enabledUsers: number
  allowedUsers: number
  forbiddenUsers: number
}

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [autoTradingStats, setAutoTradingStats] = useState<AutoTradingStats | null>(null)
  const [cronStatus, setCronStatus] = useState<CronJobStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    console.log('Loading:', loading)
    console.log('User:', user)
    if (!loading && (!user || user.role !== 'admin')) {
      // router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchStats()
      fetchCronStatus()
      fetchUserStats()
      fetchAutoTradingStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/subscription-checks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCronStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/cron', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCronStatus(data.jobs)
      }
    } catch (error) {
      console.error('Error fetching cron status:', error)
    }
  }

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/user-stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUserStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const fetchAutoTradingStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/auto-trading-stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAutoTradingStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching auto trading stats:', error)
    }
  }

  const handleCronAction = async (action: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/cron', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(data.message)
        if (action === 'trigger') {
          fetchStats() // Refresh stats after manual trigger
        }
        fetchCronStatus() // Refresh cron status
      } else {
        setMessage(data.message || 'Error occurred')
      }
    } catch (error) {
      console.error('Error managing cron:', error)
      setMessage('Error occurred')
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <NavigationAdmin />
        <div className="flex justify-center items-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-slate-300 text-sm">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavigationAdmin />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-slate-400">Manage your platform with comprehensive controls</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  fetchStats()
                  fetchUserStats()
                  fetchAutoTradingStats()
                  fetchCronStatus()
                }}
                className="inline-flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-400 mr-3" />
              <p className="text-blue-200">{message}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-blue-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/admin/users')}
              className="group relative p-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <Users className="w-8 h-8 mb-3 text-blue-200" />
                  <h3 className="text-lg font-semibold">Manage Users</h3>
                  <p className="text-blue-200 text-sm">Control user permissions</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => router.push('/admin/auto-trading')}
              className="group relative p-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <Activity className="w-8 h-8 mb-3 text-green-200" />
                  <h3 className="text-lg font-semibold">Auto Trading</h3>
                  <p className="text-green-200 text-sm">Manage trading controls</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handleCronAction('trigger')}
              className="group relative p-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <Settings className="w-8 h-8 mb-3 text-purple-200" />
                  <h3 className="text-lg font-semibold">System Check</h3>
                  <p className="text-purple-200 text-sm">Run system diagnostics</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Statistics */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                User Analytics
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-400">Live</span>
              </div>
            </div>
            {userStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/30">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-xs text-slate-400">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{userStats.totalUsers}</p>
                  <p className="text-sm text-slate-400">Registered Users</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/30">
                  <div className="flex items-center justify-between mb-2">
                    <UserCheck className="w-5 h-5 text-green-400" />
                    <span className="text-xs text-slate-400">Verified</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{userStats.verifiedUsers}</p>
                  <p className="text-sm text-slate-400">Email Verified</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/30">
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span className="text-xs text-slate-400">API Keys</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{userStats.usersWithApiKeys}</p>
                  <p className="text-sm text-slate-400">Configured Keys</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/30">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-orange-400" />
                    <span className="text-xs text-slate-400">Active</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{userStats.autoTradingUsers}</p>
                  <p className="text-sm text-slate-400">Auto Trading</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            )}
          </div>

          {/* Auto Trading Statistics */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                Auto Trading Control
              </h2>
              <button
                onClick={() => router.push('/admin/auto-trading')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
              >
                <Eye className="w-3 h-3 mr-1" />
                View Details
              </button>
            </div>
            {autoTradingStats ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-sm text-slate-300">Enabled Users</span>
                    </div>
                    <span className="text-2xl font-bold text-green-400">{autoTradingStats.enabledUsers}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(autoTradingStats.enabledUsers / (autoTradingStats.allowedUsers || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/30">
                    <div className="flex items-center justify-between mb-2">
                      <UserCheck className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-slate-400">Allowed</span>
                    </div>
                    <p className="text-xl font-bold text-white">{autoTradingStats.allowedUsers}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/30">
                    <div className="flex items-center justify-between mb-2">
                      <UserX className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-slate-400">Forbidden</span>
                    </div>
                    <p className="text-xl font-bold text-white">{autoTradingStats.forbiddenUsers}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Grid - Subscription & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subscription Statistics */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
                Revenue Analytics
              </h2>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">Growing</span>
              </div>
            </div>
            {stats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <span className="text-xs text-slate-400">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-sm text-slate-400">Subscriptions</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg p-4 border border-green-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-xs text-slate-400">Active</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                  <p className="text-sm text-slate-400">Paying Users</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-lg p-4 border border-yellow-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <span className="text-xs text-slate-400">Expired</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.expired}</p>
                  <p className="text-sm text-slate-400">Need Renewal</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg p-4 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    <span className="text-xs text-slate-400">Grace</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.gracePeriod}</p>
                  <p className="text-sm text-slate-400">Grace Period</p>
                </div>
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-lg p-4 border border-red-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <UserX className="w-5 h-5 text-red-400" />
                    <span className="text-xs text-slate-400">Cancelled</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
                  <p className="text-sm text-slate-400">Churned Users</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    <span className="text-xs text-slate-400">Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-white">${stats.revenue.toFixed(0)}</p>
                  <p className="text-sm text-slate-400">Total Revenue</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Settings className="w-5 h-5 mr-2 text-slate-400" />
                System Status
              </h2>
            </div>
            
            {cronStatus ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  cronStatus.daily 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Daily Jobs</span>
                    <div className={`flex items-center space-x-2 ${
                      cronStatus.daily ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {cronStatus.daily ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span className="text-xs">{cronStatus.daily ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg border ${
                  cronStatus.hourly 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Hourly Jobs</span>
                    <div className={`flex items-center space-x-2 ${
                      cronStatus.hourly ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {cronStatus.hourly ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span className="text-xs">{cronStatus.hourly ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-24">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-400"></div>
              </div>
            )}
            
            {/* Control Buttons */}
            <div className="mt-6 space-y-2">
              <button
                onClick={() => handleCronAction('start')}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Start Jobs
              </button>
              <button
                onClick={() => handleCronAction('stop')}
                className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Stop Jobs
              </button>
              <button
                onClick={() => handleCronAction('trigger')}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Manual Check
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
