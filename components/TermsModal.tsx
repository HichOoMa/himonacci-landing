import { useState } from 'react'
import { X } from 'lucide-react'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  title: string
}

export default function TermsModal({ isOpen, onClose, onAccept, title }: TermsModalProps) {
  const [agreed, setAgreed] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="space-y-4 text-sm text-gray-700">
                <h4 className="font-semibold text-gray-900">Auto Trading Terms & Conditions</h4>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">1. Risk Disclosure</h5>
                  <p>
                    Trading cryptocurrency involves substantial risk of loss and is not suitable for all investors. 
                    You acknowledge that you understand the risks associated with cryptocurrency trading and that 
                    you are solely responsible for any losses that may occur.
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">2. Automated Trading</h5>
                  <p>
                    By enabling auto trading, you authorize our system to execute trades on your behalf using 
                    your Binance account. Our algorithms will manage position sizing, entry/exit points, and 
                    risk management according to our proprietary strategies.
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">3. API Key Security</h5>
                  <p>
                    Your Binance API keys are stored securely and are only used for trading operations. 
                    We recommend using API keys with trading permissions only (no withdrawal permissions). 
                    You can revoke access at any time by disabling auto trading or changing your API keys.
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">4. Performance Disclaimer</h5>
                  <p>
                    Past performance does not guarantee future results. Our trading algorithms are based on 
                    technical analysis and market conditions, which can change rapidly. We do not guarantee 
                    profits and you may lose money.
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">5. Monitoring & Control</h5>
                  <p>
                    You retain full control over your trading account and can disable auto trading at any time. 
                    We recommend monitoring your account regularly and setting appropriate risk limits.
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">6. Liability Limitation</h5>
                  <p>
                    Our liability is limited to the subscription fees paid. We are not responsible for any 
                    trading losses, technical issues, or market volatility that may affect your account.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-yellow-800 font-medium">
                    <strong>Important:</strong> Only enable auto trading with funds you can afford to lose. 
                    Cryptocurrency markets are highly volatile and unpredictable.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center mb-4">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="agree-terms" className="ml-2 text-sm text-gray-700">
                  I have read and agree to the terms and conditions above. I understand the risks involved in automated cryptocurrency trading.
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (agreed) {
                      onAccept()
                      onClose()
                    }
                  }}
                  disabled={!agreed}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Accept & Enable Auto Trading
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
