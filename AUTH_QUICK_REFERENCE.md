# Quick Reference: Auth System

## 🔐 Authentication Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/auth/send-otp` | Start registration, send OTP | No |
| POST | `/api/auth/verify-otp` | Complete registration with OTP | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Complete password reset | No |
| POST | `/api/auth/refresh-token` | Get new access token | Refresh token cookie |
| POST | `/api/auth/logout` | Logout user | Yes (JWT) |

---

## 📝 Registration Flow (2-Step)

### Step 1: Send OTP
```javascript
const response = await axios.post('http://localhost:3000/api/auth/send-otp', {
  email: 'user@example.com'
});
// Response: { success: true, message: "OTP sent...", data: {...} }
```

### Step 2: Verify OTP & Create Account
```javascript
const response = await axios.post('http://localhost:3000/api/auth/verify-otp', {
  email: 'user@example.com',
  otp: '123456',  // 6-digit code from email
  name: 'John Doe',
  phone: '1234567890',
  password: 'SecurePass123'
});
// Response: { success: true, user: {...}, message: "Registration complete" }
```

---

## 🔑 Login

```javascript
const response = await axios.post('http://localhost:3000/api/auth/login', 
  {
    email: 'user@example.com',
    password: 'SecurePass123'
  },
  { withCredentials: true }  // Important for cookies
);

// Store access token
localStorage.setItem('accessToken', response.data.accessToken);
// RefreshToken automatically in cookie

// Response:
// {
//   success: true,
//   accessToken: 'eyJhbGc...',
//   data: { user: {...} }
// }
```

---

## 🛡️ Using Protected Routes

### Add Middleware to Route
```javascript
// In your router file
import { verifyToken } from '../middleware/authMiddleware.js';

router.post('/create-car-post', verifyToken, carPostController.create);
```

### Available Middleware
- `verifyToken` - Checks JWT + email verified
- `verifyTokenOnly` - Checks JWT only
- `isAdmin` - Checks admin role (use after verifyToken)
- `isVerified` - Checks email verified (use after verifyToken)
- `verifyRole('role')` - Check specific role (use after verifyToken)

### Making Protected API Calls (Frontend)
```javascript
const token = localStorage.getItem('accessToken');

const response = await axios.post(
  'http://localhost:3000/api/cars/create',
  { /* data */ },
  {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    withCredentials: true
  }
);
```

---

## 🔄 Token Refresh (Auto)

```javascript
// Call when access token expires (401 response)
const response = await axios.post(
  'http://localhost:3000/api/auth/refresh-token',
  {},
  { withCredentials: true }  // Important for refresh token cookie
);

// Get new access token
localStorage.setItem('accessToken', response.data.accessToken);
```

---

## 🔓 Password Reset

### Step 1: Request Reset
```javascript
const response = await axios.post('http://localhost:3000/api/auth/forgot-password', {
  email: 'user@example.com'
});
// Email sent with reset link
```

### Step 2: User Clicks Email Link
User gets: `http://yourfrontend.com/reset-password?token=<token>`

### Step 3: Submit New Password
```javascript
const response = await axios.post('http://localhost:3000/api/auth/reset-password', {
  token: urlParams.get('token'),  // From URL
  newPassword: 'NewSecurePass123',
  confirmPassword: 'NewSecurePass123'
});
// Password changed, user can now login
```

---

## 🚪 Logout

```javascript
const token = localStorage.getItem('accessToken');

const response = await axios.post(
  'http://localhost:3000/api/auth/logout',
  {},
  {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    withCredentials: true
  }
);

// Clear frontend storage
localStorage.removeItem('accessToken');
// Refresh token cookie auto-cleared by backend
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
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

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

---

## ⏱️ Token Validity

| Token | Validity | Storage |
|-------|----------|---------|
| Access Token | 15 minutes | localStorage |
| Refresh Token | 7 days | HTTP-only Cookie |
| OTP | 10 minutes | Database |
| Reset Token | 1 hour | Database |

---

## 🔍 HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Login successful |
| 201 | Created | User created |
| 400 | Bad Request | Invalid OTP, missing fields |
| 401 | Unauthorized | No token, expired token |
| 403 | Forbidden | Email not verified, not admin |
| 404 | Not Found | User not found |
| 500 | Server Error | Email send failed |

---

## 🛠️ Common Tasks

### Check if User is Logged In (Frontend)
```javascript
const token = localStorage.getItem('accessToken');
const isLoggedIn = !!token;
```

### Decode JWT (Frontend)
```javascript
const decodeJWT = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map((c) => '%' + c.charCodeAt(0).toString(16)).join('')
  );
  return JSON.parse(jsonPayload);
};

const payload = decodeJWT(token);
console.log(payload.userId, payload.email, payload.role);
```

### Auto-Refresh Token (Frontend)
```javascript
// Call on app startup or when token is about to expire
const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/auth/refresh-token',
      {},
      { withCredentials: true }
    );
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    // Redirect to login
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  }
};
```

### Add Auth Interceptor (Frontend - Axios)
```javascript
// Add this to your API setup
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await axios.post(
          'http://localhost:3000/api/auth/refresh-token',
          {},
          { withCredentials: true }
        );
        
        const newToken = response.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        return axios(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## 🚨 Error Handling

### OTP Errors
- **"Invalid OTP"** - Wrong code entered
- **"OTP has expired"** - Took more than 10 minutes
- **"User not found"** - Email not sent OTP first

### Login Errors
- **"Invalid credentials"** - Wrong email/password
- **"Please verify your email"** - Account not verified yet

### Token Errors
- **"No token provided"** - Missing Authorization header
- **"Token has expired"** - Token older than 15 minutes
- **"Invalid token"** - Malformed or tampered token
- **"User email not verified"** - Email verification required

---

## 📧 Email Environment Setup

### For Gmail
1. Enable 2FA on Google Account
2. Generate App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password

3. Set in .env:
```
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="16-character-app-password"
```

### For Other Email Services
```
EMAIL_SERVICE="yahoo|outlook|aol|etc"
EMAIL_USER="your-email@service.com"
EMAIL_PASSWORD="your-password"
```

---

## 🔗 Important Links

- **JWT Info**: https://jwt.io/
- **Nodemailer Docs**: https://nodemailer.com/
- **Bcryptjs**: https://github.com/dcodeIO/bcrypt.js
- **Mongoose Docs**: https://mongoosejs.com/

---

## ✅ Checklist for Implementation

- [ ] Run backend server: `node index.js`
- [ ] Set EMAIL config in .env
- [ ] Set FRONTEND_URL in .env
- [ ] Create registration form (2 steps)
- [ ] Create login form
- [ ] Create forgot password form
- [ ] Create reset password form
- [ ] Add logout button
- [ ] Store accessToken in localStorage
- [ ] Add Authorization header to API calls
- [ ] Handle 401 responses with token refresh
- [ ] Test all auth flows
- [ ] Test protected routes with middleware

---

**Last Updated**: Dec 15, 2024  
**Backend Port**: 3000  
**Frontend Port**: 5173  
**Database**: MongoDB Atlas
