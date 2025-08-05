import { NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import AccountHistory from "@/models/AccountHistory";
import Authenticate, { AuthenticatedRequest } from "@/utils/Authentificate";
import { getAccountSnapshot } from "@/lib/accountSnapshot";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

export default async function POST(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    await connectDB();
    
    const authError = await Authenticate(req, res);
    if (authError) return;

    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
      return res
        .status(400)
        .json({ message: "Enabled field must be a boolean" });
    }

    // Get user and check if they have API keys
    const user = await User.findById(req.user?._id).select(
      "+binanceApiKey +binanceApiSecret"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.binanceApiKey || !user.binanceApiSecret) {
      return res
        .status(400)
        .json({ message: "Binance API keys not configured" });
    }

    // Check if user is allowed to enable auto trading
    if (!user.isAutoTradingAllowed) {
      return res
        .status(403)
        .json({ message: "Auto trading has been disabled by an administrator" });
    }

    // Prevent users from disabling auto trading once enabled
    if (user.isAutoTradingEnabled && !enabled) {
      return res
        .status(403)
        .json({ message: "Auto trading cannot be disabled once enabled. Please contact support if needed." });
    }

    // If enabling auto trading, capture account snapshot
    if (enabled && !user.isAutoTradingEnabled) {
      try {
        console.log('Capturing account snapshot for user:', user._id);
        const accountSnapshot = await getAccountSnapshot(user.binanceApiKey!, user.binanceApiSecret!);
        
        // Create account history record
        const accountHistory = new AccountHistory({
          userId: user._id,
          event: 'auto_trading_enabled',
          accountBalance: {
            totalUSDTValue: accountSnapshot.totalUSDTValue,
            balances: accountSnapshot.balances,
          },
          accountInfo: accountSnapshot.accountInfo,
        });

        await accountHistory.save();
        console.log('Account snapshot saved successfully');
      } catch (snapshotError) {
        console.error('Error capturing account snapshot:', snapshotError);
        return res
          .status(500)
          .json({ 
            message: "Failed to capture account snapshot. Please try again.",
            error: snapshotError instanceof Error ? snapshotError.message : 'Unknown error'
          });
      }
    }

    // Update auto trading status
    user.isAutoTradingEnabled = enabled;
    await user.save();

    res.status(200).json({
      message: `Auto trading ${enabled ? "enabled" : "disabled"} successfully`,
      isAutoTradingEnabled: enabled,
    });
  } catch (error) {
    console.error("Toggle auto trading error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
