import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import AccountHistory from '@/models/AccountHistory';
import Authenticate, { AuthenticatedRequest } from '@/utils/Authentificate';

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Authenticate admin user
    const authError = await Authenticate(req, res);
    if (authError) return;

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    await connectDB();

    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Fetch account history for the specified user, sorted by timestamp (newest first)
    const accountHistory = await AccountHistory.find({ userId })
      .sort({ timestamp: -1 })
      .limit(100) // Limit to last 100 records
      .lean();

    // Transform data for chart consumption
    const chartData = accountHistory
      .reverse() // Reverse to show oldest first for timeline
      .map(record => ({
        date: record.timestamp,
        value: record.accountBalance.totalUSDTValue,
        event: record.event,
        timestamp: record.timestamp
      }));

    // Get summary statistics
    const summary = {
      totalRecords: accountHistory.length,
      firstRecord: accountHistory.length > 0 ? accountHistory[accountHistory.length - 1].timestamp : null,
      lastRecord: accountHistory.length > 0 ? accountHistory[0].timestamp : null,
      currentBalance: accountHistory.length > 0 ? accountHistory[0].accountBalance.totalUSDTValue : 0,
      initialBalance: accountHistory.length > 0 ? accountHistory[accountHistory.length - 1].accountBalance.totalUSDTValue : 0
    };

    const change = summary.currentBalance - summary.initialBalance;
    const changePercentage = summary.initialBalance > 0 ? ((change / summary.initialBalance) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        history: accountHistory.reverse(), // Return in descending order for table display
        chartData,
        summary: {
          ...summary,
          change,
          changePercentage
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user account history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
