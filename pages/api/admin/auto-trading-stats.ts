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

    // Get auto trading statistics
    const enabledUsers = await User.countDocuments({ isAutoTradingEnabled: true });
    const allowedUsers = await User.countDocuments({ isAutoTradingAllowed: true });
    const forbiddenUsers = await User.countDocuments({ isAutoTradingAllowed: false });

    const stats = {
      enabledUsers,
      allowedUsers,
      forbiddenUsers
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error("Auto trading stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
