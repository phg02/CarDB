# Security Improvements: JWT-Based User ID Implementation

## Overview
Implemented a secure, session-based approach for handling user identification instead of accepting user IDs directly from client requests. This significantly improves security by leveraging JWT tokens for authentication.

## Changes Made

### 1. Backend Controller Updates

#### CarPostController.js
- **`initiateCarPost` function**
  - **Before**: Retrieved `sellerId` from `req.params.sellerId`
  - **After**: Extracts `sellerId` from `req.user.userId` (from JWT token)
  - **Benefit**: Users cannot impersonate other sellers by manipulating the request URL

- **`getCarPostsBySeller` function**
  - **Before**: Retrieved `sellerId` from `req.params.sellerId`
  - **After**: Extracts `sellerId` from `req.user.userId` (from JWT token)
  - **Benefit**: Users can only view their own car postings

#### OrderController.js
- **`getCustomerOrders` function**
  - **Before**: Retrieved `customerId` from `req.params.customerId`
  - **After**: Extracts `customerId` from `req.user.userId` (from JWT token)
  - **Benefit**: Users cannot view other customers' orders

- **`getOrderStats` function**
  - **Before**: Retrieved `sellerId` from `req.params.sellerId`
  - **After**: Extracts `sellerId` from `req.user.userId` (from JWT token)
  - **Benefit**: Sellers can only view their own statistics

### 2. Backend Route Updates

#### CarPostRouter.js
```javascript
// BEFORE
router.post('/initiate/:sellerId', upload.array('photos', 10), carPostController.initiateCarPost);
router.get('/seller/:sellerId', carPostController.getCarPostsBySeller);

// AFTER
router.post('/initiate', verifyToken, upload.array('photos', 10), carPostController.initiateCarPost);
router.get('/seller', verifyToken, carPostController.getCarPostsBySeller);
```

#### OrderRouter.js
```javascript
// BEFORE
router.get('/customer/:customerId', getCustomerOrders);
router.get('/seller/:sellerId/stats', getOrderStats);

// AFTER
router.get('/customer', verifyToken, getCustomerOrders);
router.get('/seller/stats', verifyToken, getOrderStats);
```

### 3. Frontend Updates

#### SellCar.jsx Component
- **Added JWT token integration**: Form now sends JWT token in Authorization header
- **Added form submission handler**: Captures form data and sends to `/api/cars/initiate` endpoint
- **Added error handling**: Displays error messages and loading states
- **Removed manual user ID**: No longer requires manual entry or passing of seller ID
- **Security note**: User ID is securely extracted from JWT token on the backend

```javascript
// SECURITY: User ID is extracted from JWT token on the backend
// No need to send sellerId in the request
const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/cars/initiate`,
    {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`, // Send JWT token
        },
        body: submitData,
    }
);
```

## Security Benefits

### 1. **Prevents User Impersonation**
- Users cannot claim to be another seller by modifying the URL
- User ID is cryptographically verified through the JWT token

### 2. **Prevents Unauthorized Access**
- `/api/cars/seller` endpoint now requires authentication
- `/api/orders/customer` endpoint now requires authentication
- `/api/orders/seller/stats` endpoint now requires authentication

### 3. **Token-Based Authentication**
- All authenticated endpoints now use `verifyToken` middleware
- Tokens include user verification status
- Invalid or expired tokens are rejected at middleware level

### 4. **Audit Trail**
- All operations are tied to the authenticated user's JWT claims
- Makes it easier to track who performed which actions

## Implementation Details

### JWT Token Flow
1. User logs in and receives JWT token
2. Token is stored securely on the frontend (localStorage/sessionStorage)
3. Token is sent in Authorization header for authenticated requests
4. Backend validates token and extracts user ID from token claims
5. Operations are performed on behalf of the authenticated user

### Middleware: verifyToken
The `verifyToken` middleware (in authMiddleware.js) performs:
- Token signature verification
- Token expiration check
- User existence verification
- User email verification status check
- User information attachment to request object

### Code Pattern
```javascript
// In controller functions
const userId = req.user.userId; // Secure way to get user ID

// Instead of:
const userId = req.params.userId; // INSECURE - client controlled
```

## Testing Recommendations

1. **Test authenticated endpoints without token**
   - Should return 401 Unauthorized

2. **Test with invalid/expired token**
   - Should return 401 Unauthorized

3. **Test user isolation**
   - Seller A cannot view/edit Seller B's posts
   - Customer A cannot view Customer B's orders

4. **Test cross-origin requests**
   - Ensure CORS is properly configured
   - Token validation works across domains

## Files Modified
- `/car-db-backend/controller/CarPostController.js`
- `/car-db-backend/controller/OrderController.js`
- `/car-db-backend/api_routes/CarPostRouter.js`
- `/car-db-backend/api_routes/OrderRouter.js`
- `/car-db-frontend/src/pages/SellCar.jsx`

## Migration Notes
- Existing API clients need to update their requests to remove `:sellerId` and `:customerId` from URLs
- All authenticated endpoints now require JWT token in Authorization header
- Route ordering in routers is important (specific routes before wildcard routes)

## Future Considerations
- Implement rate limiting on authentication endpoints
- Add request signing/verification for sensitive operations
- Implement refresh token rotation
- Add audit logging for all user operations
- Consider implementing field-level access control
