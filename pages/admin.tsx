import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'

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

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [cronStatus, setCronStatus] = useState<CronJobStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchStats()
      fetchCronStatus()
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
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
          
          {message && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">{message}</p>
            </div>
          )}

          {/* Subscription Statistics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Subscription Statistics</h2>
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.expired}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Grace Period</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.gracePeriod}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">${stats.revenue.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Cron Job Management */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Cron Job Management</h2>
            {cronStatus && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="mb-2">
                  <span className="font-medium">Daily Job:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${cronStatus.daily ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {cronStatus.daily ? 'Active' : 'Inactive'}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Hourly Job:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${cronStatus.hourly ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {cronStatus.hourly ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            )}
            
            <div className="space-x-4">
              <button
                onClick={() => handleCronAction('start')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Jobs
              </button>
              <button
                onClick={() => handleCronAction('stop')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Jobs
              </button>
              <button
                onClick={() => handleCronAction('trigger')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manual Check
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
