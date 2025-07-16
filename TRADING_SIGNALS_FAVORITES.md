# Trading Signals - Favorites Feature

## Overview
The trading signals table now includes a favorites system that allows users to save and quickly access their preferred trading signals.

## How It Works

### 1. Favorites Toggle Button
- Users can click the "Favorites" button in the filters section
- When active, the button shows a filled heart icon and only displays favorite signals
- When inactive, it shows all signals (with 24-hour restriction)

### 2. Adding/Removing Favorites
- Each signal row has a heart icon button in the Actions column
- Click the heart to add a signal to favorites (filled heart)
- Click again to remove from favorites (empty heart)
- Favorites are saved per user in the database

### 3. API Behavior
- **Regular mode**: Shows signals from last 24 hours only
- **Favorites mode**: Shows ALL favorite signals regardless of age
- This allows users to track older signals they're interested in

### 4. Real-time Updates
- When favorites mode is active, signals are fetched from the API based on user's favorites list
- No client-side filtering is applied - the API handles everything
- Real-time price updates from Binance WebSocket still work for favorite signals

## Database Schema

### User Model Addition
```typescript
tradingFavorites: [{
  signalId: { type: String, required: true },
  type: { type: String, enum: ['candle', 'zone'], required: true },
  addedAt: { type: Date, default: Date.now },
}]
```

## API Endpoints

### `/api/trading/signals`
- **New parameter**: `favoritesOnly=true|false`
- When `true`: Returns favorite signals without time restriction
- When `false`: Returns recent signals with 24-hour restriction

### `/api/trading/favorites`
- **GET**: Get user's favorites list
- **POST**: Add signal to favorites
- **DELETE**: Remove signal from favorites

## Features
- ✅ Favorites persist across sessions
- ✅ Real-time price updates for favorite signals
- ✅ No time restriction on favorite signals
- ✅ Visual indicators for favorite status
- ✅ Seamless switching between all signals and favorites
- ✅ Binance WebSocket integration for live prices

## Usage Example
1. User browses recent signals
2. Finds an interesting signal and clicks the heart icon
3. Signal is added to favorites
4. User clicks "Favorites" button to see only saved signals
5. Can see the signal even if it's older than 24 hours
6. Still gets real-time price updates from Binance
