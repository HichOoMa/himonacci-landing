# Subscription Management System

## Overview
This system provides comprehensive subscription management for monthly USDT payments with automatic verification and status tracking.

## Features
- ✅ Monthly subscription payments via USDT (TRC20, ERC20, BEP20)
- ✅ Automatic blockchain transaction verification
- ✅ Subscription status tracking (active, expired, cancelled, grace period)
- ✅ Automated monthly renewal checks
- ✅ Grace period management (7 days by default)
- ✅ Admin dashboard for subscription management
- ✅ Cron job automation for background processing

## Architecture

### Core Components

#### 1. Subscription Model (`/models/Subscription.ts`)
- Tracks subscription lifecycle
- Manages payment history
- Handles grace period logic
- Supports auto-renewal functionality

#### 2. Subscription Manager (`/lib/subscriptionManager.ts`)
- `createSubscription()` - Creates/extends subscriptions
- `getUserSubscription()` - Gets user subscription details
- `checkSubscriptionStatus()` - Validates current status
- `processMonthlyChecks()` - Batch processes all subscriptions
- `cancelSubscription()` - Cancels active subscriptions

#### 3. Cron Service (`/lib/subscriptionCron.ts`)
- Daily checks at 2 AM UTC
- Hourly checks for immediate updates
- Graceful shutdown handling
- Manual trigger support

### API Endpoints

#### Payment Verification
- `POST /api/payment/verify` - Verifies USDT transactions and updates subscriptions

#### Subscription Management
- `GET /api/subscription/status` - Get user's subscription status
- `POST /api/subscription/cancel` - Cancel user's subscription

#### Admin Endpoints
- `POST /api/admin/subscription-checks` - Manual subscription checks
- `GET /api/admin/cron` - Get cron job status
- `POST /api/admin/cron` - Manage cron jobs (start/stop/trigger)

### Environment Variables

Required environment variables:
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/himonacci

# Admin
ADMIN_EMAIL=admin@himonacci.com
ENABLE_CRON=true

# Wallet Addresses
USDT_TRC20_ADDRESS=your-tron-address
USDT_ERC20_ADDRESS=your-ethereum-address
USDT_BEP20_ADDRESS=your-bsc-address

# API Keys
TRON_API_KEY=your-trongrid-api-key
ETHERSCAN_API_KEY=your-etherscan-api-key
BSCSCAN_API_KEY=your-bscscan-api-key

# Contract Addresses
USDT_ERC20_CONTRACT=0xdAC17F958D2ee523a2206206994597C13D831ec7
USDT_BEP20_CONTRACT=0x55d398326f99059fF775485246999027B3197955
```

## Usage

### For Users
1. **Subscribe**: Make USDT payment to provided address
2. **Verify**: Enter transaction hash in payment modal
3. **Monitor**: Check subscription status in dashboard
4. **Renew**: Make payment before expiration
5. **Cancel**: Use cancel button in dashboard

### For Admins
1. **Access Admin Panel**: Visit `/admin` (requires admin email)
2. **View Statistics**: Monitor subscription metrics
3. **Manage Cron Jobs**: Start/stop/trigger manual checks
4. **Process Checks**: Run subscription status updates

## Subscription Lifecycle

### States
1. **Active**: Subscription is valid and active
2. **Expired**: Subscription has expired, grace period active
3. **Cancelled**: User cancelled subscription
4. **Inactive**: No subscription or grace period expired

### Grace Period
- **Duration**: 7 days after expiration
- **Purpose**: Allow users to renew without losing access
- **Automatic**: Transitions to cancelled after grace period

### Monthly Processing
- **Frequency**: Daily at 2 AM UTC + Hourly checks
- **Actions**:
  - Check expiration dates
  - Start grace periods
  - Cancel expired subscriptions
  - Update user access status

## Payment Networks

### TRON (TRC20)
- **Token**: USDT-TRC20
- **API**: TronGrid
- **Confirmations**: 20 blocks
- **Verification**: Real-time transaction lookup

### Ethereum (ERC20)
- **Token**: USDT-ERC20
- **API**: Etherscan
- **Confirmations**: 12 blocks
- **Contract**: 0xdAC17F958D2ee523a2206206994597C13D831ec7

### BSC (BEP20)
- **Token**: USDT-BEP20
- **API**: BscScan
- **Confirmations**: 12 blocks
- **Contract**: 0x55d398326f99059fF775485246999027B3197955

## Security Features

- ✅ JWT-based authentication
- ✅ Admin role verification
- ✅ Transaction hash validation
- ✅ Blockchain verification
- ✅ Duplicate payment prevention
- ✅ Secure environment variables

## Monitoring & Analytics

### Dashboard Metrics
- Total subscriptions
- Active subscriptions
- Expired subscriptions
- Grace period subscriptions
- Total revenue
- Cancellation rate

### Logging
- Payment verifications
- Subscription status changes
- Cron job execution
- Error tracking

## Development

### Running Locally
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

### Testing Subscription Flow
1. Create test user account
2. Use testnet wallet addresses
3. Make test USDT transfer
4. Verify transaction in payment modal
5. Check subscription status updates

## Deployment

### Production Considerations
- Set `ENABLE_CRON=true` for automatic processing
- Configure production database
- Set up proper API keys
- Monitor cron job execution
- Set up log aggregation
- Configure email notifications (optional)

### Scaling
- MongoDB indexing for performance
- Redis caching for frequent queries
- Load balancing for high traffic
- Database sharding for large datasets

## Troubleshooting

### Common Issues
1. **Cron jobs not running**: Check `ENABLE_CRON` environment variable
2. **Payment not verified**: Verify API keys and network selection
3. **Subscription not updating**: Check MongoDB connection and logs
4. **Grace period not working**: Verify subscription model logic

### Debug Commands
```bash
# Check cron status
curl -X GET /api/admin/cron

# Trigger manual check
curl -X POST /api/admin/cron -d '{"action": "trigger"}'

# Get subscription stats
curl -X POST /api/admin/subscription-checks
```

## Future Enhancements

- [ ] Email notifications for renewals
- [ ] Webhook support for external integrations
- [ ] Multi-tier subscription plans
- [ ] Discount codes and promotions
- [ ] Refund management
- [ ] Advanced analytics dashboard
- [ ] Mobile app integration
- [ ] Auto-renewal with stored payment methods
