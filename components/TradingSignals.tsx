import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Star,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Clock,
  RefreshCw,
  Heart,
  HeartIcon,
} from "lucide-react";

interface TradingSignal {
  id: string;
  symbol: string;
  closePrice: number;
  currentPrice: number;
  expectedProfit: number;
  algo: "candle" | "zone";
  entry: number;
  status: string;
  updatedAt: string;
  type: "candle" | "zone";
  priority: number;
}

interface TradingSignalsProps {
  token: string;
}

const TradingSignals: React.FC<TradingSignalsProps> = ({ token }) => {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [favorites, setFavorites] = useState<
    Array<{ signalId: string; type: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("type");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterBy, setFilterBy] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [binancePrices, setBinancePrices] = useState<{ [key: string]: number }>(
    {}
  );
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch signals from API
  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        sortBy,
        sortOrder,
        favoritesOnly: showFavoritesOnly.toString(),
        ...(filterBy && filterValue && { filterBy, filterValue }),
      });

      const response = await fetch(`/api/trading/signals?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch signals");
      }

      const data = await response.json();
      setSignals(data.signals || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch signals");
    } finally {
      setLoading(false);
    }
  }, [token, sortBy, sortOrder, filterBy, filterValue, showFavoritesOnly]);

  // Fetch favorites
  const fetchFavorites = useCallback(async () => {
    try {
      const response = await fetch("/api/trading/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  }, [token]);

  // Toggle favorite
  const toggleFavorite = async (signalId: string, type: string) => {
    const isFavorite = favorites.some(
      (fav) => fav.signalId === signalId && fav.type === type
    );

    try {
      const response = await fetch("/api/trading/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ signalId, type }),
      });

      if (response.ok) {
        fetchFavorites();
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  // Setup Binance WebSocket for real-time prices
  useEffect(() => {
    if (signals.length === 0) return;

    const symbolsSet = new Set(signals.map((signal) => signal.symbol));
    const symbols = Array.from(symbolsSet);
    const streams = symbols.map((symbol) => `${symbol.toLowerCase()}@ticker`);

    if (streams.length === 0) return;

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${streams.join("/")}`
    );

    ws.onopen = () => {
      setWsConnected(true);
      // setInterval(() => {
      //   ws.send(JSON.stringify({ method: "ping", id: Date.now() })); // Client pings
      // }, 20 * 1000); // Every 20 seconds

      console.log("Connected to Binance WebSocket");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.c) {
          // Update price for the symbol
          const symbol = data.s;
          const price = parseFloat(data.c);
          setBinancePrices((prev) => ({
            ...prev,
            [symbol]: price,
          }));
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      console.log("Disconnected from Binance WebSocket");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [signals]);

  // Calculate real-time expected profit
  const calculateRealTimeProfit = (signal: TradingSignal) => {
    const currentPrice = binancePrices[signal.symbol] || signal.currentPrice;
    if (!currentPrice || !signal.closePrice) return 0;
    return ((signal.closePrice - currentPrice) / currentPrice) * 100;
  };

  // Filter signals
  const filteredSignals = signals.filter((signal) => {
    const matchesSearch = signal.symbol
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Initial load
  useEffect(() => {
    fetchSignals();
    fetchFavorites();
  }, [fetchSignals, fetchFavorites]);

  // Handle sort change
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column)
      return <ChevronDown className="w-4 h-4 text-gray-500" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 text-secondary-500" />
    ) : (
      <ChevronDown className="w-4 h-4 text-secondary-500" />
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-secondary-500" />
          <span className="text-white">Loading signals...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchSignals}
          className="mt-2 text-sm text-secondary-500 hover:text-secondary-400"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Trading Signals</h2>
          <p className="text-gray-400 text-sm">
            Live market signals with real-time profit calculations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
              wsConnected
                ? "bg-success-500/20 text-success-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                wsConnected ? "bg-success-500" : "bg-red-500"
              }`}
            />
            <span>{wsConnected ? "Live" : "Disconnected"}</span>
          </div>
          <button
            onClick={fetchSignals}
            className="p-2 bg-secondary-500/20 hover:bg-secondary-500/30 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-secondary-500" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-primary-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 bg-primary-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-secondary-500"
          >
            <option value="">All Types</option>
            <option value="algo">Filter by Algo</option>
            <option value="minProfit">Min Profit %</option>
          </select>

          {filterBy && (
            <input
              type="text"
              placeholder={
                filterBy === "algo"
                  ? "candle or zone"
                  : filterBy === "minProfit"
                  ? "Min %"
                  : "Filter value"
              }
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="px-3 py-2 bg-primary-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary-500"
            />
          )}
        </div>

        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            showFavoritesOnly
              ? "bg-accent-500 text-white"
              : "bg-gray-700/50 text-gray-300 hover:bg-gray-700/70"
          }`}
        >
          <Heart className="w-4 h-4 mr-2 inline" />
          Favorites
        </button>
      </div>

      {/* Signals Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-900/50 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("symbol")}
                    className="flex items-center space-x-2 text-white hover:text-secondary-500 transition-colors"
                  >
                    <span>Symbol</span>
                    {getSortIcon("symbol")}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-white">Current Price</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-white">Target Price</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("expectedProfit")}
                    className="flex items-center space-x-2 text-white hover:text-secondary-500 transition-colors"
                  >
                    <span>Expected Profit</span>
                    {getSortIcon("expectedProfit")}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-white">Algo</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort("updatedAt")}
                    className="flex items-center space-x-2 text-white hover:text-secondary-500 transition-colors"
                  >
                    <span>Updated</span>
                    {getSortIcon("updatedAt")}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-white">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredSignals.map((signal) => {
                  const realTimeProfit = calculateRealTimeProfit(signal);
                  const isFavorite = favorites.some(
                    (fav) =>
                      fav.signalId === signal.id && fav.type === signal.type
                  );

                  return (
                    <motion.tr
                      key={`${signal.id}-${signal.type}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="border-b border-gray-700/50 hover:bg-primary-900/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold">
                            {signal.symbol}
                          </span>
                          {/* {signal.entry && (
                            <span className="text-xs bg-secondary-500/20 text-secondary-400 px-2 py-1 rounded">
                              E{signal.entry}
                            </span>
                          )} */}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-white">
                            ${binancePrices[signal.symbol]?.toFixed(6) || signal.currentPrice.toFixed(6)}
                          </span>
                          {wsConnected && (
                            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white">
                          ${signal.closePrice?.toFixed(6)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {realTimeProfit > 0 ? (
                            <TrendingUp className="w-4 h-4 text-success-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span
                            className={`font-semibold ${
                              realTimeProfit > 0
                                ? "text-success-400"
                                : "text-red-400"
                            }`}
                          >
                            {realTimeProfit > 0 ? "+" : ""}
                            {realTimeProfit.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            signal.algo === "candle"
                              ? "bg-accent-500/20 text-accent-400"
                              : "bg-secondary-500/20 text-secondary-400"
                          }`}
                        >
                          {signal.algo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {formatTime(signal.updatedAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleFavorite(signal.id, signal.type)}
                          className={`p-2 rounded-lg transition-colors ${
                            isFavorite
                              ? "bg-accent-500/20 text-accent-400 hover:bg-accent-500/30"
                              : "bg-gray-700/50 text-gray-400 hover:bg-gray-700/70"
                          }`}
                        >
                          <HeartIcon
                            className={`w-4 h-4 ${
                              isFavorite ? "fill-current" : ""
                            }`}
                          />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredSignals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {showFavoritesOnly
                ? "No favorite signals found"
                : searchTerm
                ? "No signals match your search"
                : "No signals available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingSignals;
