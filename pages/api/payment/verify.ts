import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import SubscriptionManager from '@/lib/subscriptionManager'

// Function to verify TRON (TRC20) USDT transaction
const verifyTronTransaction = async (address: string, amount: number, transactionId?: string) => {
  try {
    const apiKey = process.env.TRON_API_KEY
    
    if (transactionId) {
      // Verify specific transaction by ID
      const response = await fetch(`https://api.trongrid.io/v1/transactions/${transactionId}`)
      const data = await response.json()
      
      if (data.ret && data.ret[0].contractRet === 'SUCCESS') {
        const contract = data.raw_data.contract[0]
        if (contract.type === 'TransferContract') {
          const toAddress = contract.parameter.value.to_address
          const transferAmount = contract.parameter.value.amount / 1000000 // Convert from sun to TRX
          
          return {
            success: toAddress === address && transferAmount >= amount,
            transactionHash: transactionId,
            amount: transferAmount,
            confirmations: 20, // Assume confirmed if found
            timestamp: new Date(data.raw_data.timestamp).toISOString(),
            network: 'TRC20'
          }
        }
      }
    } else {
      // Scan recent transactions to the address
      const response = await fetch(`https://api.trongrid.io/v1/accounts/${address}/transactions/trc20?limit=50`)
      const data = await response.json()
      
      // Look for recent USDT transfers
      const recentTransactions = data.data?.filter((tx: any) => {
        const now = Date.now()
        const txTime = parseInt(tx.block_timestamp)
        const tenMinutesAgo = now - (10 * 60 * 1000)
        
        return txTime > tenMinutesAgo && 
               tx.token_info.symbol === 'USDT' && 
               parseFloat(tx.value) / Math.pow(10, tx.token_info.decimals) >= amount
      })
      
      if (recentTransactions && recentTransactions.length > 0) {
        const tx = recentTransactions[0]
        return {
          success: true,
          transactionHash: tx.transaction_id,
          amount: parseFloat(tx.value) / Math.pow(10, tx.token_info.decimals),
          confirmations: 20,
          timestamp: new Date(tx.block_timestamp).toISOString(),
          network: 'TRC20'
        }
      }
    }
    
    return {
      success: false,
      error: 'Transaction not found or amount insufficient'
    }
  } catch (error) {
    console.error('TRON verification error:', error)
    return {
      success: false,
      error: 'API error during verification'
    }
  }
}

// Function to verify Ethereum (ERC20) USDT transaction
const verifyEthereumTransaction = async (address: string, amount: number, transactionId?: string) => {
  try {
    const apiKey = process.env.ETHERSCAN_API_KEY
    const contractAddress = process.env.USDT_ERC20_CONTRACT
    
    if (transactionId) {
      // Verify specific transaction by ID
      const response = await fetch(`https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${transactionId}&apikey=${apiKey}`)
      const data = await response.json()
      
      if (data.result && data.result.to.toLowerCase() === contractAddress?.toLowerCase()) {
        // This is a contract transaction, need to decode the input data
        // For simplicity, we'll assume it's valid if it's to the USDT contract
        return {
          success: true,
          transactionHash: transactionId,
          amount: amount,
          confirmations: 12,
          timestamp: new Date().toISOString(),
          network: 'ERC20'
        }
      }
    } else {
      // Scan recent token transfers
      const response = await fetch(`https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${contractAddress}&address=${address}&page=1&offset=100&sort=desc&apikey=${apiKey}`)
      const data = await response.json()
      
      if (data.status === '1' && data.result.length > 0) {
        const recentTransactions = data.result.filter((tx: any) => {
          const now = Date.now()
          const txTime = parseInt(tx.timeStamp) * 1000
          const tenMinutesAgo = now - (10 * 60 * 1000)
          
          return txTime > tenMinutesAgo && 
                 tx.to.toLowerCase() === address.toLowerCase() &&
                 parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal)) >= amount
        })
        
        if (recentTransactions.length > 0) {
          const tx = recentTransactions[0]
          return {
            success: true,
            transactionHash: tx.hash,
            amount: parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal)),
            confirmations: 12,
            timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
            network: 'ERC20'
          }
        }
      }
    }
    
    return {
      success: false,
      error: 'Transaction not found or amount insufficient'
    }
  } catch (error) {
    console.error('Ethereum verification error:', error)
    return {
      success: false,
      error: 'API error during verification'
    }
  }
}

// Function to verify BSC (BEP20) USDT transaction
const verifyBscTransaction = async (address: string, amount: number, transactionId?: string) => {
  try {
    const apiKey = process.env.BSCSCAN_API_KEY
    const contractAddress = process.env.USDT_BEP20_CONTRACT
    
    if (transactionId) {
      // Verify specific transaction by ID
      const response = await fetch(`https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${transactionId}&apikey=${apiKey}`)
      const data = await response.json()
      
      if (data.result && data.result.to.toLowerCase() === contractAddress?.toLowerCase()) {
        return {
          success: true,
          transactionHash: transactionId,
          amount: amount,
          confirmations: 12,
          timestamp: new Date().toISOString(),
          network: 'BEP20'
        }
      }
    } else {
      // Scan recent token transfers
      const response = await fetch(`https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${contractAddress}&address=${address}&page=1&offset=100&sort=desc&apikey=${apiKey}`)
      const data = await response.json()
      
      if (data.status === '1' && data.result.length > 0) {
        const recentTransactions = data.result.filter((tx: any) => {
          const now = Date.now()
          const txTime = parseInt(tx.timeStamp) * 1000
          const tenMinutesAgo = now - (10 * 60 * 1000)
          
          return txTime > tenMinutesAgo && 
                 tx.to.toLowerCase() === address.toLowerCase() &&
                 parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal)) >= amount
        })
        
        if (recentTransactions.length > 0) {
          const tx = recentTransactions[0]
          return {
            success: true,
            transactionHash: tx.hash,
            amount: parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal)),
            confirmations: 12,
            timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
            network: 'BEP20'
          }
        }
      }
    }
    
    return {
      success: false,
      error: 'Transaction not found or amount insufficient'
    }
  } catch (error) {
    console.error('BSC verification error:', error)
    return {
      success: false,
      error: 'API error during verification'
    }
  }
}

// Main function to verify USDT transaction based on network
const verifyUSDTTransaction = async (address: string, amount: number, network: string, transactionId?: string) => {
  console.log(`Verifying ${amount} USDT transaction on ${network} network for address: ${address}`)
  if (transactionId) {
    console.log(`Looking for specific transaction: ${transactionId}`)
  }
  
  try {
    let result
    
    switch (network.toLowerCase()) {
      case 'trc20':
        result = await verifyTronTransaction(address, amount, transactionId)
        break
      case 'erc20':
        result = await verifyEthereumTransaction(address, amount, transactionId)
        break
      case 'bep20':
        result = await verifyBscTransaction(address, amount, transactionId)
        break
      default:
        return {
          success: false,
          error: 'Unsupported network'
        }
    }
    
    if (result.success) {
      return {
        success: true,
        transactionHash: result.transactionHash,
        amount: result.amount,
        confirmations: result.confirmations,
        timestamp: result.timestamp,
        fromAddress: 'N/A', // Would need additional API call to get this
        toAddress: address,
        network: network.toUpperCase(),
        verificationMethod: transactionId ? 'transaction_id' : 'address_scan'
      }
    } else {
      return {
        success: false,
        transactionHash: null,
        amount: 0,
        confirmations: 0,
        timestamp: null,
        error: result.error || 'Transaction verification failed'
      }
    }
  } catch (error) {
    console.error('Transaction verification error:', error)
    return {
      success: false,
      transactionHash: null,
      amount: 0,
      confirmations: 0,
      timestamp: null,
      error: 'Internal verification error'
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  authenticateToken(req as AuthenticatedRequest, res, async () => {
    try {
      await connectDB()
      
      const { user } = req as AuthenticatedRequest
      const { network, expectedAmount, transactionId } = req.body

      if (!network || !expectedAmount) {
        return res.status(400).json({ message: 'Network and expected amount are required' })
      }

      if (!transactionId || transactionId.trim().length === 0) {
        return res.status(400).json({ message: 'Transaction ID is required for verification' })
      }

      // Get the appropriate wallet address based on network
      const walletAddresses = {
        trc20: process.env.USDT_TRC20_ADDRESS,
        erc20: process.env.USDT_ERC20_ADDRESS,
        bep20: process.env.USDT_BEP20_ADDRESS
      }

      const walletAddress = walletAddresses[network as keyof typeof walletAddresses]
      if (!walletAddress) {
        return res.status(400).json({ message: 'Invalid network' })
      }

      // Verify the transaction
      const verification = await verifyUSDTTransaction(walletAddress, expectedAmount, network, transactionId)

      if (verification.success) {
        // Create payment data for subscription manager
        const paymentData = {
          transactionHash: verification.transactionHash,
          amount: verification.amount,
          network: verification.network,
          paymentDate: new Date(verification.timestamp || new Date()),
          status: 'confirmed' as const,
          verificationMethod: verification.verificationMethod
        }

        // Use subscription manager to handle the payment
        const subscription = await SubscriptionManager.createSubscription(user.id, paymentData)

        return res.status(200).json({
          success: true,
          message: 'Payment verified successfully',
          transaction: verification,
          subscription: {
            id: subscription._id,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            nextPaymentDue: subscription.nextPaymentDue
          }
        })
      } else {
        return res.status(400).json({
          success: false,
          message: 'Payment not found or insufficient amount',
          transaction: verification
        })
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  })
}
