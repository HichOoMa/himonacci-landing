import { NextApiResponse } from "next";
import User from "@/models/User";
import Authenticate, { AuthenticatedRequest } from "@/utils/Authentificate";

/**
 * Admin API endpoint to close all positions for users
 * 
 * This endpoint allows admin users to close all positions for either:
 * - A specific user (by providing userId)
 * - Multiple users (by providing userIds array)
 * 
 * The endpoint validates that users have API keys configured and then makes
 * API calls to the trader service to close all positions for each user.
 * 
 * @param req.body.userId - ID of a single user to close positions for
 * @param req.body.userIds - Array of user IDs to close positions for (bulk action)
 */
export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const authError = await Authenticate(req, res);
    if (authError) return;

    // Check if user is admin
    const adminUser = await User.findById(req.user?._id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { userId, userIds } = req.body;

    // Validate input - either userId (single user) or userIds (bulk action)
    if (!userId && (!userIds || !Array.isArray(userIds) || userIds.length === 0)) {
      return res.status(400).json({ 
        message: "Either userId (for single user) or userIds array (for bulk action) is required" 
      });
    }

    // Get trader service URL from environment
    const traderServiceUrl = process.env.TRADER_SERVICE_URL;
    if (!traderServiceUrl) {
      return res.status(500).json({ 
        message: "Trader service URL not configured" 
      });
    }

    const targetUserIds = userId ? [userId] : userIds;
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each user
    for (const targetUserId of targetUserIds) {
      try {
        // Validate that the user exists
        const user = await User.findById(targetUserId).select('+binanceApiKey +binanceApiSecret');
        if (!user) {
          results.push({
            userId: targetUserId,
            success: false,
            error: "User not found"
          });
          errorCount++;
          continue;
        }

        // Check if user has API keys configured
        if (!user.binanceApiKey || !user.binanceApiSecret) {
          results.push({
            userId: targetUserId,
            success: false,
            error: "User does not have Binance API keys configured"
          });
          errorCount++;
          continue;
        }

        // Make request to trader service to close all positions for this user
        const traderResponse = await fetch(`${traderServiceUrl}/user/${targetUserId}/close-all`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add any authentication headers if needed
          },
        });

        console.log(traderResponse)
        if (traderResponse.ok) {
          const traderData = await traderResponse.json();
          results.push({
            userId: targetUserId,
            success: true,
            message: `Successfully closed all positions for user ${targetUserId}`,
            data: traderData
          });
          successCount++;
        } else {
          const errorData = await traderResponse.json();
          results.push({
            userId: targetUserId,
            success: false,
            error: errorData.message || `Failed to close positions: ${traderResponse}`
          });
          errorCount++;
        }
      } catch (error) {
        console.error(`Error closing positions for user ${targetUserId}:`, error);
        results.push({
          userId: targetUserId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
        errorCount++;
      }
    }

    // Determine response status based on results
    let statusCode = 200;
    let message = '';

    if (successCount === targetUserIds.length) {
      message = `Successfully closed all positions for ${successCount} user(s)`;
    } else if (successCount > 0) {
      statusCode = 207; // Multi-status
      message = `Closed positions for ${successCount} user(s), failed for ${errorCount} user(s)`;
    } else {
      statusCode = 400;
      message = `Failed to close positions for all ${errorCount} user(s)`;
    }

    res.status(statusCode).json({
      message,
      results,
      summary: {
        total: targetUserIds.length,
        successful: successCount,
        failed: errorCount
      }
    });

  } catch (error) {
    console.error("Close all positions error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
