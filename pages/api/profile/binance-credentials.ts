import { NextApiResponse } from "next";
import connectDB from "@/lib/mongodb";
import Authenticate, { AuthenticatedRequest } from "@/utils/Authentificate";
import Binance from "binance-api-node";

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const authError = await Authenticate(req, res);
    if (authError) return;

    await connectDB();
    const user = req.user;

    const { apiKey, apiSecret } = req.body;

    if (!apiKey || !apiSecret) {
      return res
        .status(400)
        .json({ message: "API key and secret are required" });
    }

    // TODO: Add Binance API validation here
    // You can use binance-api-node or similar library to test the credentials
    // For now, we'll just validate the format

    if (apiKey.length < 10 || apiSecret.length < 10) {
      return res
        .status(400)
        .json({ message: "Invalid API credentials format" });
    }

    const client = Binance({
      apiKey,
      apiSecret,
    });
    if (!client) {
      return res
        .status(400)
        .json({ message: "Invalid API credentials format" });
    }
    // Test the credentials by fetching account info
    try {
      const permissions = await client.apiPermission();
      // If the credentials are valid, we can proceed
      if (
        !permissions ||
        !permissions.enableReading ||
        !permissions.enableSpotAndMarginTrading
      ) {
        throw new Error("API credentials do not have necessary permissions");
      }
    } catch (error) {
      console.error("Binance API validation error:", error);
      return res
        .status(400)
        .json({
          message:
            (error as Error).message || "Invalid Binance API credentials",
        });
    }
    // Update user with encrypted API credentials
    user.binanceApiKey = apiKey;
    user.binanceApiSecret = apiSecret;
    await user.save();

    res.status(200).json({
      message: "Binance API credentials updated successfully",
      hasApiCredentials: true,
    });
  } catch (error) {
    console.error("API credentials update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
