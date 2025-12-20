# API Endpoint Changes - Quick Reference

## Updated Endpoints

### Car Posting Endpoints

#### 1. Initiate Car Post (Sell Car)
```
OLD: POST /api/cars/initiate/:sellerId
NEW: POST /api/cars/initiate

Headers:
- Authorization: Bearer {JWT_TOKEN}

Body: FormData with car details and photos
Response: { postingFeeId, amount, ... }
```

#### 2. Get Seller's Car Posts
```
OLD: GET /api/cars/seller/:sellerId?page=1&limit=10
NEW: GET /api/cars/seller?page=1&limit=10

Headers:
- Authorization: Bearer {JWT_TOKEN}

Response: { orders: [...], pagination: {...} }
```

### Order Endpoints

#### 3. Get Customer Orders
```
OLD: GET /api/orders/customer/:customerId?page=1&limit=10
NEW: GET /api/orders/customer?page=1&limit=10

Headers:
- Authorization: Bearer {JWT_TOKEN}

Response: { orders: [...], pagination: {...} }
```

#### 4. Get Seller Order Statistics
```
OLD: GET /api/orders/seller/:sellerId/stats
NEW: GET /api/orders/seller/stats

Headers:
- Authorization: Bearer {JWT_TOKEN}

Response: { totalOrders, completedOrders, pendingOrders, totalRevenue }
```

## Authentication Requirement

All updated endpoints now require:
```
Authorization: Bearer {JWT_TOKEN}
```

Where `JWT_TOKEN` is obtained from the login endpoint.

## Frontend Integration Example

```javascript
// Get JWT token from auth context
const { token } = useAuth();

// Make authenticated request
const response = await fetch('/api/cars/seller', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided. Please login first"
}
```

### 403 Forbidden (Email Not Verified)
```json
{
  "success": false,
  "message": "Please verify your email before accessing this resource"
}
```

## Database Query Pattern

The backend now uses `req.user.userId` which comes from the JWT token:

```javascript
// Secure way - user ID from JWT
const userId = req.user.userId;
const orders = await Order.find({ customer: userId });

// NOT secure - user ID from request
const userId = req.params.userId; // ❌ Don't do this
```

## Migration Checklist

- [ ] Update all frontend API calls to new endpoints
- [ ] Remove `:sellerId` and `:customerId` from request URLs
- [ ] Ensure JWT token is included in Authorization header
- [ ] Test authentication with valid token
- [ ] Test with invalid/expired token
- [ ] Test user isolation (can't access other user's data)
- [ ] Update API documentation
- [ ] Update mobile app (if applicable)
- [ ] Update external integrations

## Backward Compatibility

⚠️ **Breaking Changes**: These are breaking changes. Old endpoint URLs will no longer work.

If you need to maintain backward compatibility:
1. Create new endpoints with authentication
2. Keep old endpoints deprecated
3. Gradually migrate clients
4. Set a deprecation deadline
5. Remove old endpoints after deadline
