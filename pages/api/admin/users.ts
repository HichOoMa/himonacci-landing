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

    switch (req.method) {
      case 'GET':
        return await getUsers(req, res);
      case 'PUT':
        return await updateUser(req, res);
      default:
        return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getUsers(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password -binanceApiKey -binanceApiSecret')
      .populate('tradingSettingsId', 'name isDefault')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    const usersWithStats = users.map(user => ({
      ...user.toObject(),
      hasApiKeys: !!(user.binanceApiKey && user.binanceApiSecret),
      tradingSettings: user.tradingSettingsId
    }));

    res.status(200).json({
      users: usersWithStats,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        count: total,
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
}

async function updateUser(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { userId, updates } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const allowedUpdates = [
      'isAutoTradingAllowed',
      'subscriptionStatus',
      'subscriptionEndDate',
      'role',
      'tradingSettingsId'
    ];

    const updateData: any = {};
    for (const key of Object.keys(updates)) {
      if (allowedUpdates.includes(key)) {
        updateData[key] = updates[key];
      }
    }

    // If disabling auto trading permission and user has it enabled, disable it
    if (updates.isAutoTradingAllowed === false) {
      updateData.isAutoTradingEnabled = false;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    )
    .select('-password -binanceApiKey -binanceApiSecret')
    .populate('tradingSettingsId', 'name isDefault');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: {
        ...user.toObject(),
        tradingSettings: user.tradingSettingsId
      }
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Error updating user" });
  }
}
