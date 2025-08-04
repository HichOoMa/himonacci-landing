import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Settings,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  RefreshCw,
  DollarSign,
  Activity,
  Target,
  BarChart3,
  Wallet,
  Shield,
  Key,
  Zap,
  Clock,
  CreditCard,
  Check,
  X,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import NavigationDashboard from "@/components/NavigationDashboard";
import PaymentModal from "@/components/PaymentModal";

interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

interface TradingStats {
  totalTrades: number;
  activeTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnl: string;
  winRate: string;
}

interface AccountStats {
  user: {
    id: string;
    email: string;
    isAutoTradingEnabled: boolean;
    isAutoTradingAllowed: boolean;
    hasApiKeys: boolean;
    subscriptionStatus: string;
  };
  binanceAccount: {
    accountType: string;
    canTrade: boolean;
    canWithdraw: boolean;
    canDeposit: boolean;
    balances: BinanceBalance[];
  } | null;
  binanceError: string | null;
  trading: TradingStats;
}

interface SubscriptionData {
  hasSubscription: boolean;
  subscription: {
    status: string;
    plan: string;
    monthlyPrice: number;
    startDate: string;
    endDate: string;
    paymentHistory: Array<{
      transactionHash: string;
    }>;
  };
  statusCheck: {
    daysRemaining: number;
    gracePeriodRemaining: number;
  };
}

export default function ProfileDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AccountStats | null>(null);
  const [totalUsdt, setTotalUsdt] = useState<string>("-");
  const [loading, setLoading] = useState(true);
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [savingKeys, setSavingKeys] = useState(false);
  const [autoTradingEnabled, setAutoTradingEnabled] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  
  // Subscription management state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [trialTimeRemaining, setTrialTimeRemaining] = useState({
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    console.log("User data:", user);
    // if (!user) {
    //   router.push('/login')
    //   return
    // }
    fetchAccountStats();
    if (user) {
      fetchSubscriptionData();
    }
  }, [user, router]);

  useEffect(() => {
    calculateTotalUSDTValue(stats?.binanceAccount?.balances).then((total) =>
      setTotalUsdt(total || "-")
    );
  }, [stats]);

  // Trial countdown effect
  useEffect(() => {
    if (user?.subscriptionStatus === "trial" && user?.freeTrialEndDate) {
      const interval = setInterval(() => {
        const now = new Date();
        const endTime = new Date(user.freeTrialEndDate!);
        const timeLeft = endTime.getTime() - now.getTime();

        if (timeLeft > 0) {
          const minutes = Math.floor(timeLeft / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          setTrialTimeRemaining({ minutes, seconds });
        } else {
          setTrialTimeRemaining({ minutes: 0, seconds: 0 });
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/subscription/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error);
    }
  };

  const fetchAccountStats = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/profile/account-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setAutoTradingEnabled(data.user.isAutoTradingEnabled);
      }
    } catch (error) {
      console.error("Failed to fetch account stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Subscription management functions
  const cancelSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Subscription cancelled successfully");
        fetchSubscriptionData(); // Refresh subscription data
      } else {
        toast.error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Error cancelling subscription");
    }
  };

  // Get current subscription data (use real data if available, fallback to legacy)
  const currentSubscriptionData = subscriptionData?.hasSubscription
    ? {
        status: subscriptionData.subscription.status,
        plan: subscriptionData.subscription.plan || "Premium",
        monthlyPrice: subscriptionData.subscription.monthlyPrice || 100,
        features: [
          "Advanced Trading Algorithms",
          "24/7 Automated Trading",
          "Real-time Market Analysis",
          "Risk Management Tools",
          "Priority Support",
        ],
        startDate: subscriptionData.subscription.startDate,
        endDate: subscriptionData.subscription.endDate,
        transactionHash: subscriptionData.subscription.paymentHistory?.[0]?.transactionHash,
        daysRemaining: subscriptionData.statusCheck?.daysRemaining || 0,
        isInGracePeriod: subscriptionData.statusCheck?.gracePeriodRemaining > 0,
        gracePeriodRemaining: subscriptionData.statusCheck?.gracePeriodRemaining || 0,
      }
    : {
        status: user?.subscriptionStatus || "inactive",
        plan: user?.subscriptionStatus === "trial" ? "Free Trial" : "Premium",
        monthlyPrice: user?.subscriptionStatus === "trial" ? 0 : 100,
        features: [
          "Advanced Trading Algorithms",
          "24/7 Automated Trading",
          "Real-time Market Analysis",
          "Risk Management Tools",
          "Priority Support",
        ],
        startDate: user?.subscriptionStartDate || user?.freeTrialStartDate,
        endDate: user?.subscriptionEndDate || user?.freeTrialEndDate,
        transactionHash: user?.paymentTransactionHash,
        daysRemaining: 0,
        isInGracePeriod: false,
        gracePeriodRemaining: 0,
      };

  async function calculateTotalUSDTValue(
    balances: { asset: string; free: string; locked: string }[] = []
  ): Promise<string> {
    if (!balances?.length) return "0.00";

    const nonZero = balances.filter(
      (b) => parseFloat(b.free) + parseFloat(b.locked) > 0
    );

    const symbols = nonZero
      .map((b) => b.asset)
      .filter((a) => a !== "USDT")
      .map((a) => `${a}USDT`);

    let priceMap: Record<string, number> = {};
    if (symbols.length) {
      const url =
        "https://api.binance.com/api/v3/ticker/price?symbols=" +
        encodeURIComponent(JSON.stringify(symbols));

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Binance price request failed: ${res.statusText}`);
      }

      const data: { symbol: string; price: string }[] = await res.json();
      priceMap = Object.fromEntries(
        data.map((d) => [d.symbol.replace("USDT", ""), Number(d.price)])
      );
    }

    let totalUSDT = 0;
    for (const b of nonZero) {
      const qty = parseFloat(b.free) + parseFloat(b.locked);

      if (b.asset === "USDT") {
        totalUSDT += qty;
      } else {
        const px = priceMap[b.asset];
        if (px) totalUSDT += qty * px;
        // For assets without a direct USDT pair you could:
        //   – fall back to BUSD/BTC pairs,
        //   – or ignore them,
        //   – or log a warning.  Pick what fits your use‑case.
      }
    }

    console.log(totalUSDT);
    return totalUSDT.toFixed(2);
  }

  const handleSaveApiKeys = async () => {
    if (!apiKey || !apiSecret) {
      toast.error("Please enter both API key and secret");
      return;
    }

    setSavingKeys(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/profile/binance-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          apiKey,
          apiSecret,
        }),
      });

      if (response.ok) {
        setShowApiKeyForm(false);
        setApiKey("");
        setApiSecret("");
        fetchAccountStats();
        toast.success("API keys saved successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save API keys");
      }
    } catch (error) {
      toast.error("Failed to save API keys");
    } finally {
      setSavingKeys(false);
    }
  };

  const handleToggleAutoTrading = async () => {
    if (!stats?.user.hasApiKeys) {
      toast.error("Please configure your Binance API keys first");
      return;
    }

    if (!stats?.user?.isAutoTradingAllowed) {
      toast.error("Auto trading has been disabled by an administrator. Please contact support.");
      return;
    }

    // If trying to disable auto trading, show warning that it's not allowed
    if (autoTradingEnabled) {
      toast.error("Auto trading cannot be disabled once enabled. Please contact support if needed.");
      return;
    }

    // If enabling auto trading, proceed directly
    await toggleAutoTrading();
  };

  const toggleAutoTrading = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/profile/toggle-auto-trading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enabled: !autoTradingEnabled,
        }),
      });

      if (response.ok) {
        setAutoTradingEnabled(!autoTradingEnabled);
        fetchAccountStats();
        toast.success(
          `Auto trading ${
            !autoTradingEnabled ? "enabled" : "disabled"
          } successfully`
        );
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to toggle auto trading");
      }
    } catch (error) {
      toast.error("Failed to toggle auto trading");
    } finally {
      setShowDisableModal(false);
    }
  };

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
            <p className="text-gray-300 text-lg">Loading your profile...</p>
          </motion.div>
        </div>
      </div>
    );
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
                <Shield className="w-8 h-8 text-accent-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Premium Feature
              </h1>
              <p className="text-gray-300 text-lg mb-6">
                The Profile Dashboard is available for premium subscribers only.
              </p>
              <p className="text-gray-400 mb-8">
                Upgrade to premium to access advanced account management, API configuration, 
                and detailed trading analytics.
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
              Profile Dashboard
            </motion.h1>
            <motion.p
              className="text-lg text-gray-300 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Manage your trading account and monitor performance
            </motion.p>
            <motion.button
              onClick={fetchAccountStats}
              disabled={refreshing}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 disabled:opacity-50 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <RefreshCw
                className={`w-5 h-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </motion.button>
          </div>

          {/* Subscription Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {currentSubscriptionData.plan} Plan
                  </h3>
                  <p className="text-sm text-gray-400">
                    {currentSubscriptionData.status === "inactive" &&
                      "Subscription required to access trading features"}
                    {currentSubscriptionData.status === "active" &&
                      "Active subscription"}
                    {currentSubscriptionData.status === "trial" &&
                      "Free trial active"}
                    {currentSubscriptionData.status === "expired" &&
                      "Subscription expired"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-secondary-500">
                    ${currentSubscriptionData.monthlyPrice}
                  </p>
                  <p className="text-sm text-gray-400">per month</p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="btn-primary px-6 py-2 rounded-lg text-white font-semibold"
                >
                  {currentSubscriptionData.status === "inactive"
                    ? "Subscribe Now"
                    : currentSubscriptionData.status === "trial"
                    ? "Upgrade to Premium"
                    : "Renew"}
                </button>
              </div>
            </div>

            {/* Active Subscription Details */}
            {currentSubscriptionData.status === "active" &&
              currentSubscriptionData.endDate && (
                <div className="bg-success-500/20 border border-success-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-success-400 flex-shrink-0" />
                    <div>
                      <p className="text-success-400 font-semibold">
                        Active Subscription
                      </p>
                      <p className="text-sm text-gray-300">
                        Valid until{" "}
                        {new Date(currentSubscriptionData.endDate).toLocaleDateString()}
                      </p>
                      {currentSubscriptionData.daysRemaining !== undefined && (
                        <p className="text-sm text-gray-300">
                          {currentSubscriptionData.daysRemaining > 0
                            ? `${currentSubscriptionData.daysRemaining} days remaining`
                            : "Expires today"}
                        </p>
                      )}
                      {currentSubscriptionData.transactionHash && (
                        <p className="text-xs text-gray-400 mt-1">
                          Transaction:{" "}
                          {currentSubscriptionData.transactionHash.substring(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Grace Period Warning */}
            {currentSubscriptionData.status === "expired" &&
              currentSubscriptionData.isInGracePeriod && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-400 font-semibold">
                        Grace Period Active
                      </p>
                      <p className="text-sm text-gray-300">
                        {currentSubscriptionData.gracePeriodRemaining} days remaining to renew
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Renew now to avoid service interruption
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Trial Period Banner */}
            {user?.subscriptionStatus === "trial" && (
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="text-blue-400 font-semibold">
                      Trial Period Active
                    </p>
                    <p className="text-sm text-gray-300">
                      {trialTimeRemaining.minutes > 0
                        ? `Ends in ${trialTimeRemaining.minutes}m ${trialTimeRemaining.seconds}s`
                        : "Expires soon"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Management */}
            {currentSubscriptionData.status === "active" && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={cancelSubscription}
                  className="text-red-400 hover:text-red-300 text-sm underline"
                >
                  Cancel Subscription
                </button>
              </div>
            )}

            {/* Subscription Required Warning */}
            {currentSubscriptionData.status === "inactive" &&
              !user?.hasUsedFreeTrial && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-red-400 font-semibold">
                        Subscription Required
                      </p>
                      <p className="text-sm text-gray-300">
                        Subscribe to access all premium trading features and
                        start earning consistent profits.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Trial Used Warning */}
            {currentSubscriptionData.status === "inactive" &&
              user?.hasUsedFreeTrial && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-400 font-semibold">
                        Free Trial Expired
                      </p>
                      <p className="text-sm text-gray-300">
                        Your free trial has ended. Subscribe now to continue
                        accessing premium trading features and maximize your
                        profits.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Expired Subscription Warning */}
            {currentSubscriptionData.status === "expired" && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-400 font-semibold">
                      Subscription Expired
                    </p>
                    <p className="text-sm text-gray-300">
                      Your subscription has expired. Renew now to continue
                      accessing premium features.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Account Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              className="bg-primary-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-primary-800/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{
                y: -5,
                shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Subscription Status
                  </p>
                  <p className="text-2xl font-bold text-white capitalize mb-2">
                    {stats?.user.subscriptionStatus}
                  </p>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      stats?.user.subscriptionStatus === "active"
                        ? "bg-success-500/20 text-success-400"
                        : "bg-accent-500/20 text-accent-400"
                    }`}
                  >
                    {stats?.user.subscriptionStatus === "active"
                      ? "Premium Member"
                      : "Free Account"}
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stats?.user.subscriptionStatus === "active"
                      ? "bg-success-500/20"
                      : "bg-accent-500/20"
                  }`}
                >
                  {stats?.user.subscriptionStatus === "active" ? (
                    <CheckCircle className="w-6 h-6 text-success-400" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-accent-400" />
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-primary-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-primary-800/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{
                y: -5,
                shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Binance API Keys
                  </p>
                  <p className="text-2xl font-bold text-white mb-2">
                    {stats?.user.hasApiKeys ? "Configured" : "Not Set"}
                  </p>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      stats?.user.hasApiKeys
                        ? "bg-success-500/20 text-success-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {stats?.user.hasApiKeys
                      ? "Ready to Trade"
                      : "Setup Required"}
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stats?.user.hasApiKeys
                      ? "bg-success-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  {stats?.user.hasApiKeys ? (
                    <Key className="w-6 h-6 text-success-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-primary-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-primary-800/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{
                y: -5,
                shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Auto Trading
                  </p>
                  <p className="text-2xl font-bold text-white mb-2">
                    {autoTradingEnabled ? "Active" : "Disabled"}
                  </p>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      autoTradingEnabled
                        ? "bg-success-500/20 text-success-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {autoTradingEnabled ? "Trading Live" : "Paused"}
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    autoTradingEnabled ? "bg-success-500/20" : "bg-gray-500/20"
                  }`}
                >
                  {autoTradingEnabled ? (
                    <Play className="w-6 h-6 text-success-400" />
                  ) : (
                    <Pause className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Binance Setup */}
          <AnimatePresence>
            {!stats?.user.hasApiKeys && (
              <motion.div
                className="bg-primary-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary-800/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.8 }}
              >
                <div className="px-6 py-4 border-b border-primary-800/50 bg-gradient-to-r from-secondary-500/10 to-secondary-600/10 rounded-t-2xl">
                  <div className="flex items-center">
                    <Shield className="w-6 h-6 text-secondary-400 mr-3" />
                    <h3 className="text-lg font-semibold text-white">
                      Binance API Setup
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-white mb-4 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-secondary-400" />
                      Steps to Create Binance API Keys:
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          step: 1,
                          text: "Go to Binance API Management",
                          link: "https://www.binance.com/en/my/settings/api-management",
                        },
                        {
                          step: 2,
                          text: 'Click "Create API" and choose "System Generated"',
                        },
                        {
                          step: 3,
                          text: 'Enter a label (e.g., "Himonacci Trading")',
                        },
                        {
                          step: 4,
                          text: 'Enable "Enable Spot & Margin Trading" permission',
                        },
                        {
                          step: 5,
                          text: "Add our IP address to the whitelist",
                          ip: process.env.NEXT_PUBLIC_SERVER_IP || "52.15.156.23",
                        },
                        { step: 6, text: "Complete the verification process" },
                        { step: 7, text: "Copy your API Key and Secret Key" },
                        {
                          step: 8,
                          text: 'Paste them below and click "Save API Keys"',
                        },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start space-x-3 p-3 bg-primary-800/30 rounded-lg border border-primary-700/50"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                        >
                          <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {item.step}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-300">{item.text}</p>
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-secondary-400 hover:text-secondary-300 text-sm mt-1 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Open Binance API Management
                              </a>
                            )}
                            {item.ip && (
                              <div className="flex items-center mt-2">
                                <code className="bg-primary-800/50 px-3 py-1 rounded text-sm font-mono text-secondary-400 border border-primary-700/50">
                                  {item.ip}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(item.ip)}
                                  className="ml-2 p-1 text-gray-400 hover:text-secondary-400 transition-colors"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                {copiedKey && (
                                  <span className="ml-2 text-success-400 text-sm">
                                    Copied!
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-primary-800/50 pt-6">
                    <motion.button
                      onClick={() => setShowApiKeyForm(!showApiKeyForm)}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Key className="w-5 h-5 mr-2" />
                      {showApiKeyForm ? "Cancel Setup" : "Configure API Keys"}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {showApiKeyForm && (
                      <motion.div
                        className="mt-6 border-t border-primary-800/50 pt-6"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              API Key
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your Binance API Key"
                                className="w-full px-4 py-3 bg-primary-800/50 border border-primary-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                              />
                              <Key className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              API Secret
                            </label>
                            <div className="relative">
                              <input
                                type={showApiSecret ? "text" : "password"}
                                value={apiSecret}
                                onChange={(e) => setApiSecret(e.target.value)}
                                placeholder="Enter your Binance API Secret"
                                className="w-full px-4 py-3 bg-primary-800/50 border border-primary-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-white placeholder-gray-400 pr-12 transition-all duration-200"
                              />
                              <button
                                type="button"
                                onClick={() => setShowApiSecret(!showApiSecret)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 transition-colors"
                              >
                                {showApiSecret ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <motion.button
                              onClick={handleSaveApiKeys}
                              disabled={savingKeys}
                              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 disabled:opacity-50 transition-all duration-200"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {savingKeys ? (
                                <>
                                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-5 h-5 mr-2" />
                                  Save API Keys
                                </>
                              )}
                            </motion.button>
                            <motion.button
                              onClick={() => setShowApiKeyForm(false)}
                              className="px-6 py-3 border border-primary-700/50 text-base font-medium rounded-xl text-gray-300 bg-primary-800/50 hover:bg-primary-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auto Trading Control */}
          <AnimatePresence>
            {stats?.user.hasApiKeys && (
              <motion.div
                className="bg-primary-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary-800/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 1.0 }}
              >
                <div className="px-6 py-4 border-b border-primary-800/50 bg-gradient-to-r from-accent-500/10 to-accent-600/10 rounded-t-2xl">
                  <div className="flex items-center">
                    <Zap className="w-6 h-6 text-accent-400 mr-3" />
                    <h3 className="text-lg font-semibold text-white">
                      Auto Trading Control
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Activity className="w-5 h-5 text-accent-400 mr-2" />
                        <h4 className="text-md font-semibold text-white">
                          Automated Trading System
                        </h4>
                        {!stats?.user?.isAutoTradingAllowed && (
                          <span className="ml-3 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                            FORBIDDEN
                          </span>
                        )}
                        {autoTradingEnabled && (
                          <span className="ml-3 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 mb-2">
                        Enable automatic trading based on our signals. We handle
                        all trading decisions, risk management, and position
                        sizing.
                      </p>
                      {!stats?.user?.isAutoTradingAllowed ? (
                        <p className="text-xs text-red-400 bg-red-900/30 p-2 rounded">
                          ⚠️ Auto trading has been disabled by an administrator. Please contact support if you need assistance.
                        </p>
                      ) : autoTradingEnabled ? (
                        <p className="text-xs text-yellow-400 bg-yellow-900/30 p-2 rounded">
                          🔒 Auto trading cannot be disabled once enabled. Contact support if needed.
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">
                          Our system will automatically enter and exit positions
                          based on our proprietary trading algorithms.
                        </p>
                      )}
                    </div>
                    <motion.button
                      onClick={handleToggleAutoTrading}
                      disabled={!stats?.user?.isAutoTradingAllowed || autoTradingEnabled}
                      className={`ml-6 px-8 py-4 rounded-2xl font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                        !stats?.user?.isAutoTradingAllowed
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : autoTradingEnabled
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 focus:ring-success-500"
                      }`}
                      whileHover={!stats?.user?.isAutoTradingAllowed || autoTradingEnabled ? {} : { scale: 1.05 }}
                      whileTap={!stats?.user?.isAutoTradingAllowed || autoTradingEnabled ? {} : { scale: 0.95 }}
                    >
                      {!stats?.user?.isAutoTradingAllowed ? (
                        <>
                          <XCircle className="w-6 h-6 mr-2 inline" />
                          Forbidden
                        </>
                      ) : autoTradingEnabled ? (
                        <>
                          <CheckCircle className="w-6 h-6 mr-2 inline" />
                          Active
                        </>
                      ) : (
                        <>
                          <Play className="w-6 h-6 mr-2 inline" />
                          Enable Auto Trading
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Binance Account Info */}
          <AnimatePresence>
            {stats?.binanceAccount && (
              <motion.div
                className="bg-primary-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary-800/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.9 }}
              >
                <div className="px-6 py-4 border-b border-primary-800/50 bg-gradient-to-r from-success-500/10 to-success-600/10 rounded-t-2xl">
                  <div className="flex items-center">
                    <Wallet className="w-6 h-6 text-success-400 mr-3" />
                    <h3 className="text-lg font-semibold text-white">
                      Binance Account
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      {
                        label: "Account Type",
                        value: stats.binanceAccount.accountType,
                        icon: Activity,
                      },
                      {
                        label: "Total Value (USDT)",
                        value: `$${totalUsdt}`,
                        icon: DollarSign,
                        color: "text-success-400",
                      },
                      {
                        label: "Can Trade",
                        value: stats.binanceAccount.canTrade ? "Yes" : "No",
                        icon: Target,
                        color: stats.binanceAccount.canTrade
                          ? "text-success-400"
                          : "text-red-400",
                      },
                      {
                        label: "Can Deposit",
                        value: stats.binanceAccount.canDeposit ? "Yes" : "No",
                        icon: Wallet,
                        color: stats.binanceAccount.canDeposit
                          ? "text-success-400"
                          : "text-red-400",
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="text-center p-4 bg-primary-800/30 rounded-xl border border-primary-700/50"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                      >
                        <item.icon
                          className={`w-6 h-6 mx-auto mb-2 ${
                            item.color || "text-gray-400"
                          }`}
                        />
                        <p className="text-sm text-gray-400 mb-1">
                          {item.label}
                        </p>
                        <p
                          className={`text-lg font-semibold ${
                            item.color || "text-white"
                          }`}
                        >
                          {item.value}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-white mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-success-400" />
                      Account Balances
                    </h4>
                    <div className="bg-primary-800/30 rounded-xl overflow-hidden border border-primary-700/50">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-primary-700/50">
                          <thead className="bg-primary-800/50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Asset
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Free
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Locked
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-primary-900/30 divide-y divide-primary-700/50">
                            {stats.binanceAccount.balances.map(
                              (balance, index) => (
                                <motion.tr
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 1.2 + index * 0.05 }}
                                  className="hover:bg-primary-800/20 transition-colors"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-sm font-medium text-white">
                                          {balance.asset.charAt(0)}
                                        </span>
                                      </div>
                                      <span className="text-sm font-medium text-white">
                                        {balance.asset}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                    {parseFloat(balance.free).toFixed(8)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                    {parseFloat(balance.locked).toFixed(8)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    {(
                                      parseFloat(balance.free) +
                                      parseFloat(balance.locked)
                                    ).toFixed(8)}
                                  </td>
                                </motion.tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Binance Error */}
          <AnimatePresence>
            {stats?.binanceError && (
              <motion.div
                className="bg-red-900/20 border border-red-700/50 rounded-2xl p-4 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-300">
                      Binance Connection Error
                    </h3>
                    <p className="mt-1 text-sm text-red-400">
                      {stats.binanceError}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disable Auto Trading Confirmation Modal */}
          <AnimatePresence>
            {showDisableModal && (
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-primary-900 rounded-2xl shadow-2xl border border-primary-800 max-w-md w-full p-6"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mr-4">
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Disable Auto Trading
                    </h3>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <p className="text-red-400 font-medium mb-2">
                        ⚠️ Important Warning
                      </p>
                      <p className="text-sm text-red-300">
                        By disabling auto trading, you are taking full
                        responsibility for all trading decisions. Our system
                        will no longer automatically manage your positions.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-300">
                          You will need to manually monitor and close any open
                          positions
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-300">
                          Risk management and stop losses will no longer be
                          automated
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-300">
                          You may miss profitable trading opportunities
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-300">
                          Our team will not be responsible for any losses
                          incurred
                        </p>
                      </div>
                    </div>

                    <div className="bg-accent-500/10 border border-accent-500/20 rounded-lg p-4">
                      <p className="text-accent-400 font-medium mb-2">
                        💡 Recommendation
                      </p>
                      <p className="text-sm text-accent-300">
                        We recommend keeping auto trading enabled to benefit
                        from our proven strategies and professional risk
                        management.
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <motion.button
                      onClick={() => setShowDisableModal(false)}
                      className="flex-1 px-4 py-2 border border-primary-700 text-gray-300 rounded-lg hover:bg-primary-800 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={toggleAutoTrading}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Yes, Disable Auto Trading
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        currentSubscriptionData={currentSubscriptionData}
        onPaymentVerified={fetchSubscriptionData}
      />

      <Footer />
    </div>
  );
}
