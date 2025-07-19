import { NextApiResponse } from "next";
import User from "@/models/User";
import Authenticate, { AuthenticatedRequest } from "@/utils/Authentificate";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

export default async function POST(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
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
