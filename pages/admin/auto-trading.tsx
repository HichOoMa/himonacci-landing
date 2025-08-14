import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import NavigationAdmin from "@/components/NavigationAdmin";

interface AutoTradingUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAutoTradingEnabled: boolean;
  isAutoTradingAllowed: boolean;
  subscriptionStatus: string;
  hasApiKeys: boolean;
  createdAt: string;
}

interface BinanceAccountData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    hasApiKeys: boolean;
    startBalance: number;
    targetBalance: number;
    primary: number;
    secondary: number;
    periodEndTime: string;
  };
  binanceAccount?: {
    accountType: string;
    canTrade: boolean;
    canDeposit: boolean;
    canWithdraw: boolean;
    updateTime: number;
    usdtBalance: {
      free: string;
      locked: string;
      total: string;
    };
    balances: Array<{
      asset: string;
      free: string;
      locked: string;
      totalBalance: string;
      usdtValue: string;
    }>;
    totalWalletBalanceUSDT: string;
  };
  binanceError?: string;
}

export default function AdminAutoTradingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AutoTradingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "enabled" | "forbidden">("all");
  const [showBinanceModal, setShowBinanceModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [binanceData, setBinanceData] = useState<BinanceAccountData | null>(
    null
  );
  const [loadingBinance, setLoadingBinance] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [loadingCloseAll, setLoadingCloseAll] = useState<string | boolean>(false);
  const [closeAllResults, setCloseAllResults] = useState<any>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAutoTradingUsers();
    }
  }, [user, filter]);

  // Countdown timer effect
  useEffect(() => {
    if (binanceData?.user?.periodEndTime) {
      const remainingSeconds = Math.floor(
        new Date(binanceData.user.periodEndTime).getTime() / 1000 -
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
  }, [binanceData?.user?.periodEndTime]);

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

  const fetchAutoTradingUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/admin/auto-trading-users?filter=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setMessage("Error fetching users");
      }
    } catch (error) {
      console.error("Error fetching auto trading users:", error);
      setMessage("Error fetching users");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoTradingPermission = async (
    userId: string,
    currentlyAllowed: boolean
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          updates: { isAutoTradingAllowed: !currentlyAllowed },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(
          `Auto trading ${
            !currentlyAllowed ? "allowed" : "forbidden"
          } for user successfully`
        );
        fetchAutoTradingUsers();
      } else {
        setMessage(data.message || "Error updating user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage("Error updating user");
    }
  };

  const bulkTogglePermission = async (allow: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/bulk-auto-trading", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ allow, userIds: users.map((u) => u._id) }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(
          `Auto trading ${allow ? "allowed" : "forbidden"} for all users`
        );
        fetchAutoTradingUsers();
      } else {
        setMessage(data.message || "Error updating users");
      }
    } catch (error) {
      console.error("Error bulk updating users:", error);
      setMessage("Error updating users");
    }
  };

  const closeAllPositions = async (userId?: string) => {
    // Confirmation dialog
    const isConfirmed = window.confirm(
      userId 
        ? 'Are you sure you want to close ALL positions for this user? This action cannot be undone.'
        : 'Are you sure you want to close ALL positions for ALL users with active auto-trading? This action cannot be undone.'
    );
    
    if (!isConfirmed) {
      return;
    }

    try {
      setLoadingCloseAll(userId || true);
      const token = localStorage.getItem("token");
      
      const requestBody = userId 
        ? { userId } 
        : { userIds: users.filter(u => u.hasApiKeys && u.isAutoTradingEnabled).map(u => u._id) };
      
      const response = await fetch("/api/admin/close-all-positions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      setCloseAllResults(data);

      if (response.ok || response.status === 207) {
        setMessage(data.message);
      } else {
        setMessage(data.message || "Error closing positions");
      }
    } catch (error) {
      console.error("Error closing positions:", error);
      setMessage("Error closing positions");
      setCloseAllResults(null);
    } finally {
      setLoadingCloseAll(false);
    }
  };

  const fetchBinanceAccountData = async (userId: string) => {
    try {
      setLoadingBinance(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/admin/user-binance-account?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBinanceData(data);
      } else {
        const errorData = await response.json();
        setBinanceData({
          user: {
            id: userId,
            firstName: "",
            lastName: "",
            email: "",
            hasApiKeys: false,
            startBalance: 0,
            targetBalance: 0,
            primary: 0,
            secondary: 0,
            periodEndTime: "",
          },
          binanceError: errorData.message || "Error fetching Binance data",
        });
      }
    } catch (error) {
      console.error("Error fetching Binance account data:", error);
      setBinanceData({
        user: {
          id: userId,
          firstName: "",
          lastName: "",
          email: "",
          hasApiKeys: false,
          startBalance: 0,
          targetBalance: 0,
          primary: 0,
          secondary: 0,
          periodEndTime: "",
        },
        binanceError: "Error fetching Binance data",
      });
    } finally {
      setLoadingBinance(false);
    }
  };

  const openBinanceModal = (userId: string) => {
    setSelectedUserId(userId);
    setShowBinanceModal(true);
    fetchBinanceAccountData(userId);
  };

  const closeBinanceModal = () => {
    setShowBinanceModal(false);
    setSelectedUserId(null);
    setBinanceData(null);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <NavigationAdmin />
        <div className="flex justify-center items-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="text-slate-300 text-sm">
              Loading auto trading data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavigationAdmin />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h1 className="text-3xl font-bold text-white mb-2">
              Auto Trading Management
            </h1>
            <p className="text-slate-400">
              Control and monitor automated trading permissions
            </p>

            {message && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">{message}</p>
              </div>
            )}

            {/* Filters and Bulk Actions */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Users
                </button>
                <button
                  onClick={() => setFilter("enabled")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "enabled"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Auto Trading Enabled
                </button>
                <button
                  onClick={() => setFilter("forbidden")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === "forbidden"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Forbidden Users
                </button>
              </div>

              <div className="flex gap-2 flex-wrap">
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
                <button
                  onClick={() => closeAllPositions()}
                  disabled={loadingCloseAll === true}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  title={`Close all positions for ${users.filter(u => u.hasApiKeys && u.isAutoTradingEnabled).length} users with active auto-trading`}
                >
                  {loadingCloseAll === true ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Closing...
                    </>
                  ) : (
                    `Close All Positions (${users.filter(u => u.hasApiKeys && u.isAutoTradingEnabled).length})`
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Auto Trading Enabled</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter((u) => u.isAutoTradingEnabled).length}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Forbidden</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter((u) => !u.isAutoTradingAllowed).length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">With API Keys</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter((u) => u.hasApiKeys).length}
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
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.subscriptionStatus === "active"
                            ? "bg-green-100 text-green-800"
                            : user.subscriptionStatus === "trial"
                            ? "bg-blue-100 text-blue-800"
                            : user.subscriptionStatus === "expired"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isAutoTradingEnabled
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.isAutoTradingEnabled ? "Enabled" : "Disabled"}
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isAutoTradingAllowed
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isAutoTradingAllowed ? "Allowed" : "Forbidden"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.hasApiKeys
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.hasApiKeys ? "Configured" : "Not Set"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            toggleAutoTradingPermission(
                              user._id,
                              user.isAutoTradingAllowed
                            )
                          }
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            user.isAutoTradingAllowed
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {user.isAutoTradingAllowed ? "Forbid" : "Allow"}
                        </button>
                        {user.hasApiKeys && (
                          <>
                            <button
                              onClick={() => openBinanceModal(user._id)}
                              className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              View Account
                            </button>
                            {user.isAutoTradingEnabled && (
                              <button
                                onClick={() => closeAllPositions(user._id)}
                                disabled={loadingCloseAll === user._id}
                                className="px-3 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loadingCloseAll === user._id ? 'Closing...' : 'Close All'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
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

        {/* Binance Account Modal */}
        {showBinanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Binance Account Details
                  {binanceData?.user &&
                    ` - ${binanceData.user.firstName} ${binanceData.user.lastName}`}
                </h2>
                <button
                  onClick={closeBinanceModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {loadingBinance ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">
                      Loading Binance account data...
                    </span>
                  </div>
                ) : binanceData?.binanceError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <svg
                        className="w-5 h-5 text-red-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error Loading Account Data
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                          {binanceData.binanceError}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : binanceData?.binanceAccount ? (
                  <div className="space-y-6">
                    {/* Account Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">USDT Available</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${binanceData.binanceAccount.usdtBalance.free}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                          Total Wallet (USDT)
                        </p>
                        <p className="text-2xl font-bold text-purple-600">
                          ${binanceData.binanceAccount.totalWalletBalanceUSDT}
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Start Balance</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          ${binanceData.user.startBalance || "0.00"}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Target Balance</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${binanceData.user.targetBalance || "0.00"}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Primary Count</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {binanceData.user.primary}
                        </p>
                      </div>
                      <div className="bg-teal-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Secondary Count</p>
                        <p className="text-2xl font-bold text-teal-600">
                          {binanceData.user.secondary}
                        </p>
                      </div>
                    </div>
                    {/* Period Countdown */}
                    {binanceData.user.periodEndTime && (
                      <div className="bg-indigo-50 p-4 rounded-lg">
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
                                binanceData.user.periodEndTime
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              Time Remaining:
                            </p>
                            <p className="text-2xl font-bold text-indigo-600">
                              {formatTimeRemaining(
                                timeRemaining ||
                                  0
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Account Status */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Account Status
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">
                            Can Trade:
                          </span>
                          <span
                            className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              binanceData.binanceAccount.canTrade
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {binanceData.binanceAccount.canTrade ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">
                            Can Deposit:
                          </span>
                          <span
                            className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              binanceData.binanceAccount.canDeposit
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {binanceData.binanceAccount.canDeposit
                              ? "Yes"
                              : "No"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">
                            Can Withdraw:
                          </span>
                          <span
                            className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              binanceData.binanceAccount.canWithdraw
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {binanceData.binanceAccount.canWithdraw
                              ? "Yes"
                              : "No"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">
                            Account Type:
                          </span>
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {binanceData.binanceAccount.accountType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Top Balances */}
                    {binanceData.binanceAccount.balances.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Top Asset Balances
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Asset
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Free
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Locked
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Total
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  USDT Value
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {binanceData.binanceAccount.balances.map(
                                (balance, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                      {balance.asset}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                      {parseFloat(balance.free).toFixed(8)}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                      {parseFloat(balance.locked).toFixed(8)}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                      {balance.totalBalance}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                      ${balance.usdtValue}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No account data available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Close All Results Modal */}
        {closeAllResults && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Close All Positions Results
                </h2>
                <button
                  onClick={() => setCloseAllResults(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {/* Summary */}
                <div className="mb-6 grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {closeAllResults.summary?.total || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Successful</p>
                    <p className="text-2xl font-bold text-green-600">
                      {closeAllResults.summary?.successful || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {closeAllResults.summary?.failed || 0}
                    </p>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detailed Results
                  </h3>
                  <div className="max-h-60 overflow-y-auto">
                    {closeAllResults.results?.map((result: any, index: number) => {
                      const user = users.find(u => u._id === result.userId);
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${
                            result.success
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {user?.email || result.userId}
                              </p>
                            </div>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                result.success
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {result.success ? 'Success' : 'Failed'}
                            </span>
                          </div>
                          <p className={`mt-2 text-sm ${
                            result.success ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {result.message || result.error}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
