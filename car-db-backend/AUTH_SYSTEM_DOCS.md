# Auth System Documentation

## Overview
The authentication system now includes OTP-based email verification, JWT token-based login, password reset functionality, and email verification middleware.

## API Endpoints

### 1. Send OTP (Registration Start)
**Endpoint:** `POST /api/auth/send-otp`

**Description:** Send an OTP to user's email for email verification during registration.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "data": {
    "email": "user@example.com",
    "otpExpiresIn": "10 minutes"
  }
}
```

**Status Codes:**
- `200`: OTP sent successfully
- `400`: Missing email field
- `500`: Server error

---

### 2. Verify OTP (Complete Registration)
**Endpoint:** `POST /api/auth/verify-otp`

**Description:** Verify the OTP and complete user registration with personal details.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "name": "John Doe",
  "phone": "1234567890",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully. Registration complete",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "phone": "1234567890",
      "verified": true
    }
  }
}
```

**Validation Rules:**
- All fields (email, otp, name, phone, password) are required
- OTP must match the one sent to email
- OTP expires after 10 minutes
- Password must be at least 6 characters

**Status Codes:**
- `200`: Registration completed successfully
- `400`: Invalid OTP, expired OTP, or validation error
- `404`: User not found (OTP might not have been sent)
- `500`: Server error

---

### 3. Login
**Endpoint:** `POST /api/auth/login`

**Description:** Login user with email and password. Only verified users can login.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "phone": "1234567890",
      "role": "user",
      "verified": true
    }
  }
}
```

**Headers Set:**
- `Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict`

**Status Codes:**
- `200`: Login successful
- `400`: Missing email or password
- `401`: Invalid credentials
- `403`: Email not verified
- `500`: Server error

---

### 4. Forgot Password
**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Send password reset email with reset link. Does not reveal if email exists for security.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive a password reset link",
  "data": {
    "email": "user@example.com",
    "expiresIn": "1 hour"
  }
}
```

**Note:** Always returns success message for security, even if email doesn't exist.

**Status Codes:**
- `200`: Email sent (or user not found, but success shown)
- `400`: Missing email field
- `500`: Server error

---

### 5. Reset Password
**Endpoint:** `POST /api/auth/reset-password`

**Description:** Reset user password using the reset token received in email.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newSecurePassword123",
  "confirmPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully. Please login with your new password",
  "data": {
    "email": "user@example.com"
  }
}
```

**Validation Rules:**
- Token must be valid and not expired (1 hour validity)
- Passwords must match
- Password must be at least 6 characters

**Status Codes:**
- `200`: Password reset successfully
- `400`: Invalid/expired token, passwords don't match, or validation error
- `404`: User not found
- `500`: Server error

---

### 6. Refresh Token
**Endpoint:** `POST /api/auth/refresh-token`

**Description:** Get a new access token using the refresh token in cookies.

**Request Headers:**
```
Cookie: refreshToken=<token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user",
      "verified": true
    }
  }
}
```

**Status Codes:**
- `200`: Token refreshed successfully
- `401`: No refresh token, expired token, or invalid token
- `403`: User email not verified
- `500`: Server error

---

### 7. Logout
**Endpoint:** `POST /api/auth/logout`

**Description:** Logout user by clearing refresh token cookie. Requires valid JWT token.

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Status Codes:**
- `200`: Logout successful
- `401`: No token provided
- `500`: Server error

---

## Authentication Flow

### Registration Flow
1. User provides email → `/api/auth/send-otp` sends OTP to email (10 min validity)
2. User receives OTP in email
3. User submits OTP with personal details → `/api/auth/verify-otp` completes registration
4. User is now verified and can login

### Login Flow
1. User provides email & password → `/api/auth/login`
2. System checks if email is verified
3. Returns `accessToken` in response and `refreshToken` in HTTP-only cookie

### Protected Routes
All endpoints requiring authentication should include Authorization header:
```
Authorization: Bearer <accessToken>
```

### Password Reset Flow
1. User clicks "Forgot Password" → `/api/auth/forgot-password`
2. Email with reset link is sent
3. User clicks link with token → redirected to `/reset-password?token=<token>`
4. User submits new password → `/api/auth/reset-password` updates password
5. User can now login with new password

---

## Middleware Usage

### verifyToken
Verifies JWT token and checks if user is verified (email verified).

```javascript
import { verifyToken } from '../middleware/authMiddleware.js';

router.post('/protected-route', verifyToken, controller);
```

**Attached to req:**
- `req.user`: Object containing userId, email, name, role, verified

**Error Responses:**
- `401`: No token, invalid token, or token expired
- `403`: User email not verified
- `404`: User not found
- `500`: Server error

### verifyTokenOnly
Verifies JWT token without checking email verification. Use for routes that don't require verification.

```javascript
import { verifyTokenOnly } from '../middleware/authMiddleware.js';

router.post('/semi-protected', verifyTokenOnly, controller);
```

**Attached to req:**
- `req.userId`: User's MongoDB ID

### isAdmin
Checks if user has admin role. Must be used after `verifyToken`.

```javascript
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

router.post('/admin-route', verifyToken, isAdmin, controller);
```

### isVerified
Explicitly checks if user email is verified. Must be used after `verifyToken`.

```javascript
import { verifyToken, isVerified } from '../middleware/authMiddleware.js';

router.post('/verified-only', verifyToken, isVerified, controller);
```

### verifyRole
Checks if user has specific role. Must be used after `verifyToken`.

```javascript
import { verifyToken, verifyRole } from '../middleware/authMiddleware.js';

router.post('/seller-route', verifyToken, verifyRole('seller'), controller);
```

---

## Environment Variables Required

```env
# Email Configuration
EMAIL_SERVICE="gmail"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASSWORD="your_app_password"

# JWT Configuration
JWT_SECRET="your_jwt_secret_key"
REFRESH_JWT_SECRET="your_refresh_jwt_secret_key"

# Frontend Configuration
FRONTEND_URL="http://localhost:5173"

# MongoDB
MONGO_URI="your_mongodb_connection_string"
```

---

## Frontend Integration Example

### Registration
```javascript
// Step 1: Send OTP
const sendOTP = async (email) => {
  const response = await axios.post('http://localhost:3000/api/auth/send-otp', { email });
  return response.data;
};

// Step 2: Verify OTP and Complete Registration
const verifyOTP = async (email, otp, name, phone, password) => {
  const response = await axios.post('http://localhost:3000/api/auth/verify-otp', {
    email,
    otp,
    name,
    phone,
    password,
  });
  return response.data;
};
```

### Login
```javascript
const login = async (email, password) => {
  const response = await axios.post(
    'http://localhost:3000/api/auth/login',
    { email, password },
    { withCredentials: true } // Important for cookies
  );
  // Store accessToken in localStorage or state
  localStorage.setItem('accessToken', response.data.accessToken);
  return response.data;
};
```

### Protected API Calls
```javascript
const protectedApiCall = async (url, data) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(url, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return response.data;
};
```

### Password Reset
```javascript
const forgotPassword = async (email) => {
  const response = await axios.post('http://localhost:3000/api/auth/forgot-password', { email });
  return response.data;
};

const resetPassword = async (token, newPassword, confirmPassword) => {
  const response = await axios.post('http://localhost:3000/api/auth/reset-password', {
    token,
    newPassword,
    confirmPassword,
  });
  return response.data;
};
```

---

## Error Handling

All endpoints follow consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "error details"
}
```

Common error scenarios:
- `400 Bad Request`: Validation errors (missing fields, invalid data)
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Access denied (not verified, wrong role)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

---

## Security Features

1. **Password Hashing**: Passwords are hashed using bcryptjs before storage
2. **JWT Tokens**: Secure token-based authentication
3. **HTTP-Only Cookies**: Refresh tokens stored in HTTP-only cookies (CSRF protection)
4. **Token Expiry**: 
   - Access tokens: 15 minutes
   - Refresh tokens: 7 days
   - OTP: 10 minutes
   - Reset tokens: 1 hour
5. **CORS**: Configured to accept requests only from frontend origin
6. **Email Verification**: Users must verify email before full account access
