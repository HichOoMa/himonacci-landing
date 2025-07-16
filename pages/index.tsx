import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, Copy, Check, X, Shield, Clock } from "lucide-react";
import Hero from "@/components/Hero";
import ProblemSolution from "@/components/ProblemSolution";
import HowItWorks from "@/components/HowItWorks";
import RiskCalculator from "@/components/RiskCalculator";
import LiveDashboard from "@/components/LiveDashboard";
import Features from "@/components/Features";
import Results from "@/components/Results";
import Pricing from "@/components/Pricing";
import Security from "@/components/Security";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
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

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Check if user is authenticated but doesn't have active subscription
  const isUnsubscribedUser = user && user.subscriptionStatus !== "active";

  // USDT payment addresses for different networks
  const usdtAddresses = {
    trc20: process.env.NEXT_PUBLIC_USDT_TRC20_ADDRESS || "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
    erc20: process.env.NEXT_PUBLIC_USDT_ERC20_ADDRESS || "0x742d35Cc6634C0532925a3b8D4012A4F7fB5b32b",
    bep20: process.env.NEXT_PUBLIC_USDT_BEP20_ADDRESS || "0x742d35Cc6634C0532925a3b8D4012A4F7fB5b32b",
  };

  const subscriptionData = {
    plan: "Premium",
    monthlyPrice: 100,
    features: [
      "Advanced Trading Algorithms",
      "24/7 Automated Trading",
      "Real-time Market Analysis",
      "Risk Management Tools",
      "Priority Support",
    ],
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
          expectedAmount: subscriptionData.monthlyPrice,
          transactionId: transactionId.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPaymentVerificationResult({
          success: true,
          message: "Payment verified successfully! Redirecting to dashboard...",
          transaction: result.transaction,
        });

        // Redirect to dashboard after successful payment
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
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

  const handleCTAClick = () => {
    if (user) {
      // User is authenticated, show payment modal
      setShowPaymentModal(true);
    } else {
      // User is not authenticated, redirect to login
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-hero-pattern">
      <Navigation />

      {/* Show subscription required banner for authenticated users without subscription */}
      {/* {isUnsubscribedUser && (
        <div className="bg-gradient-to-r from-secondary-500 to-accent-500 text-white py-3 px-4 text-center">
          <p className="text-sm font-medium">
            Welcome back, {user.firstName}! 
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="ml-2 underline hover:text-gray-200 transition-colors"
            >
              Subscribe now to access your dashboard
            </button>
          </p>
        </div>
      )} */}

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Hero Section */}
        <Hero onCTAClick={handleCTAClick} />

        {/* Problem/Solution Section */}
        <ProblemSolution />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Interactive Risk Calculator */}
        <RiskCalculator />

        {/* Live Performance Dashboard */}
        <LiveDashboard />

        {/* Core Features */}
        <Features />

        {/* Results & Proof */}
        <Results />

        {/* Pricing Section */}
        <Pricing onCTAClick={handleCTAClick} />

        {/* Security & Trust */}
        <Security />

        {/* FAQ Section */}
        <FAQ />

        {/* Final CTA */}
        <FinalCTA onCTAClick={handleCTAClick} />
      </motion.main>

      <Footer />

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
                      {subscriptionData.features.map((feature, index) => (
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

                  {/* Warning */}
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
                  </div>
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
