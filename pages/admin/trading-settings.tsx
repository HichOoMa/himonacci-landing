import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import NavigationAdmin from '@/components/NavigationAdmin'
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  TrendingUp,
  DollarSign,
  AlertCircle,
  Star,
  Users,
  Search,
  Filter,
  MoreVertical,
  Copy,
  Eye,
  Save,
  ArrowUpDown,
  Percent
} from 'lucide-react'

interface TradingSettings {
  _id: string
  name: string
  isDefault: boolean
  periodDuration: number
  positionsPerPeriod: number
  reservedPeriodsBalance: number
  closeAllCheckPeriod: number
  closeAllProfitThreshold: number
  minExpectedProfit: number
  minVolume: number
  createdAt: string
  updatedAt: string
}

interface FormData {
  name: string
  isDefault: boolean
  periodDuration: number
  positionsPerPeriod: number
  reservedPeriodsBalance: number
  closeAllCheckPeriod: number
  closeAllProfitThreshold: number
  minExpectedProfit: number
  minVolume: number
}

export default function TradingSettingsAdmin() {
  const { user, loading: userLoading } = useAuth()
  const router = useRouter()
  const [tradingSettings, setTradingSettings] = useState<TradingSettings[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'default'>('default')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    isDefault: false,
    periodDuration: 60,
    positionsPerPeriod: 5,
    reservedPeriodsBalance: 2,
    closeAllCheckPeriod: 7,
    closeAllProfitThreshold: 4,
    minExpectedProfit: 5,
    minVolume: 1000,
  })

  const getToken = () => {
    return localStorage.getItem('token')
  }

  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'admin')) {
      router.push('/')
      return
    }
    fetchTradingSettings()
  }, [user, router])

  const fetchTradingSettings = async () => {
    try {
      const token = getToken()
      const response = await fetch('/api/admin/trading-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setTradingSettings(data.tradingSettings)
      }
    } catch (error) {
      console.error('Error fetching trading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = getToken()
      const url = editingId 
        ? `/api/admin/trading-settings?id=${editingId}`
        : '/api/admin/trading-settings'
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchTradingSettings()
        resetForm()
      } else {
        const data = await response.json()
        alert(data.message || 'Error saving trading settings')
      }
    } catch (error) {
      console.error('Error saving trading settings:', error)
      alert('Error saving trading settings')
    }
  }

  const handleEdit = (settings: TradingSettings) => {
    setFormData({
      name: settings.name,
      isDefault: settings.isDefault,
      periodDuration: settings.periodDuration,
      positionsPerPeriod: settings.positionsPerPeriod,
      reservedPeriodsBalance: settings.reservedPeriodsBalance,
      closeAllCheckPeriod: settings.closeAllCheckPeriod,
      closeAllProfitThreshold: settings.closeAllProfitThreshold,
      minExpectedProfit: settings.minExpectedProfit,
      minVolume: settings.minVolume,
    })
    setEditingId(settings._id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trading settings configuration?')) {
      return
    }

    try {
      const token = getToken()
      const response = await fetch(`/api/admin/trading-settings?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchTradingSettings()
      } else {
        const data = await response.json()
        alert(data.message || 'Error deleting trading settings')
      }
    } catch (error) {
      console.error('Error deleting trading settings:', error)
      alert('Error deleting trading settings')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      isDefault: false,
      periodDuration: 60,
      positionsPerPeriod: 5,
      reservedPeriodsBalance: 1000,
      closeAllCheckPeriod: 30,
      closeAllProfitThreshold: 100,
      minExpectedProfit: 5,
      minVolume: 1000,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const filteredSettings = tradingSettings.filter(setting =>
    setting.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'default':
        return (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)
      default:
        return 0
    }
  })

  const duplicateSettings = (settings: TradingSettings) => {
    setFormData({
      name: `${settings.name} (Copy)`,
      isDefault: false,
      periodDuration: settings.periodDuration,
      positionsPerPeriod: settings.positionsPerPeriod,
      reservedPeriodsBalance: settings.reservedPeriodsBalance,
      closeAllCheckPeriod: settings.closeAllCheckPeriod,
      closeAllProfitThreshold: settings.closeAllProfitThreshold,
      minExpectedProfit: settings.minExpectedProfit,
      minVolume: settings.minVolume,
    })
    setEditingId(null)
    setShowForm(true)
  }

  if (!user || user.role !== 'admin') {
    return <div>Access denied</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <NavigationAdmin />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Trading Settings
                  </h1>
                  <p className="text-lg text-gray-600">
                    Configure and manage trading parameters
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">New Configuration</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search configurations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-foreground bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white/50 border border-gray-200/50 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="default">Sort by Default</option>
                  <option value="name">Sort by Name</option>
                  <option value="created">Sort by Created</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {editingId ? 'Edit Configuration' : 'Create New Configuration'}
                      </h2>
                      <p className="text-blue-100">
                        {editingId ? 'Update trading parameters' : 'Define new trading parameters'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Settings */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Settings className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Basic Settings</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Configuration Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="text-foreground w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter a descriptive name..."
                          required
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <div className="flex items-center p-4 bg-amber-50 border border-amber-200 rounded-xl">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isDefault" className="ml-3 flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500" />
                            <span className="text-sm font-semibold text-gray-700">
                              Set as Default Configuration
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trading Parameters */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Trading Parameters</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Period Duration
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            value={formData.periodDuration}
                            onChange={(e) => setFormData({ ...formData, periodDuration: parseInt(e.target.value) })}
                            className="w-full pl-12 pr-16 text-foreground py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            min="1"
                            required
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                            minutes
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Positions Per Period
                        </label>
                        <div className="relative">
                          <TrendingUp className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            value={formData.positionsPerPeriod}
                            onChange={(e) => setFormData({ ...formData, positionsPerPeriod: parseInt(e.target.value) })}
                            className="w-full pl-12 pr-4 py-3 text-foreground bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            min="1"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Reserved Balance
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            step="0.01"
                            value={formData.reservedPeriodsBalance}
                            onChange={(e) => setFormData({ ...formData, reservedPeriodsBalance: parseFloat(e.target.value) })}
                            className="w-full pl-12 pr-4 py-3 text-foreground bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            min="0"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Check Period
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            value={formData.closeAllCheckPeriod}
                            onChange={(e) => setFormData({ ...formData, closeAllCheckPeriod: parseInt(e.target.value) })}
                            className="w-full pl-12 pr-16 py-3 text-foreground bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            min="1"
                            required
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                            days
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        Profit Threshold for Close All
                      </label>
                      <div className="relative">
                        <Percent className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          step="0.01"
                          value={formData.closeAllProfitThreshold}
                          onChange={(e) => setFormData({ ...formData, closeAllProfitThreshold: parseFloat(e.target.value) })}
                          className="w-full pl-12 pr-4 py-3 text-foreground bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Minimum Expected Profit
                        </label>
                        <div className="relative">
                          <Percent className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            step="0.01"
                            value={formData.minExpectedProfit}
                            onChange={(e) => setFormData({ ...formData, minExpectedProfit: parseFloat(e.target.value) })}
                            className="w-full pl-12 pr-4 py-3 text-foreground bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            min="0"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">Minimum expected profit percentage</p>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Minimum Volume
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            step="0.01"
                            value={formData.minVolume}
                            onChange={(e) => setFormData({ ...formData, minVolume: parseFloat(e.target.value) })}
                            className="w-full pl-12 pr-4 py-3 text-foreground bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            min="0"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">Minimum trading volume required</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                    >
                      <Save className="w-5 h-5" />
                      {editingId ? 'Update Configuration' : 'Create Configuration'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 flex items-center justify-center gap-3 bg-gray-500 text-white py-4 px-6 rounded-xl hover:bg-gray-600 transition-all duration-200 font-semibold"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Trading Settings Grid */}
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading configurations...</p>
            </div>
          ) : filteredSettings.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
              <div className="p-4 bg-gray-100 rounded-2xl w-fit mx-auto mb-6">
                <Settings className="w-12 h-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No configurations found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'No configurations match your search.' : 'Create your first trading configuration.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create Configuration
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSettings.map((settings) => (
                <div key={settings._id} className="group">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        {settings.isDefault && (
                          <div className="p-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl shadow-lg">
                            <Star className="w-5 h-5 text-white fill-current" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {settings.name}
                          </h3>
                          {settings.isDefault && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="relative group/menu">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        <div className="absolute right-0 top-12 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[160px] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-10">
                          <button
                            onClick={() => handleEdit(settings)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => duplicateSettings(settings)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                          {!settings.isDefault && (
                            <button
                              onClick={() => handleDelete(settings._id)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Period</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{formatDuration(settings.periodDuration)}</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Positions</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{settings.positionsPerPeriod}</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Balance</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{settings.reservedPeriodsBalance.toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Check</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">{settings.closeAllCheckPeriod}d</p>
                      </div>
                    </div>

                    {/* Profit Threshold */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-semibold text-emerald-600">Profit Threshold</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          %{settings.closeAllProfitThreshold.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(settings)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2.5 px-4 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 text-sm font-semibold shadow-lg"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      {!settings.isDefault && (
                        <button
                          onClick={() => handleDelete(settings._id)}
                          className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-semibold shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Created Date */}
                    <div className="mt-4 pt-4 border-t border-gray-200/50">
                      <p className="text-xs text-gray-500">
                        Created {new Date(settings.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
