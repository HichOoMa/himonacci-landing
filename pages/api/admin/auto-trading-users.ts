import AccountHistory from "@/models/AccountHistory";
import { NextApiResponse } from "next";
import User from "@/models/User";
import Authenticate, { AuthenticatedRequest } from "@/utils/Authentificate";
import TradingSettings from "@/models/TradingSettings";

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    const authError = await Authenticate(req, res);
    if (authError) return;

    // Check if user is admin
    const adminUser = await User.findById(req.user?._id);
    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { filter = "all" } = req.query;

    let query = {};
    switch (filter) {
      case "enabled":
        query = { isAutoTradingEnabled: true };
        break;
      case "forbidden":
        query = { isAutoTradingAllowed: false };
        break;
      default:
        query = {};
    }

    const users = await User.find(query)
      .select("-password +binanceApiKey +binanceApiSecret")
      .populate("tradingSettingsId")
      .sort({ createdAt: -1 });

    // Find last account history for every user
    const userIds = users.map((user) => user._id);
    const lastHistories = await AccountHistory.aggregate([
      { $match: { user: { $in: userIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$user",
          lastHistory: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$lastHistory" } }, // Flatten document
    ]);

    // Map userId to lastHistory for quick lookup
    const lastHistoryMap = new Map<string, any>();
    lastHistories.forEach((h) => {
      lastHistoryMap.set(h._id.toString(), h.lastHistory);
    });

    const defaultTradingSetting = await TradingSettings.findOne({
      isDefault: true,
    });

    const usersWithStats = users.map((user) => {
      const userObj = user.toObject();
      delete userObj.binanceApiKey;
      delete userObj.binanceApiSecret;
      const lastAccountHistory =
        lastHistoryMap.get(user._id.toString()) || null;
      const tradingSettings = user.tradingSettingsId || defaultTradingSetting;
      return {
        ...userObj,
        hasApiKeys: !!(user.binanceApiKey && user.binanceApiSecret),
        startBalance: lastAccountHistory.accountBalance?.totalUSDTValue || 0,
        targetBalance:
          lastAccountHistory.accountBalance?.totalUSDTValue *
            (1 + (tradingSettings.closeAllProfitThreshold * 1.1) / 100) || 0,
      };
    });

    res.status(200).json({ users: usersWithStats });
  } catch (error) {
    console.error("Auto trading users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
