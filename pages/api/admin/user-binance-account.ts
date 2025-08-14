import { NextApiResponse } from "next";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import Binance from "binance-api-node";
import Authenticate, { AuthenticatedRequest } from "@/utils/Authentificate";
import TradingSettings from "@/models/TradingSettings";
import AccountHistory from "@/models/AccountHistory";
import TradingPeriod from "@/models/TradingPeriod";
import { ObjectId } from "mongodb";

export default async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Authenticate admin user
    const authError = await Authenticate(req, res);
    if (authError) return;

    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ message: "User ID is required" });
    }

    await connectDB();
    const user = await User.findById(userId).select(
      "+binanceApiKey +binanceApiSecret"
    ).populate("tradingSettingsId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const lastHistories = await AccountHistory.findOne({
      userId,
    }).sort({ createdAt: -1 });

    const defaultTradingSetting = await TradingSettings.findOne({
      isDefault: true,
    });

    const tradingSettings = user.tradingSettingsId || defaultTradingSetting;

    const now = new Date();
    const tradingPeriod = await TradingPeriod.findOne({
      userId: new ObjectId(userId),
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).sort({ startTime: -1 });
    if (!tradingPeriod) {
      return res.status(404).json({ message: "Trading period not found" });
    }

    // Get Binance account info if API keys are configured
    let binanceAccount = null;
    let binanceError = null;

    if (user.binanceApiKey && user.binanceApiSecret) {
      try {
        const client = Binance({
          apiKey: user.binanceApiKey,
          apiSecret: user.binanceApiSecret,
        });

        const [accountResponse, pricesResponse] = await Promise.all([
          client.accountInfo(),
          client.prices(),
        ]);

        if (accountResponse && pricesResponse) {
          // Calculate total wallet balance in USDT
          let totalWalletBalanceUSDT = 0;
          const balancesWithUSDT =
            accountResponse.balances
              ?.map((balance: any) => {
                const asset = balance.asset;
                const totalBalance =
                  parseFloat(balance.free) + parseFloat(balance.locked);

                if (totalBalance === 0) return null;

                let usdtValue = 0;

                if (asset === "USDT") {
                  usdtValue = totalBalance;
                } else if (asset === "BUSD" || asset === "FDUSD") {
                  // Stable coins approximately equal to USDT
                  usdtValue = totalBalance;
                } else {
                  // Try to get price against USDT
                  const symbolPrice = pricesResponse[`${asset}USDT`];
                  if (symbolPrice) {
                    usdtValue = totalBalance * parseFloat(symbolPrice);
                  } else {
                    // If no direct USDT pair, try BTC pair and convert through BTC
                    const btcPrice = pricesResponse[`${asset}BTC`];
                    const btcUsdtPrice = pricesResponse["BTCUSDT"];
                    if (btcPrice && btcUsdtPrice) {
                      usdtValue =
                        totalBalance *
                        parseFloat(btcPrice) *
                        parseFloat(btcUsdtPrice);
                    }
                  }
                }

                totalWalletBalanceUSDT += usdtValue;

                return {
                  ...balance,
                  totalBalance: totalBalance.toFixed(8),
                  usdtValue: usdtValue.toFixed(2),
                };
              })
              .filter(Boolean) || [];

          // Find USDT balance specifically
          const usdtBalance = accountResponse.balances?.find(
            (b: any) => b.asset === "USDT"
          );

          binanceAccount = {
            accountType: accountResponse.accountType,
            canTrade: accountResponse.canTrade,
            canDeposit: accountResponse.canDeposit,
            canWithdraw: accountResponse.canWithdraw,
            updateTime: accountResponse.updateTime,
            usdtBalance: usdtBalance
              ? {
                  free: parseFloat(usdtBalance.free).toFixed(2),
                  locked: parseFloat(usdtBalance.locked).toFixed(2),
                  total: (
                    parseFloat(usdtBalance.free) +
                    parseFloat(usdtBalance.locked)
                  ).toFixed(2),
                }
              : {
                  free: "0.00",
                  locked: "0.00",
                  total: "0.00",
                },
            balances: balancesWithUSDT.slice(0, 10), // Show top 10 balances
            totalWalletBalanceUSDT: totalWalletBalanceUSDT.toFixed(2),
          };
        } else {
          binanceError = "Failed to fetch Binance account data";
        }
      } catch (error: any) {
        console.log("Binance API error:", error);
        binanceError = error?.message || "Error connecting to Binance API";
      }
    } else {
      binanceError = "Binance API keys not configured";
    }

    const result = {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        hasApiKeys: !!(user.binanceApiKey && user.binanceApiSecret),
        startBalance: lastHistories
          ? lastHistories.accountBalance?.totalUSDTValue.toFixed(2) || "0.00"
          : "0.00",
        targetBalance: lastHistories
          ? (lastHistories?.accountBalance?.totalUSDTValue *
              (1 + (tradingSettings.closeAllProfitThreshold * 1.1) / 100)).toFixed(2) || "0.00"
          : "0.00",
        primary: tradingPeriod.primaryCount,
        secondary: tradingPeriod.secondaryCount,
        periodEndTime: tradingPeriod.endTime,
      },
      binanceAccount,
      binanceError,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("User Binance account error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
