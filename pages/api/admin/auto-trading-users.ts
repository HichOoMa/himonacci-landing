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

    const { filter = 'all' } = req.query;

    let query = {};
    switch (filter) {
      case 'enabled':
        query = { isAutoTradingEnabled: true };
        break;
      case 'forbidden':
        query = { isAutoTradingAllowed: false };
        break;
      default:
        query = {};
    }

    const users = await User.find(query)
      .select('-password +binanceApiKey +binanceApiSecret')
      .sort({ createdAt: -1 });

    const usersWithStats = users.map(user => {
      const userObj = user.toObject();
      delete userObj.binanceApiKey;
      delete userObj.binanceApiSecret;
      return {
        ...userObj,
        hasApiKeys: !!(user.binanceApiKey && user.binanceApiSecret)
      };
    });

    res.status(200).json({ users: usersWithStats });
  } catch (error) {
    console.error("Auto trading users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
