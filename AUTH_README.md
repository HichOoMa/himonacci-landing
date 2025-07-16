# HiMonacci Authentication System

This authentication system provides secure user registration, login, and password reset functionality for the HiMonacci trading platform.

## Features

### 🔐 Authentication Pages
- **Register**: New user registration with form validation
- **Login**: User authentication with remember me option
- **Forgot Password**: Password reset request
- **Reset Password**: Set new password with token validation

### 🛡️ Security Features
- Password hashing with bcrypt (salt rounds: 12)
- JWT token-based authentication
- Token expiration handling
- Input validation with Zod schemas
- Protected routes with middleware

### 🎨 Design Features
- Consistent with HiMonacci brand design
- Glass morphism effects
- Smooth animations with Framer Motion
- Responsive design for all devices
- Loading states and error handling

## Setup Instructions

### 1. Install Dependencies
```bash
npm install bcryptjs jsonwebtoken next-auth react-hook-form @hookform/resolvers zod
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

### 2. Environment Variables
Create a `.env.local` file in your project root:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/himonacci

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# Base URL for password reset emails
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Database Setup
Make sure MongoDB is running on your system or use a cloud MongoDB service like MongoDB Atlas.

## File Structure

```
pages/
├── login.tsx              # Login page
├── register.tsx           # Registration page
├── forgot-password.tsx    # Password reset request
├── reset-password.tsx     # Password reset form
├── dashboard.tsx          # Protected dashboard
└── api/auth/
    ├── register.ts        # Registration API
    ├── login.ts           # Login API
    ├── forgot-password.ts # Password reset request API
    ├── reset-password.ts  # Password reset API
    ├── validate-reset-token.ts # Token validation API
    └── me.ts              # Get current user API

components/
└── Navigation.tsx         # Updated with auth links

contexts/
└── AuthContext.tsx        # Authentication state management

lib/
└── mongodb.ts             # Database connection

models/
└── User.ts                # User model with password hashing

middleware/
└── auth.ts                # Authentication middleware
```

## Usage

### 1. Navigation
The navigation component automatically shows login/register buttons for unauthenticated users.

### 2. Protected Routes
Use the `useAuth` hook to protect routes:

```tsx
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedPage() {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!isAuthenticated) {
    // Redirect to login or show unauthorized message
    return <div>Please login to access this page</div>
  }

  return <div>Welcome {user.firstName}!</div>
}
```

### 3. API Authentication
For protected API routes, use the authentication middleware:

```tsx
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  authenticateToken(req as AuthenticatedRequest, res, () => {
    const { user } = req as AuthenticatedRequest
    // Handle authenticated request
  })
}
```

### 4. Making Authenticated Requests
Include the JWT token in the Authorization header:

```tsx
const token = localStorage.getItem('token')
const response = await fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})
```

## Form Validation

All forms use Zod for validation:

### Registration Schema
- First name: minimum 2 characters
- Last name: minimum 2 characters
- Email: valid email format
- Password: minimum 8 characters
- Confirm password: must match password
- Terms acceptance: required

### Login Schema
- Email: valid email format
- Password: required

## Password Reset Flow

1. User enters email on forgot password page
2. System generates JWT token with 1-hour expiration
3. Reset link is logged to console (in production, send via email)
4. User clicks link and enters new password
5. Token is validated and password is updated

## Security Notes

- Passwords are hashed using bcrypt with 12 salt rounds
- JWT tokens expire after 7 days (30 days with "remember me")
- Password reset tokens expire after 1 hour
- All sensitive operations are protected with authentication middleware
- User passwords are never returned in API responses

## Production Considerations

1. **Environment Variables**: Change JWT_SECRET to a strong, random secret
2. **Database**: Use MongoDB Atlas or a production database
3. **Email Service**: Implement email sending for password resets
4. **Rate Limiting**: Add rate limiting to prevent brute force attacks
5. **HTTPS**: Always use HTTPS in production
6. **Session Management**: Consider implementing refresh tokens for better security

## Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running and connection string is correct
2. **JWT Errors**: Check that JWT_SECRET is set in environment variables
3. **CORS Issues**: Ensure proper CORS configuration for production
4. **Form Validation**: Check that all required fields are filled correctly

### Development Commands

```bash
# Start development server
npm run dev

# Check for TypeScript errors
npm run type-check

# Run linting
npm run lint
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/validate-reset-token` | Validate reset token |
| GET | `/api/auth/me` | Get current user (protected) |

## Contributing

When adding new authentication features:

1. Follow the existing code patterns
2. Use TypeScript for type safety
3. Include proper error handling
4. Add form validation where needed
5. Maintain the design consistency
6. Test all authentication flows

## License

This authentication system is part of the HiMonacci project and follows the same license terms.
