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

    if (req.method !== 'POST') {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { allow, userIds } = req.body;

    if (typeof allow !== 'boolean') {
      return res.status(400).json({ message: "Allow field must be a boolean" });
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "User IDs array is required" });
    }

    // Update multiple users
    const updateData: any = { isAutoTradingAllowed: allow };
    
    // If disabling auto trading permission, also disable auto trading
    if (!allow) {
      updateData.isAutoTradingEnabled = false;
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateData
    );

    res.status(200).json({
      message: `Auto trading ${allow ? 'allowed' : 'forbidden'} for ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Bulk auto trading update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
