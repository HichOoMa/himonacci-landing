# Admin Features Documentation

## Overview

This document describes the admin features implemented for managing users and automatic trading permissions.

## Features Implemented

### 1. Admin Role System
- Added `role` field to User model (`user` | `admin`)
- Admins have access to special admin routes and functionality
- Admin status is checked on all admin API endpoints

### 2. Auto-Trading Permission Control
- Added `isAutoTradingAllowed` field to User model
- Admins can forbid/allow users from enabling automatic trading
- When auto-trading is forbidden, it's automatically disabled
- Users cannot disable auto-trading once it's enabled (as per requirement)

### 3. Admin Dashboard
- Comprehensive admin dashboard at `/admin`
- Real-time statistics for users, subscriptions, and auto-trading
- Quick actions for common admin tasks
- Enhanced navigation with admin-specific menu

### 4. User Management
- Complete user management interface at `/admin/users`
- Search and filter users
- Edit user permissions and subscription status
- Toggle auto-trading permissions per user
- Pagination for large user lists

### 5. Auto-Trading Management
- Dedicated auto-trading management page at `/admin/auto-trading`
- View all users with auto-trading status
- Filter by enabled/forbidden users
- Bulk operations to allow/forbid auto-trading for multiple users
- Real-time statistics on auto-trading usage

## API Endpoints

### Admin Authentication
All admin endpoints require:
- Valid JWT token
- User role must be `admin`

### New API Endpoints

#### GET/PUT `/api/admin/users`
- Get paginated list of users with search
- Update user permissions and settings

#### GET `/api/admin/user-stats`
- Get user statistics (total, verified, with API keys, auto-trading active)

#### GET `/api/admin/auto-trading-stats`
- Get auto-trading statistics (enabled, allowed, forbidden users)

#### GET `/api/admin/auto-trading-users`
- Get users with auto-trading information
- Supports filtering by status

#### POST `/api/admin/bulk-auto-trading`
- Bulk update auto-trading permissions for multiple users

#### POST `/api/admin/create-admin` (Development only)
- Create an admin user for testing

## User Interface Changes

### Profile Page Updates
- Auto-trading section now shows permission status
- Visual indicators for forbidden/active states
- Disabled controls when auto-trading is forbidden
- Cannot disable auto-trading once enabled
- Clear error messages for forbidden actions

### New Admin Components
- `NavigationAdmin`: Admin-specific navigation bar
- Enhanced admin dashboard with multiple statistics sections
- User management interface with inline editing
- Auto-trading management with bulk operations

## Security Features

### Auto-Trading Restrictions
1. **Admin Control**: Only admins can control auto-trading permissions
2. **No Disable**: Users cannot disable auto-trading once enabled
3. **Forbidden Override**: Admin can forbid auto-trading, which automatically disables it
4. **API Validation**: All auto-trading API calls validate permissions

### Admin Access Control
1. **Role Verification**: All admin endpoints verify user role
2. **Token Authentication**: Standard JWT authentication required
3. **Production Safety**: Sensitive endpoints disabled in production

## Setup Instructions

### 1. Database Migration
The new fields will be automatically added to existing users with default values:
- `role`: defaults to `'user'`
- `isAutoTradingAllowed`: defaults to `true`

### 2. Create Admin User (Development)
```bash
curl -X POST http://localhost:3000/api/admin/create-admin
```

Or manually create an admin user in the database:
```javascript
{
  role: 'admin',
  // ... other user fields
}
```

### 3. Admin Access
- Navigate to `/admin` to access the admin dashboard
- Use `/admin/users` for user management
- Use `/admin/auto-trading` for auto-trading management

## Navigation Structure

### Admin Routes
- `/admin` - Main dashboard
- `/admin/users` - User management
- `/admin/auto-trading` - Auto-trading management
- `/admin/subscriptions` - Subscription management (future)
- `/admin/analytics` - Analytics (future)
- `/admin/settings` - Settings (future)

### User Flow Changes
1. **Auto-Trading Enable**: Users can only enable if allowed by admin
2. **Auto-Trading Disable**: Not possible once enabled
3. **Permission Check**: Real-time validation of permissions
4. **Error Handling**: Clear messaging for forbidden actions

## Business Logic

### Auto-Trading State Machine
```
Initial State: Disabled & Allowed
     ↓ (User enables)
   Enabled & Allowed
     ↓ (Admin forbids)
   Disabled & Forbidden
     ↓ (Admin allows)
   Disabled & Allowed
```

Note: Once enabled, users cannot disable auto-trading themselves.

### Admin Controls
- **Allow Auto-Trading**: User can enable auto-trading
- **Forbid Auto-Trading**: User cannot enable, and if currently enabled, it gets disabled
- **Bulk Operations**: Apply permission changes to multiple users at once

## Error Handling

### User-Facing Errors
- "Auto trading has been disabled by an administrator"
- "Auto trading cannot be disabled once enabled"
- "Please configure your Binance API keys first"

### Admin Error Handling
- Validation of bulk operations
- Prevention of invalid state changes
- Clear success/error messaging for all actions

## Future Enhancements

1. **Audit Logging**: Track admin actions and user auto-trading changes
2. **Advanced Filtering**: More sophisticated user filtering options
3. **Analytics Dashboard**: Detailed analytics on trading performance
4. **Notification System**: Notify users when permissions change
5. **Subscription Management**: Enhanced subscription controls for admins
