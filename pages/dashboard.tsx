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
  Clock,
  Check,
  X,
  Mail,
  Shield,
  Activity,
} from "lucide-react";
import NavigationDashboard from "@/components/NavigationDashboard";
import PaymentModal from "@/components/PaymentModal";
import { toast } from "sonner";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  subscriptionStatus: "inactive" | "active" | "expired" | "trial";
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  paymentTransactionHash?: string;
  hasUsedFreeTrial: boolean;
  freeTrialStartDate?: string;
  freeTrialEndDate?: string;
}

export default function Dashboard() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [trialTimeRemaining, setTrialTimeRemaining] = useState({
    minutes: 0,
    seconds: 0,
  });
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch subscription data
  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
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
          // Refresh user data when trial expires
          window.location.reload();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [user]);

  // Check for email verification
  useEffect(() => {
    if (user && !user.isVerified) {
      setShowEmailVerification(true);
    }
  }, [user]);

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
        transactionHash:
          subscriptionData.subscription.paymentHistory?.[0]?.transactionHash,
        daysRemaining: subscriptionData.statusCheck?.daysRemaining || 0,
        isInGracePeriod: subscriptionData.statusCheck?.gracePeriodRemaining > 0,
        gracePeriodRemaining:
          subscriptionData.statusCheck?.gracePeriodRemaining || 0,
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

  // Cancel subscription function
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
        toast("Subscription cancelled successfully");
        fetchSubscriptionData(); // Refresh subscription data
      } else {
        toast.error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Error cancelling subscription");
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

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
      <NavigationDashboard />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto pt-28 px-4 sm:px-6 lg:px-8 py-8">
        {/* Email Verification Banner */}
        {showEmailVerification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-yellow-400 font-semibold">
                    Email Verification Required
                  </p>
                  <p className="text-sm text-gray-300">
                    Please verify your email to start your free trial and access
                    all features.
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    // Resend verification email
                    fetch("/api/auth/resend-verification", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: user?.email }),
                    }).then(() => {
                      toast.success(
                        "Verification email sent! Please check your inbox."
                      );
                    });
                  }}
                  className="text-yellow-400 hover:text-yellow-300 text-sm underline"
                >
                  Resend Email
                </button>
                <button
                  onClick={() => setShowEmailVerification(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Free Trial Status */}
        {user?.subscriptionStatus === "trial" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-success-500/20 to-accent-500/20 border border-success-500/30 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-success-500" />
                <div>
                  <p className="text-success-400 font-semibold text-lg">
                    Free Trial Active
                  </p>
                  <p className="text-sm text-gray-300">
                    You have full access to all premium features
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {String(trialTimeRemaining.minutes).padStart(2, "0")}:
                  {String(trialTimeRemaining.seconds).padStart(2, "0")}
                </div>
                <p className="text-sm text-gray-400">minutes remaining</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-success-500" />
                <span className="text-gray-300">Real-time signals</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-success-500" />
                <span className="text-gray-300">Advanced algorithms</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-success-500" />
                <span className="text-gray-300">Risk management</span>
              </div>
            </div>
          </motion.div>
        )}

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
          </div>
          {/* Trading Signals - For active subscribers and trial users */}
          {(currentSubscriptionData.status === "active" ||
            currentSubscriptionData.status === "trial") && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-8"
            >
              <TradingSignals token={localStorage.getItem("token") || ""} />
            </motion.div>
          )}

          {/* Trial Upgrade Section */}
          {currentSubscriptionData.status === "trial" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-secondary-500/20 to-accent-500/20 rounded-2xl p-8 border border-secondary-500/30">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-8 h-8 text-accent-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Trial Ending Soon
                  </h3>
                  <p className="text-gray-300 text-lg mb-6">
                    Your free trial expires in{" "}
                    <span className="text-accent-400 font-semibold">
                      {trialTimeRemaining.minutes}m {trialTimeRemaining.seconds}s
                    </span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-4 bg-primary-900/50 rounded-xl">
                      <Shield className="w-6 h-6 text-success-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-300">Unlimited Access</p>
                    </div>
                    <div className="text-center p-4 bg-primary-900/50 rounded-xl">
                      <Activity className="w-6 h-6 text-success-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-300">Advanced Features</p>
                    </div>
                    <div className="text-center p-4 bg-primary-900/50 rounded-xl">
                      <DollarSign className="w-6 h-6 text-success-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-300">Full Analytics</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="btn-primary px-8 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Upgrade to Premium - $100/month
                    </button>
                    <button
                      onClick={() => {
                        // Maybe add a "remind me later" functionality
                        toast.info("Trial will continue until expiration");
                      }}
                      className="px-8 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all duration-200"
                    >
                      Continue Trial
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">
                    * Cancel anytime. No long-term commitment required.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Email Verification Modal */}
      {showEmailVerification && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-3xl w-full max-w-md shadow-2xl border border-gray-700/50 overflow-hidden flex flex-col"
          >
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Verify Your Email
                </h3>
                <p className="text-gray-400 text-sm">
                  Please verify your email to unlock all features.
                </p>
              </div>
              <button
                onClick={() => setShowEmailVerification(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/30 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-400 font-semibold">
                        Verification Email Sent
                      </p>
                      <p className="text-xs text-gray-300 mt-1">
                        Check your inbox for the verification email. Click the
                        link in the email to verify your address.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-4">
                  <button
                    onClick={() => {
                      // Resend verification email
                      fetch("/api/auth/resend-verification", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: user?.email }),
                      }).then(() => {
                        toast.success(
                          "Verification email sent! Please check your inbox."
                        );
                      });
                    }}
                    className="btn-primary py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Resend Verification Email
                  </button>

                  <button
                    onClick={() => setShowEmailVerification(false)}
                    className="flex-1 bg-gray-700/50 hover:bg-gray-700/70 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 border border-gray-600/50"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        currentSubscriptionData={currentSubscriptionData}
        onPaymentVerified={fetchSubscriptionData}
      />
    </div>
  );
}
