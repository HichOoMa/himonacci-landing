import { motion } from "framer-motion";
import { Check, Star, Zap, Shield } from "lucide-react";

interface PricingProps {
  onCTAClick?: () => void;
}

interface PlanBase {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  minCapital: string;
  buttonText: string;
  buttonStyle: string;
}

interface TrialPlan extends PlanBase {
  isTrial: true;
  popular?: never;
}

interface RegularPlan extends PlanBase {
  popular: boolean;
  isTrial?: never;
}

type Plan = TrialPlan | RegularPlan;

const Pricing = ({ onCTAClick }: PricingProps) => {
  const freeTrialPlan: TrialPlan = {
    name: "Free Trial",
    price: "FREE",
    period: "1 hour",
    description: "Experience all premium features instantly",
    features: [
      "Full premium access for 1 hour",
      "Real-time trading signals",
      "Advanced market analysis",
      "Risk management tools",
      "Live dashboard access",
      "All educational resources",
    ],
    limitations: ["One trial per email address", "Email verification required"],
    minCapital: "No minimum required",
    buttonText: "Start Free Trial",
    buttonStyle: "bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700",
    isTrial: true,
  };

  const plans: RegularPlan[] = [
    {
      name: "Dashboard Access",
      price: "$100",
      period: "USDT/month",
      description: "Perfect for signal tracking and learning",
      features: [
        "Real-time market data and analytics",
        "Signal tracking and history",
        "Performance monitoring",
        "Educational resources",
        "Community access",
      ],
      limitations: ["No automated trading", "Manual signal following only"],
      minCapital: "Any amount",
      buttonText: "Start Dashboard",
      buttonStyle: "glass border border-gray-600 hover:border-secondary-500",
      popular: false,
    },
    {
      name: "Auto-Trading Package",
      price: "$100",
      period: "USDT/month + 25% of profits",
      description: "Complete automated system with full control",
      features: [
        "Everything in Dashboard Access",
        "Automated trading execution",
        "Full system control",
        "Priority support",
        "Advanced analytics",
        "Risk management tools",
        "Monthly performance reports",
      ],
      limitations: ["Monthly commitment required", "Cannot stop mid-month"],
      minCapital: "$3,000 USDT minimum",
      buttonText: "Start Auto-Trading",
      buttonStyle: "btn-primary",
      popular: true,
    },
  ];

  const allPlans: Plan[] = [freeTrialPlan, ...plans];

  return (
    <section id="pricing" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-secondary-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Simple <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start with our free trial, then choose the plan that fits your trading goals. 
            All plans include our core technology, with the Auto-Trading package providing full automation.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {allPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`relative glass rounded-2xl p-8 hover-lift flex flex-col justify-between ${
                'popular' in plan && plan.popular
                  ? "border-2 border-secondary-500" 
                  : 'isTrial' in plan && plan.isTrial
                  ? "border-2 border-success-500 bg-gradient-to-br from-success-500/5 to-success-600/5" 
                  : ""
              }`}
            >
              {'popular' in plan && plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-secondary-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {'isTrial' in plan && plan.isTrial && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-success-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Try Now</span>
                  </div>
                </div>
              )}

              <div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${'isTrial' in plan && plan.isTrial ? 'text-success-400' : 'text-white'}`}>
                      {plan.price}
                    </span>
                    <span className="text-gray-400 ml-2">{plan.period}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Minimum Capital:{" "}
                    <span className="text-white font-semibold">
                      {plan.minCapital}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <Check className="w-5 h-5 text-success-500 mr-2" />
                      {'isTrial' in plan && plan.isTrial ? "Trial Features" : "Included Features"}
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start space-x-3"
                        >
                          <Check className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-3 flex items-center">
                        <Shield className="w-5 h-5 text-accent-500 mr-2" />
                        {'isTrial' in plan && plan.isTrial ? "Requirements" : "Important Notes"}
                      </h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li
                            key={limitIndex}
                            className="flex items-start space-x-3"
                          >
                            <div className="w-4 h-4 border border-accent-500 rounded-full mt-0.5 flex-shrink-0"></div>
                            <span className="text-gray-400 text-sm">
                              {limitation}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {'isTrial' in plan && plan.isTrial && (
                  <div className="mb-6 p-4 bg-success-500/10 border border-success-500/20 rounded-lg">
                    <p className="text-success-400 text-sm text-center">
                      <strong>No payment required!</strong> Just verify your email and start trading immediately.
                    </p>
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCTAClick}
                className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-all ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Payment Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 max-w-4xl mx-auto mb-16"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-4">
              Payment <span className="gradient-text">Information</span>
            </h3>
            <p className="text-gray-300">
              Simple, transparent pricing with crypto payments only
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-secondary-500" />
              </div>
              <h4 className="font-semibold text-white mb-2">
                Crypto Payments Only
              </h4>
              <p className="text-gray-400 text-sm">
                All payments processed in USDT or other major cryptocurrencies
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-success-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-success-500" />
              </div>
              <h4 className="font-semibold text-white mb-2">No Hidden Fees</h4>
              <p className="text-gray-400 text-sm">
                Clear pricing structure with no surprise charges or additional
                costs
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-accent-500" />
              </div>
              <h4 className="font-semibold text-white mb-2">Monthly Billing</h4>
              <p className="text-gray-400 text-sm">
                All subscriptions handled monthly with automatic renewal
              </p>
            </div>
          </div>
        </motion.div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 max-w-4xl mx-auto"
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-4">
              Getting <span className="gradient-text">Started</span>
            </h3>
            <p className="text-gray-300">
              Simple requirements to begin your automated trading journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Requirements
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-success-500 mt-0.5" />
                  <span className="text-gray-300">Binance Global account</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-success-500 mt-0.5" />
                  <span className="text-gray-300">
                    Minimum $3,000 USDT for auto-trading
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-success-500 mt-0.5" />
                  <span className="text-gray-300">
                    API keys for trading access
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-success-500 mt-0.5" />
                  <span className="text-gray-300">
                    Monthly subscription payment
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Process</h4>
              <ol className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    1
                  </div>
                  <span className="text-gray-300">
                    Sign up and choose your plan
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    2
                  </div>
                  <span className="text-gray-300">
                    Add your Binance API keys
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    3
                  </div>
                  <span className="text-gray-300">
                    Deposit funds to your account
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    4
                  </div>
                  <span className="text-gray-300">Start automated trading</span>
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-8 p-4 bg-accent-500/10 border border-accent-500/20 rounded-lg">
            <p className="text-accent-400 text-sm text-center">
              <strong>Important:</strong> Auto-trading cannot be stopped
              mid-month once started. All operations are handled monthly for
              optimal results.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
