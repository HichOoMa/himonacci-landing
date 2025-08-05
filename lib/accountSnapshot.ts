import Binance from "binance-api-node";

export interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
  total: string;
  usdtValue: number;
}

export interface AccountSnapshot {
  totalUSDTValue: number;
  balances: BinanceBalance[];
  accountInfo: {
    accountType: string;
    canTrade: boolean;
    canWithdraw: boolean;
    canDeposit: boolean;
    updateTime: number;
  };
}

export async function getAccountSnapshot(apiKey: string, apiSecret: string): Promise<AccountSnapshot> {
  try {
    const client = Binance({
      apiKey,
      apiSecret,
    });

    // Get account information
    const accountInfo = await client.accountInfo();
    
    // Get current prices for all symbols
    const prices = await client.prices();
    
    // Filter balances that have any value (free + locked > 0)
    const significantBalances = accountInfo.balances.filter(balance => {
      const total = parseFloat(balance.free) + parseFloat(balance.locked);
      return total > 0;
    });

    // Calculate USDT values for each balance
    const balancesWithUSDT: BinanceBalance[] = [];
    let totalUSDTValue = 0;

    for (const balance of significantBalances) {
      const { asset, free, locked } = balance;
      const total = (parseFloat(free) + parseFloat(locked)).toString();
      
      let usdtValue = 0;
      
      if (asset === 'USDT') {
        usdtValue = parseFloat(total);
      } else if (asset === 'BUSD' || asset === 'USDC') {
        // Stable coins roughly equal to USDT
        usdtValue = parseFloat(total);
      } else {
        // Try to find price in USDT
        const usdtPair = `${asset}USDT`;
        const btcPair = `${asset}BTC`;
        
        if (prices[usdtPair]) {
          usdtValue = parseFloat(total) * parseFloat(prices[usdtPair]);
        } else if (prices[btcPair] && prices['BTCUSDT']) {
          // Convert via BTC if direct USDT pair doesn't exist
          const btcValue = parseFloat(total) * parseFloat(prices[btcPair]);
          usdtValue = btcValue * parseFloat(prices['BTCUSDT']);
        }
      }

      balancesWithUSDT.push({
        asset,
        free,
        locked,
        total,
        usdtValue,
      });

      totalUSDTValue += usdtValue;
    }

    return {
      totalUSDTValue,
      balances: balancesWithUSDT,
      accountInfo: {
        accountType: accountInfo.accountType,
        canTrade: accountInfo.canTrade,
        canWithdraw: accountInfo.canWithdraw,
        canDeposit: accountInfo.canDeposit,
        updateTime: accountInfo.updateTime,
      },
    };
  } catch (error) {
    console.error('Error fetching account snapshot:', error);
    throw new Error(`Failed to fetch account snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
