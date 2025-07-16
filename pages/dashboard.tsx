import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import TradingSignals from "@/components/TradingSignals";
import {
  TrendingUp,
  User,
  Settings,
  LogOut,
  BarChart3,
  DollarSign,
  CreditCard,
  Clock,
  Shield,
  Copy,
  Check,
  X,
} from "lucide-react";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  subscriptionStatus: "inactive" | "active" | "expired";
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  paymentTransactionHash?: string;
}

export default function Dashboard() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState("");
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentVerificationResult, setPaymentVerificationResult] = useState<{
    success: boolean;
    message: string;
    transaction?: any;
  } | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<
    "trc20" | "erc20" | "bep20"
  >("trc20");
  const [transactionId, setTransactionId] = useState("");
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  // Fetch subscription data
  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subscription/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    }
  };

  // Legacy subscription data based on user's actual subscription status (keeping for backward compatibility)
  const legacySubscriptionData = {
    status: user?.subscriptionStatus || "inactive",
    plan: "Premium",
    monthlyPrice: 100,
    features: [
      "Advanced Trading Algorithms",
      "24/7 Automated Trading",
      "Real-time Market Analysis",
      "Risk Management Tools",
      "Priority Support",
    ],
    startDate: user?.subscriptionStartDate,
    endDate: user?.subscriptionEndDate,
    transactionHash: user?.paymentTransactionHash,
    daysRemaining: 0,
    isInGracePeriod: false,
    gracePeriodRemaining: 0,
  };

  // Get current subscription data (use real data if available, fallback to legacy)
  const currentSubscriptionData = subscriptionData?.hasSubscription ? {
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
  } : legacySubscriptionData;

  // Cancel subscription function
  const cancelSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Subscription cancelled successfully');
        fetchSubscriptionData(); // Refresh subscription data
      } else {
        alert('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Error cancelling subscription');
    }
  };

  // USDT payment addresses for different networks
  const usdtAddresses = {
    trc20: process.env.NEXT_PUBLIC_USDT_TRC20_ADDRESS || "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
    erc20: process.env.NEXT_PUBLIC_USDT_ERC20_ADDRESS || "0x742d35Cc6634C0532925a3b8D4012A4F7fB5b32b",
    bep20: process.env.NEXT_PUBLIC_USDT_BEP20_ADDRESS || "0x742d35Cc6634C0532925a3b8D4012A4F7fB5b32b",
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(type);
    setTimeout(() => setCopiedAddress(""), 2000);
  };

  const verifyPayment = async () => {
    setVerifyingPayment(true);
    setPaymentVerificationResult(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          network: selectedNetwork,
          expectedAmount: currentSubscriptionData.monthlyPrice,
          transactionId: transactionId.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPaymentVerificationResult({
          success: true,
          message:
            "Payment verified successfully! Your subscription is now active.",
          transaction: result.transaction,
        });

        // Refresh user data to get updated subscription status
        if (token) {
          const userResponse = await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            // Refresh subscription data
            fetchSubscriptionData();
          }
        }

        // Close modal after 3 seconds
        setTimeout(() => {
          setShowPaymentModal(false);
        }, 3000);
      } else {
        setPaymentVerificationResult({
          success: false,
          message:
            result.message ||
            "Payment verification failed. Please try again or contact support.",
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setPaymentVerificationResult({
        success: false,
        message: "An error occurred during verification. Please try again.",
      });
    } finally {
      setVerifyingPayment(false);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    } else if (
      !loading &&
      isAuthenticated &&
      user &&
      user.subscriptionStatus === "inactive"
    ) {
      // Redirect unsubscribed users to landing page
      router.push("/");
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-pattern flex items-center justify-center">
        <div className="loading-dots text-secondary-500 text-xl">Loading</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!subscriptionData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-hero-pattern">
      {/* Enhanced Navigation */}
      <nav className="bg-primary-950/95 backdrop-blur-xl border-b border-secondary-500/20 shadow-2xl">
        {/* Animated gradient line */}
        <div className="h-0.5 bg-gradient-to-r from-secondary-500 via-accent-500 to-secondary-500" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Enhanced Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3 group"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 via-accent-500 to-secondary-400 rounded-xl flex items-center justify-center shadow-lg shadow-secondary-500/25 group-hover:shadow-secondary-500/40 transition-shadow duration-300">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/50 to-accent-500/50 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold gradient-text">HiMonacci</span>
                <span className="text-xs text-secondary-400 font-medium -mt-1">Trading Dashboard</span>
              </div>
            </motion.div>

            {/* Enhanced User Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-4 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-800/50 to-primary-700/50 border border-secondary-500/20 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-success-400 text-xs">
                      Premium Member
                    </div>
                  </div>
                </div>
                
                <div className="w-px h-8 bg-gray-600/50" />
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-red-500/10"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-gray-400">
              Here's what's happening with your trading account today.
            </p>
          </div>{" "}
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
                        {new Date(
                          currentSubscriptionData.endDate
                        ).toLocaleDateString()}
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
            {currentSubscriptionData.status === "inactive" && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div>
                    <p className="text-red-400 font-semibold">
                      Subscription Required
                    </p>
                    <p className="text-sm text-gray-300">
                      Subscribe to access all premium trading features and start
                      earning consistent profits.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Expired Subscription Warning */}
            {subscriptionData?.status === "expired" && (
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
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass rounded-2xl p-6 hover-lift"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-success-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-success-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Total Profit
                  </h3>
                  <p className="text-2xl font-bold text-success-500">
                    {subscriptionData.status === "inactive"
                      ? "+$0.00"
                      : "+$2,847.50"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {subscriptionData.status === "inactive"
                      ? "Subscribe to start earning"
                      : "+12.3% this month"}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass rounded-2xl p-6 hover-lift"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-secondary-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Active Trades
                  </h3>
                  <p className="text-2xl font-bold text-secondary-500">
                    {subscriptionData.status === "inactive" ? "0" : "7"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {subscriptionData.status === "inactive"
                      ? "Subscribe to start trading"
                      : "3 BTC, 2 ETH, 2 others"}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass rounded-2xl p-6 hover-lift"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-accent-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Win Rate</h3>
                  <p className="text-2xl font-bold text-accent-500">
                    {subscriptionData.status === "inactive" ? "--" : "84.6%"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {subscriptionData.status === "inactive"
                      ? "Available after subscription"
                      : "Last 30 days"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Trading Signals - Only for active subscribers */}
          {currentSubscriptionData.status === "active" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-8"
            >
              <TradingSignals token={localStorage.getItem('token') || ''} />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-gray-700/50 overflow-hidden flex flex-col"
          >
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-8 pb-4 flex-shrink-0">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  Subscribe to Premium
                </h3>
                <p className="text-gray-400">Unlock all trading features</p>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentVerificationResult(null);
                  setTransactionId("");
                }}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/30 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-8 pb-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Plan Details */}
                <div>
                  <div className="bg-gradient-to-br from-secondary-500/20 to-accent-500/20 rounded-2xl p-6 mb-6 border border-secondary-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-semibold text-white">
                        Premium Plan
                      </span>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-secondary-500">
                          ${subscriptionData.monthlyPrice}
                        </span>
                        <span className="text-gray-400 text-sm">/month</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentSubscriptionData.features.map((feature: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <div className="w-5 h-5 bg-success-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-success-500" />
                          </div>
                          <span className="text-sm text-gray-300">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="bg-primary-900/30 rounded-2xl p-6 border border-gray-700/50">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-accent-500" />
                      Quick Setup
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <span className="text-secondary-500 font-bold text-sm bg-secondary-500/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                          1
                        </span>
                        <span className="text-sm text-gray-300">
                          Choose your preferred USDT network
                        </span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-secondary-500 font-bold text-sm bg-secondary-500/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                          2
                        </span>
                        <span className="text-sm text-gray-300">
                          Send exactly $100 USDT to the address
                        </span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-secondary-500 font-bold text-sm bg-secondary-500/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                          3
                        </span>
                        <span className="text-sm text-gray-300">
                          Copy the transaction hash from your wallet
                        </span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-secondary-500 font-bold text-sm bg-secondary-500/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                          4
                        </span>
                        <span className="text-sm text-gray-300">
                          Paste transaction hash below and verify
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Warning
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-6">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-semibold text-sm">
                          Security Notice
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                          Only send USDT to these addresses. Verify the network
                          before sending to avoid permanent loss.
                        </p>
                      </div>
                    </div>
                  </div> */}
                </div>

                {/* Right Column - Payment Methods */}
                <div>
                  <h4 className="text-xl font-semibold text-white mb-4">
                    Pay with USDT
                  </h4>
                  <p className="text-sm text-gray-400 mb-6">
                    Send exactly{" "}
                    <span className="text-secondary-500 font-semibold text-base">
                      $100 USDT
                    </span>{" "}
                    to one of the addresses below:
                  </p>

                  <div className="space-y-4">
                    {/* TRC20 */}
                    <div
                      className={`bg-gradient-to-r from-success-500/10 to-success-500/5 rounded-xl p-4 border cursor-pointer transition-all duration-200 ${
                        selectedNetwork === "trc20"
                          ? "border-success-500/50 bg-success-500/20"
                          : "border-success-500/20 hover:border-success-500/30"
                      }`}
                      onClick={() => setSelectedNetwork("trc20")}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              selectedNetwork === "trc20"
                                ? "border-success-500 bg-success-500"
                                : "border-gray-500"
                            }`}
                          >
                            {selectedNetwork === "trc20" && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-white">
                            USDT TRC20
                          </span>
                        </div>
                        <span className="text-xs text-success-400 bg-success-500/20 px-2 py-1 rounded-full">
                          Recommended
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={usdtAddresses.trc20}
                          readOnly
                          className="flex-1 bg-primary-900/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-success-500"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(usdtAddresses.trc20, "trc20");
                          }}
                          className="p-2 bg-success-500/20 hover:bg-success-500/30 rounded-lg transition-colors"
                        >
                          {copiedAddress === "trc20" ? (
                            <Check className="w-4 h-4 text-success-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-success-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* ERC20 */}
                    <div
                      className={`bg-gradient-to-r from-accent-500/10 to-accent-500/5 rounded-xl p-4 border cursor-pointer transition-all duration-200 ${
                        selectedNetwork === "erc20"
                          ? "border-accent-500/50 bg-accent-500/20"
                          : "border-accent-500/20 hover:border-accent-500/30"
                      }`}
                      onClick={() => setSelectedNetwork("erc20")}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              selectedNetwork === "erc20"
                                ? "border-accent-500 bg-accent-500"
                                : "border-gray-500"
                            }`}
                          >
                            {selectedNetwork === "erc20" && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-white">
                            USDT ERC20
                          </span>
                        </div>
                        <span className="text-xs text-accent-400 bg-accent-500/20 px-2 py-1 rounded-full">
                          Higher fees
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={usdtAddresses.erc20}
                          readOnly
                          className="flex-1 bg-primary-900/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-accent-500"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(usdtAddresses.erc20, "erc20");
                          }}
                          className="p-2 bg-accent-500/20 hover:bg-accent-500/30 rounded-lg transition-colors"
                        >
                          {copiedAddress === "erc20" ? (
                            <Check className="w-4 h-4 text-success-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-accent-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* BEP20 */}
                    <div
                      className={`bg-gradient-to-r from-secondary-500/10 to-secondary-500/5 rounded-xl p-4 border cursor-pointer transition-all duration-200 ${
                        selectedNetwork === "bep20"
                          ? "border-secondary-500/50 bg-secondary-500/20"
                          : "border-secondary-500/20 hover:border-secondary-500/30"
                      }`}
                      onClick={() => setSelectedNetwork("bep20")}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              selectedNetwork === "bep20"
                                ? "border-secondary-500 bg-secondary-500"
                                : "border-gray-500"
                            }`}
                          >
                            {selectedNetwork === "bep20" && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-white">
                            USDT BEP20
                          </span>
                        </div>
                        <span className="text-xs text-secondary-400 bg-secondary-500/20 px-2 py-1 rounded-full">
                          Low fees
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={usdtAddresses.bep20}
                          readOnly
                          className="flex-1 bg-primary-900/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-secondary-500"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(usdtAddresses.bep20, "bep20");
                          }}
                          className="p-2 bg-secondary-500/20 hover:bg-secondary-500/30 rounded-lg transition-colors"
                        >
                          {copiedAddress === "bep20" ? (
                            <Check className="w-4 h-4 text-success-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-secondary-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Transaction ID Input */}
                  <div className="mt-6">
                    <label className="flex items-center text-sm font-medium text-white mb-2">
                      Transaction Hash{" "}
                      <span className="text-red-400 ml-1">*</span>
                      <span className="text-xs text-gray-400 ml-2 font-normal">
                        (Required for verification)
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Paste your transaction hash here (0x... or T...)"
                        className={`w-full bg-primary-900/50 border rounded-lg px-3 py-3 text-sm text-white font-mono focus:outline-none focus:ring-2 transition-all duration-200 ${
                          transactionId.trim()
                            ? "border-success-500 focus:border-success-500 focus:ring-success-500/20"
                            : "border-gray-600 focus:border-secondary-500 focus:ring-secondary-500/20"
                        }`}
                        required
                      />
                      {transactionId.trim() && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Check className="w-4 h-4 text-success-500" />
                        </div>
                      )}
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-400">
                        • After sending USDT, copy the transaction hash from
                        your wallet
                      </p>
                      <p className="text-xs text-gray-400">
                        • Transaction hash is required to verify and activate
                        your subscription
                      </p>
                      <p className="text-xs text-gray-400">
                        • Make sure the transaction is confirmed on the
                        blockchain
                      </p>
                    </div>
                  </div>

                  {/* Payment Verification Result */}
                  {paymentVerificationResult && (
                    <div
                      className={`mt-6 p-4 rounded-xl border ${
                        paymentVerificationResult.success
                          ? "bg-success-500/10 border-success-500/20"
                          : "bg-red-500/10 border-red-500/20"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {paymentVerificationResult.success ? (
                          <Check className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p
                            className={`font-semibold text-sm ${
                              paymentVerificationResult.success
                                ? "text-success-400"
                                : "text-red-400"
                            }`}
                          >
                            {paymentVerificationResult.success
                              ? "Payment Verified!"
                              : "Verification Failed"}
                          </p>
                          <p className="text-xs text-gray-300 mt-1">
                            {paymentVerificationResult.message}
                          </p>
                          {paymentVerificationResult.success &&
                            paymentVerificationResult.transaction && (
                              <p className="text-xs text-gray-400 mt-1">
                                Transaction:{" "}
                                {paymentVerificationResult.transaction.transactionHash?.substring(
                                  0,
                                  20
                                )}
                                ...
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed */}
            <div className="flex-shrink-0 border-t border-gray-700/50 p-8 pt-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentVerificationResult(null);
                    setTransactionId("");
                  }}
                  className="flex-1 bg-gray-700/50 hover:bg-gray-700/70 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 border border-gray-600/50"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyPayment}
                  disabled={verifyingPayment || !transactionId.trim()}
                  className="flex-1 btn-primary py-3 px-6 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {verifyingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verifying Transaction...
                    </>
                  ) : !transactionId.trim() ? (
                    "Enter Transaction Hash"
                  ) : (
                    "Verify Payment"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
