# Trading Signals Feature

This feature provides real-time trading signals for subscribed users with the following capabilities:

## Features

### 1. Signal Types
- **Candle Signals**: Signals from candles with `GET_LONG_ENTRY` status
- **Zone Signals**: Signals from zones with `ENTRY` status

### 2. Data Requirements
- Last updated within 24 hours
- Expected profit > 1% (calculated from current price to close price)
- Only active for users with `active` subscription status

### 3. Default Sorting
- Candles before zones
- For candles: Entry 3 first, then entry 1 and 2
- For zones: Highest expected profit first
- Within same priority: Newest first

### 4. Real-time Features
- **Live Price Updates**: Connected to Binance WebSocket for real-time price updates
- **Real-time Profit Calculation**: Expected profit recalculated with live prices
- **Connection Status**: Shows live/disconnected status

### 5. Filtering & Sorting
- **Search**: Filter by symbol name
- **Algo Filter**: Filter by candle or zone
- **Min Profit Filter**: Filter by minimum profit percentage
- **Sort Options**: Symbol, Expected Profit, Updated Time
- **Favorites**: Mark signals as favorites and filter by favorites only

### 6. User Interactions
- **Add to Favorites**: Star/unstar signals
- **Favorites View**: Toggle to show only favorite signals
- **Refresh**: Manual refresh of signals

## API Endpoints

### 1. Get Trading Signals
```
GET /api/trading/signals
```

Query Parameters:
- `sortBy`: "type", "symbol", "expectedProfit", "updatedAt"
- `sortOrder`: "asc", "desc"
- `filterBy`: "symbol", "algo", "minProfit"
- `filterValue`: string value for the filter
- `page`: page number (default: 1)
- `limit`: items per page (default: 50)

### 2. Manage Favorites
```
GET /api/trading/favorites     # Get user's favorites
POST /api/trading/favorites    # Add to favorites
DELETE /api/trading/favorites  # Remove from favorites
```

Request Body for POST/DELETE:
```json
{
  "signalId": "string",
  "type": "candle" | "zone"
}
```

## Database Schema Updates

### User Model
Added `tradingFavorites` field:
```typescript
tradingFavorites?: Array<{
  signalId: string
  type: 'candle' | 'zone'
  addedAt: Date
}>
```

## Components

### TradingSignals Component
- **Location**: `/components/TradingSignals.tsx`
- **Props**: `{ token: string }`
- **Features**:
  - Real-time price updates via Binance WebSocket
  - Sorting and filtering capabilities
  - Favorites management
  - Responsive design

## Testing

### Test Data Seeder
Use the admin endpoint to create test data:
```
POST /api/admin/seed-test-data
```

This creates sample candles and zones with the required statuses for testing.

## Integration

The TradingSignals component is integrated into the dashboard and only shows for users with active subscriptions. It automatically connects to Binance WebSocket for real-time price updates.

## WebSocket Connection

The component connects to Binance WebSocket streams for real-time price updates:
- Uses `wss://stream.binance.com:9443/ws/`
- Subscribes to ticker streams for all symbols in the signals
- Shows connection status indicator
- Automatically reconnects on disconnection

## Security

- All endpoints require valid JWT authentication
- Only users with active subscriptions can access the signals
- Favorites are user-specific and secured by authentication
