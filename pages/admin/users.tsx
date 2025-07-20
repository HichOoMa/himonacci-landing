import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import NavigationAdmin from '@/components/NavigationAdmin'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: 'user' | 'admin'
  subscriptionStatus: 'inactive' | 'active' | 'expired' | 'trial'
  isAutoTradingEnabled: boolean
  isAutoTradingAllowed: boolean
  hasApiKeys: boolean
  createdAt: string
  subscriptionEndDate?: string
  tradingSettingsId?: string
  tradingSettings?: {
    _id: string
    name: string
    isDefault: boolean
  }
}

interface TradingSettings {
  _id: string
  name: string
  isDefault: boolean
}

interface Pagination {
  current: number
  total: number
  count: number
  limit: number
}

export default function AdminUsersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [tradingSettings, setTradingSettings] = useState<TradingSettings[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [message, setMessage] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers()
      fetchTradingSettings()
    }
  }, [user, currentPage])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm
      })

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
      } else {
        setMessage('Error fetching users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setMessage('Error fetching users')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTradingSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/trading-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTradingSettings(data.tradingSettings)
      }
    } catch (error) {
      console.error('Error fetching trading settings:', error)
    }
  }

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, updates })
      })

      const data = await response.json()
      if (response.ok) {
        setMessage('User updated successfully')
        fetchUsers() // Refresh the list
        setEditingUser(null)
      } else {
        setMessage(data.message || 'Error updating user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setMessage('Error updating user')
    }
  }

  const toggleAutoTradingPermission = async (userId: string, currentlyAllowed: boolean) => {
    await updateUser(userId, { isAutoTradingAllowed: !currentlyAllowed })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <NavigationAdmin />
        <div className="flex justify-center items-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-slate-300 text-sm">Loading users...</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-slate-400">Manage user permissions and account settings</p>
            
            {message && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
                <p className="text-blue-200">{message}</p>
              </div>
            )}

            {/* Search */}
            <form onSubmit={handleSearch} className="mt-6 flex gap-4">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
                onClick={() => fetchUsers()}
              >
                Search
              </button>
            </form>
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
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auto Trading
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trading Settings
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
                        <div className="text-xs text-gray-400">
                          Role: {user.role}
                        </div>
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
                      {user.subscriptionEndDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          Expires: {new Date(user.subscriptionEndDate).toLocaleDateString()}
                        </div>
                      )}
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
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.tradingSettings?.isDefault ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.tradingSettings?.name || 'Default'}
                        </span>
                        {user.tradingSettings?.isDefault && (
                          <span className="text-xs text-gray-500">Default</span>
                        )}
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
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleAutoTradingPermission(user._id, user.isAutoTradingAllowed)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            user.isAutoTradingAllowed
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {user.isAutoTradingAllowed ? 'Forbid' : 'Allow'} Auto Trading
                        </button>
                        <button
                          onClick={() => setEditingUser(user)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.total > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.current - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.current * pagination.limit, pagination.count)} of{' '}
                  {pagination.count} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {pagination.current} of {pagination.total}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.total, currentPage + 1))}
                    disabled={currentPage === pagination.total}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit User: {editingUser.firstName} {editingUser.lastName}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    role: e.target.value as 'user' | 'admin'
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Subscription Status</label>
                <select
                  value={editingUser.subscriptionStatus}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    subscriptionStatus: e.target.value as any
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="inactive">Inactive</option>
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Trading Settings</label>
                <select
                  value={editingUser.tradingSettingsId || ''}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    tradingSettingsId: e.target.value || undefined
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Use Default Settings</option>
                  {tradingSettings.map((setting) => (
                    <option key={setting._id} value={setting._id}>
                      {setting.name} {setting.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingUser.isAutoTradingAllowed}
                    onChange={(e) => setEditingUser({
                      ...editingUser,
                      isAutoTradingAllowed: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow Auto Trading</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => updateUser(editingUser._id, {
                  role: editingUser.role,
                  subscriptionStatus: editingUser.subscriptionStatus,
                  isAutoTradingAllowed: editingUser.isAutoTradingAllowed,
                  tradingSettingsId: editingUser.tradingSettingsId
                })}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
