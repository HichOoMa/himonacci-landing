import { NextApiResponse } from "next";
import User from "@/models/User";
import Authenticate, { AuthenticatedRequest } from "@/utils/Authentificate";

export default async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const authError = await Authenticate(req, res);
    if (authError) return;

    // Check if user is admin
    const adminUser = await User.findById(req.user?._id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ message: "Method not allowed" });
    }

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const usersWithApiKeys = await User.countDocuments({
      binanceApiKey: { $exists: true, $ne: null },
      binanceApiSecret: { $exists: true, $ne: null }
    });
    const autoTradingUsers = await User.countDocuments({ isAutoTradingEnabled: true });

    const stats = {
      totalUsers,
      verifiedUsers,
      autoTradingUsers,
      usersWithApiKeys
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error("User stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
