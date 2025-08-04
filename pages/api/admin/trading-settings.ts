import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import User from '@/models/User'
import TradingSettings from '@/models/TradingSettings'
import dbConnect from '@/lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()

    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const user = await User.findById(decoded.userId)

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    switch (req.method) {
      case 'GET':
        return handleGet(req, res)
      case 'POST':
        return handlePost(req, res)
      case 'PUT':
        return handlePut(req, res)
      case 'DELETE':
        return handleDelete(req, res)
      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Trading settings admin API error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const tradingSettings = await TradingSettings.find().sort({ isDefault: -1, createdAt: -1 })
    
    res.status(200).json({
      success: true,
      tradingSettings,
    })
  } catch (error) {
    console.error('Get trading settings error:', error)
    res.status(500).json({ message: 'Failed to fetch trading settings' })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      name,
      isDefault,
      periodDuration,
      positionsPerPeriod,
      reservedPeriodsBalance,
      balancePartitions,
      closeAllCheckPeriod,
      closeAllProfitThreshold,
      minExpectedProfit,
      minVolume,
    } = req.body

    // Validate required fields
    if (!name || !periodDuration || !positionsPerPeriod || 
        reservedPeriodsBalance === undefined || balancePartitions === undefined ||
        !closeAllCheckPeriod || closeAllProfitThreshold === undefined || 
        minExpectedProfit === undefined || minVolume === undefined) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const newTradingSettings = new TradingSettings({
      name,
      isDefault: isDefault || false,
      periodDuration,
      positionsPerPeriod,
      reservedPeriodsBalance,
      balancePartitions,
      closeAllCheckPeriod,
      closeAllProfitThreshold,
      minExpectedProfit,
      minVolume,
    })

    await newTradingSettings.save()

    // If this is set as default, update all users that were using the previous default
    if (isDefault) {
      await User.updateMany(
        { tradingSettingsId: { $exists: false } },
        { tradingSettingsId: newTradingSettings._id }
      )
    }

    res.status(201).json({
      success: true,
      tradingSettings: newTradingSettings,
    })
  } catch (error) {
    console.error('Create trading settings error:', error)
    res.status(500).json({ message: 'Failed to create trading settings' })
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query
    const {
      name,
      isDefault,
      periodDuration,
      positionsPerPeriod,
      reservedPeriodsBalance,
      balancePartitions,
      closeAllCheckPeriod,
      closeAllProfitThreshold,
      minExpectedProfit,
      minVolume,
    } = req.body

    if (!id) {
      return res.status(400).json({ message: 'Trading settings ID is required' })
    }

    const tradingSettings = await TradingSettings.findById(id)
    if (!tradingSettings) {
      return res.status(404).json({ message: 'Trading settings not found' })
    }

    // Store the previous default state
    const wasDefault = tradingSettings.isDefault
    const previousDefaultId = wasDefault ? tradingSettings._id : null

    // Update the settings
    tradingSettings.name = name || tradingSettings.name
    tradingSettings.isDefault = isDefault !== undefined ? isDefault : tradingSettings.isDefault
    tradingSettings.periodDuration = periodDuration || tradingSettings.periodDuration
    tradingSettings.positionsPerPeriod = positionsPerPeriod || tradingSettings.positionsPerPeriod
    tradingSettings.reservedPeriodsBalance = reservedPeriodsBalance !== undefined ? reservedPeriodsBalance : tradingSettings.reservedPeriodsBalance
    tradingSettings.balancePartitions = balancePartitions !== undefined ? balancePartitions : tradingSettings.balancePartitions
    tradingSettings.closeAllCheckPeriod = closeAllCheckPeriod || tradingSettings.closeAllCheckPeriod
    tradingSettings.closeAllProfitThreshold = closeAllProfitThreshold !== undefined ? closeAllProfitThreshold : tradingSettings.closeAllProfitThreshold
    tradingSettings.minExpectedProfit = minExpectedProfit !== undefined ? minExpectedProfit : tradingSettings.minExpectedProfit
    tradingSettings.minVolume = minVolume !== undefined ? minVolume : tradingSettings.minVolume

    await tradingSettings.save()

    // Handle default state changes
    if (isDefault && !wasDefault) {
      // This setting is now default, update users who were using the previous default
      const users = await User.updateMany(
        { 
          $or: [
            { tradingSettingsId: { $exists: false } },
            { tradingSettingsId: null }
          ]
        },
        { tradingSettingsId: tradingSettings._id },
        { multi: true, new: true }
      )
      console.log(JSON.stringify(users, null, 2))
    } else if (!isDefault && wasDefault) {
      // This setting is no longer default, find new default or set users to null
      const newDefault = await TradingSettings.findOne({ isDefault: true })
      if (newDefault) {
        await User.updateMany(
          { tradingSettingsId: previousDefaultId },
          { tradingSettingsId: newDefault._id }
        )
      } else {
        await User.updateMany(
          { tradingSettingsId: previousDefaultId },
          { $unset: { tradingSettingsId: 1 } }
        )
      }
    }

    res.status(200).json({
      success: true,
      tradingSettings,
    })
  } catch (error) {
    console.error('Update trading settings error:', error)
    res.status(500).json({ message: 'Failed to update trading settings' })
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ message: 'Trading settings ID is required' })
    }

    const tradingSettings = await TradingSettings.findById(id)
    if (!tradingSettings) {
      return res.status(404).json({ message: 'Trading settings not found' })
    }

    // Check if this is the default setting
    if (tradingSettings.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default trading settings. Please set another setting as default first.' })
    }

    // Update users who were using this setting to use the default
    const defaultSettings = await TradingSettings.findOne({ isDefault: true })
    if (defaultSettings) {
      await User.updateMany(
        { tradingSettingsId: id },
        { tradingSettingsId: defaultSettings._id }
      )
    } else {
      await User.updateMany(
        { tradingSettingsId: id },
        { $unset: { tradingSettingsId: 1 } }
      )
    }

    await TradingSettings.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: 'Trading settings deleted successfully',
    })
  } catch (error) {
    console.error('Delete trading settings error:', error)
    res.status(500).json({ message: 'Failed to delete trading settings' })
  }
}
