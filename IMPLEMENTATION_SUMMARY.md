# Auth System Implementation Summary

## What Was Added

### 1. Enhanced User Model (`/model/User.js`)
Added fields for OTP verification and password reset:
- `verified` (Boolean): Tracks if email is verified
- `otp` (String): Stores one-time password
- `otpExpire` (Date): OTP expiration time
- `resetPasswordToken` (String): Token for password reset
- `resetPasswordExpire` (Date): Password reset token expiration

### 2. Auth Controller (`/controller/authController.js`)
Complete rewrite with 7 functions:

#### OTP-Based Registration
- **`sendOTP()`**: Generates and sends 6-digit OTP to email (10 min validity)
- **`verifyOTP()`**: Verifies OTP, creates user account with personal details

#### Authentication
- **`login()`**: Authenticates user, checks email verification status
  - Returns access token in response + refresh token in HTTP-only cookie
  - Prevents unverified users from logging in

#### Password Recovery
- **`forgotPassword()`**: Initiates password reset flow
  - Generates reset token (1 hour validity)
  - Sends reset link to email
  - Doesn't reveal if email exists (security best practice)
  
- **`resetPassword()`**: Completes password reset with validation
  - Validates token, password strength, and matching
  - Updates password hash, clears reset token

#### Token Management
- **`refreshToken()`**: Issues new access token using refresh token
  - Validates user still exists and email is verified
  - Returns new access token

- **`logout()`**: Clears refresh token cookie
  - Requires valid JWT token

### 3. Auth Middleware (`/middleware/authMiddleware.js`)
Comprehensive middleware suite:

- **`verifyToken()`**: Validates JWT + checks email verification
  - Extracts token from Authorization header
  - Verifies token signature and expiry
  - Checks user exists in database
  - Ensures user email is verified
  - Attaches `req.user` with userId, email, name, role, verified

- **`verifyTokenOnly()`**: Validates JWT without verification requirement
  - Lighter weight for endpoints that don't need email verification
  - Attaches `req.userId` to request

- **`isAdmin()`**: Role-based access control for admin
  - Must be used after `verifyToken()`
  - Checks if user.role === 'admin'

- **`isVerified()`**: Explicitly verifies email verification status
  - Must be used after `verifyToken()`

- **`verifyRole()`**: Generic role-based access control
  - Configurable to check for any role

### 4. Email Service (`/services/emailExamples.js`)
Professional email templates:

- **`sendOTPEmail()`**: OTP verification email with 10-min countdown
- **`sendPasswordResetEmail()`**: Password reset email with 1-hour countdown and security note
- **`sendWelcomeEmail()`**: Welcome email after successful registration
- **`sendOrderConfirmationEmail()`**: Order confirmation with details

All emails use HTML templates with proper styling and branding.

### 5. Updated Auth Router (`/api_routes/authRouter.js`)
7 endpoints:

```
POST /api/auth/send-otp           - Start registration
POST /api/auth/verify-otp         - Complete registration
POST /api/auth/login              - User login
POST /api/auth/forgot-password    - Initiate password reset
POST /api/auth/reset-password     - Complete password reset
POST /api/auth/refresh-token      - Get new access token
POST /api/auth/logout             - Logout (requires token)
```

### 6. Environment Variables
Updated `.env` with:
- `FRONTEND_URL`: For password reset links
- `EMAIL_SERVICE`: Email provider (Gmail)
- `EMAIL_USER`: Sender email
- `EMAIL_PASSWORD`: Email app password
- `CLOUDINARY_*`: Image upload credentials
- `NODE_ENV`: Environment mode

---

## How It Works

### User Registration (Two-Step Process)
1. User enters email → `POST /api/auth/send-otp`
2. System generates 6-digit OTP, stores in DB (10 min expiry), sends email
3. User receives OTP in email
4. User submits OTP + details (name, phone, password) → `POST /api/auth/verify-otp`
5. System verifies OTP, creates user account, marks as `verified: true`
6. User now can login

### User Login
1. User submits email + password → `POST /api/auth/login`
2. System validates credentials
3. System checks if `user.verified === true` (must be verified)
4. If verified, generates JWT tokens
5. Returns `accessToken` in response, `refreshToken` in HTTP-only cookie
6. Frontend stores `accessToken` and uses for API calls

### Protected Routes
Add `verifyToken` middleware to any route:
```javascript
router.post('/protected-route', verifyToken, controller);
```
- Automatically validates JWT
- Checks email verification
- Prevents unverified users from accessing

### Password Recovery
1. User clicks "Forgot Password" → `POST /api/auth/forgot-password`
2. System finds user by email, generates reset token (1 hour valid)
3. Sends email with reset link containing token
4. User clicks link, gets redirected to frontend with token
5. User submits new password → `POST /api/auth/reset-password`
6. System validates token, updates password
7. User can now login with new password

### Token Refresh
- Access token: 15 minutes validity
- When expired, frontend calls `POST /api/auth/refresh-token`
- Uses refresh token from cookies (automatically sent)
- Returns new access token

---

## Key Features

✅ **Email Verification Required**: Users must verify email before accessing features
✅ **OTP-Based Signup**: Secure email verification with 6-digit OTP
✅ **Password Reset**: Forgot password flow with time-limited tokens
✅ **Dual Token System**: Short-lived access token + long-lived refresh token
✅ **HTTP-Only Cookies**: Refresh tokens in secure, httpOnly cookies
✅ **Consistent Response Format**: All endpoints follow `{success, message, data}` structure
✅ **Comprehensive Error Handling**: Detailed error messages for debugging
✅ **Role-Based Access Control**: Support for admin and user roles
✅ **Email Templates**: Professional HTML emails with styling
✅ **Security Best Practices**:
  - Passwords hashed with bcryptjs
  - JWT signed and validated
  - Token expiry enforced
  - CORS configured
  - Sensitive info not leaked (e.g., forgot password doesn't confirm if email exists)

---

## Testing the Endpoints

### Test Send OTP
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test Verify OTP
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "otp":"123456",
    "name":"John Doe",
    "phone":"1234567890",
    "password":"password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Protected Route
```bash
curl -X POST http://localhost:3000/api/protected-route \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json"
```

---

## Files Modified/Created

### Created:
- `/services/emailExamples.js` - Email templates
- `/middleware/authMiddleware.js` - Auth middleware (updated)
- `/AUTH_SYSTEM_DOCS.md` - Full documentation

### Modified:
- `/controller/authController.js` - Complete rewrite with 7 functions
- `/model/User.js` - Added OTP and reset fields
- `/api_routes/authRouter.js` - Updated with 7 endpoints
- `/.env` - Added email and frontend URL config

### Existing (unchanged):
- `/services/emailService.js` - Core email sending
- `/index.js` - Already has auth router registered

---

## Next Steps for Frontend

1. **Update Register Flow**:
   - Create 2-step form: email (send OTP) → details + OTP verification

2. **Update Login**:
   - Store `accessToken` in localStorage or state
   - Store `refreshToken` automatically in cookie
   - Check `verified` field

3. **Add Protected Routes**:
   - Add middleware to check if user has `accessToken`
   - If token expired, call refresh-token endpoint

4. **Add Forgot Password**:
   - Create forgot password form
   - Add reset password form for `/reset-password?token=<token>` route

5. **Logout**:
   - Call `/api/auth/logout` endpoint
   - Clear `accessToken` from storage
   - Redirect to login

---

## Token Lifecycle

```
User Registration (2 days)
    ↓
Email Verified (via OTP)
    ↓
Login → accessToken (15 min) + refreshToken (7 days)
    ↓
Access Protected Routes (uses accessToken)
    ↓
Access Token Expires → Call /refresh-token
    ↓
Get New accessToken (15 min) using refreshToken
    ↓
Continue Using Service
    ↓
Logout → Clear Tokens
```

---

## Security Checklist

✅ Passwords hashed with bcryptjs (salt rounds: 10)
✅ JWT tokens signed with secret key
✅ Refresh tokens in HTTP-only, Secure, SameSite cookies
✅ CORS configured for localhost:5173 only
✅ Email verification required before login
✅ Token expiry enforced (accessToken: 15m, refreshToken: 7d, OTP: 10m)
✅ Password reset tokens single-use, time-limited (1 hour)
✅ Sensitive info not exposed (forgot password doesn't confirm email exists)
✅ Rate limiting recommended (not yet implemented)
✅ HTTPS required for production (NODE_ENV check)

---

## Troubleshooting

### Email not sending
- Check `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD` in .env
- For Gmail, use app-specific password (not regular password)
- Enable "Less secure apps" if using Gmail account

### OTP not received
- Check email spam folder
- Check EMAIL_USER is correct
- Verify MONGO_URI is correct

### Token validation fails
- Ensure `Authorization: Bearer <token>` format is correct
- Check token hasn't expired
- Verify JWT_SECRET is same in .env

### User can't login after verifying
- Check `user.verified` is `true` in database
- Verify password hash is correct

### CORS errors
- Check FRONTEND_URL matches vite dev server (usually localhost:5173)
- Ensure `credentials: true` is set in axios calls for cookie handling
