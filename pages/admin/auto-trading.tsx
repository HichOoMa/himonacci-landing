import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import NavigationAdmin from '@/components/NavigationAdmin'

interface AutoTradingUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  isAutoTradingEnabled: boolean
  isAutoTradingAllowed: boolean
  subscriptionStatus: string
  hasApiKeys: boolean
  createdAt: string
}

export default function AdminAutoTradingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AutoTradingUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState<'all' | 'enabled' | 'forbidden'>('all')

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAutoTradingUsers()
    }
  }, [user, filter])

  const fetchAutoTradingUsers = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/auto-trading-users?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        setMessage('Error fetching users')
      }
    } catch (error) {
      console.error('Error fetching auto trading users:', error)
      setMessage('Error fetching users')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAutoTradingPermission = async (userId: string, currentlyAllowed: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId, 
          updates: { isAutoTradingAllowed: !currentlyAllowed }
        })
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(`Auto trading ${!currentlyAllowed ? 'allowed' : 'forbidden'} for user successfully`)
        fetchAutoTradingUsers()
      } else {
        setMessage(data.message || 'Error updating user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setMessage('Error updating user')
    }
  }

  const bulkTogglePermission = async (allow: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/bulk-auto-trading', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ allow, userIds: users.map(u => u._id) })
      })

      const data = await response.json()
      if (response.ok) {
        setMessage(`Auto trading ${allow ? 'allowed' : 'forbidden'} for all users`)
        fetchAutoTradingUsers()
      } else {
        setMessage(data.message || 'Error updating users')
      }
    } catch (error) {
      console.error('Error bulk updating users:', error)
      setMessage('Error updating users')
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <NavigationAdmin />
        <div className="flex justify-center items-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="text-slate-300 text-sm">Loading auto trading data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavigationAdmin />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h1 className="text-3xl font-bold text-white mb-2">Auto Trading Management</h1>
            <p className="text-slate-400">Control and monitor automated trading permissions</p>
            
            {message && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">{message}</p>
              </div>
            )}

            {/* Filters and Bulk Actions */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Users
                </button>
                <button
                  onClick={() => setFilter('enabled')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === 'enabled' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Auto Trading Enabled
                </button>
                <button
                  onClick={() => setFilter('forbidden')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === 'forbidden' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Forbidden Users
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => bulkTogglePermission(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  Allow All
                </button>
                <button
                  onClick={() => bulkTogglePermission(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  Forbid All
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Auto Trading Enabled</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.isAutoTradingEnabled).length}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Forbidden</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => !u.isAutoTradingAllowed).length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">With API Keys</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.hasApiKeys).length}
                </p>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auto Trading
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Keys
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                        user.subscriptionStatus === 'trial' ? 'bg-blue-100 text-blue-800' :
                        user.subscriptionStatus === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isAutoTradingEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isAutoTradingEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isAutoTradingAllowed ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isAutoTradingAllowed ? 'Allowed' : 'Forbidden'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.hasApiKeys ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.hasApiKeys ? 'Configured' : 'Not Set'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleAutoTradingPermission(user._id, user.isAutoTradingAllowed)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          user.isAutoTradingAllowed
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.isAutoTradingAllowed ? 'Forbid' : 'Allow'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No users found for the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
