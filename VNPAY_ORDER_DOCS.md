# Order & VNPay Payment System Documentation

## Overview

The order system is integrated with **VNPay**, Vietnam's leading payment gateway. Customers can create orders and pay securely using various payment methods available through VNPay (credit cards, debit cards, e-wallets, etc.).

---

## Order Model Schema

### Order Fields

```javascript
{
  // Customer Reference
  customer: ObjectId (ref: User),           // Required: Customer who placed order
  
  // Billing Information
  firstName: String,                        // Required
  lastName: String,                         // Required
  email: String,                            // Required, lowercase
  phone: String,                            // Optional
  
  // Billing Address
  address: String,                          // Required
  city: String,                             // Required
  state: String,                            // Optional
  country: String,                          // Required, default: "VN"
  zipCode: String,                          // Optional
  
  // Order Items (Multiple cars can be purchased in one order)
  items: [
    {
      carPost: ObjectId (ref: CarPost),    // Car being purchased
      seller: ObjectId (ref: User),        // Seller of the car
      title: String,                       // Car title for reference
      price: Number,                       // Price in VND
      quantity: Number,                    // Always 1 for cars
    }
  ],
  
  // Payment Information (VNPay)
  total: Number,                            // Total amount in VND
  paymentMethod: String,                    // enum: ["vnpay", "bank_transfer", "cash"]
  paymentId: String,                        // VNPay transaction ref (unique)
  paymentStatus: Boolean,                   // false = pending, true = paid
  paymentDetails: {
    responseCode: String,                   // VNPay response (00 = success)
    transactionId: String,                  // VNPay transaction ID
    bankCode: String,                       // Bank code
    bankTmnCode: String,                    // Bank terminal code
    paymentTime: Date,                      // When payment was processed
  },
  
  // Order Status
  orderStatus: String,                      // enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
  
  // Notes
  notes: String,                            // Optional order notes
  
  // Soft Delete
  isDeleted: Boolean,                       // default: false
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### 1. Create Order
**Endpoint:** `POST /api/orders/create`

**Requires:** Authentication (JWT token)

**Request Body:**
```json
{
  "customer": "user_id",
  "firstName": "Nguyen",
  "lastName": "Tuan",
  "email": "customer@example.com",
  "phone": "0912345678",
  "address": "123 Main St",
  "city": "Ho Chi Minh",
  "state": "District 1",
  "country": "VN",
  "zipCode": "700000",
  "items": [
    {
      "carPost": "car_post_id",
      "seller": "seller_id",
      "quantity": 1
    }
  ],
  "notes": "Optional order notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "order_id",
      "customer": "customer_id",
      "firstName": "Nguyen",
      "lastName": "Tuan",
      "total": 500000000,  // 500 million VND
      "orderStatus": "pending",
      "paymentStatus": false,
      "items": [...]
    }
  }
}
```

**Status Codes:**
- `201`: Order created successfully
- `400`: Missing required fields
- `404`: Car post or seller not found
- `500`: Server error

---

### 2. Get Order By ID
**Endpoint:** `GET /api/orders/:id`

**Response:**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "order": {
      "_id": "order_id",
      "customer": {
        "_id": "customer_id",
        "name": "Nguyen Tuan",
        "email": "customer@example.com",
        "phone": "0912345678"
      },
      "items": [
        {
          "carPost": {
            "_id": "car_id",
            "title": "Toyota Camry 2020",
            "make": "Toyota",
            "model": "Camry",
            "year": 2020,
            "price": 500000000,
            "images": [...]
          },
          "seller": {
            "_id": "seller_id",
            "name": "Seller Name",
            "email": "seller@example.com"
          },
          "title": "Toyota Camry 2020",
          "price": 500000000,
          "quantity": 1
        }
      ],
      "total": 500000000,
      "orderStatus": "pending",
      "paymentStatus": false
    }
  }
}
```

---

### 3. Get Customer Orders
**Endpoint:** `GET /api/orders/customer/:customerId`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Customer orders retrieved successfully",
  "data": {
    "orders": [...]
  },
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

---

### 4. Create VNPay Checkout Session
**Endpoint:** `POST /api/payments/vnpay/create-checkout`

**Requires:** Authentication (JWT token)

**Request Body:**
```json
{
  "orderId": "order_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment URL created successfully",
  "data": {
    "url": "https://sandbox.vnpayment.vn/paygate?...",
    "orderId": "order_id",
    "amount": 500000000
  }
}
```

**How It Works:**
1. Order must already exist in database
2. Amount in VND is retrieved from order
3. VNPay URL is generated with 15-minute expiry
4. User is redirected to VNPay payment page
5. Customer completes payment on VNPay

**Status Codes:**
- `200`: Payment URL created
- `400`: Order ID missing
- `404`: Order not found
- `500`: Server error

---

### 5. VNPay Return Handler
**Endpoint:** `GET /api/payments/vnpay/return`

**Query Parameters (from VNPay):**
- `vnp_ResponseCode` - Payment result (00 = success)
- `vnp_TxnRef` - Transaction reference
- `vnp_Amount` - Amount paid
- `vnp_BankCode` - Bank code
- `vnp_TransactionNo` - VNPay transaction ID
- `vnp_PayDate` - Payment date/time

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment successful",
  "data": {
    "orderId": "order_id",
    "paymentStatus": "success",
    "order": {
      "_id": "order_id",
      "orderStatus": "confirmed",
      "paymentStatus": true,
      "paymentId": "vnp_txn_ref",
      "paymentDetails": {
        "responseCode": "00",
        "transactionId": "vnp_transaction_no",
        "bankCode": "970422",
        "paymentTime": "2024-12-15T10:30:00Z"
      }
    }
  }
}
```

**Response (Failed):**
```json
{
  "success": false,
  "message": "Payment failed",
  "data": {
    "orderId": "order_id",
    "paymentStatus": "failed",
    "responseCode": "01"
  }
}
```

---

### 6. Verify Payment Status
**Endpoint:** `GET /api/payments/vnpay/verify/:orderId`

**Requires:** Authentication

**Response:**
```json
{
  "success": true,
  "message": "Payment status retrieved",
  "data": {
    "orderId": "order_id",
    "paymentStatus": true,
    "orderStatus": "confirmed",
    "paymentDetails": {
      "responseCode": "00",
      "transactionId": "vnp_transaction_id",
      "bankCode": "970422",
      "paymentTime": "2024-12-15T10:30:00Z"
    }
  }
}
```

---

### 7. Update Order Status
**Endpoint:** `PATCH /api/orders/:id/status`

**Requires:** Authentication

**Request Body:**
```json
{
  "orderStatus": "shipped"
}
```

**Valid Status Values:**
- `pending` - Order created, waiting for payment
- `confirmed` - Payment received
- `processing` - Order being prepared
- `shipped` - Order sent to customer
- `delivered` - Order received by customer
- `cancelled` - Order cancelled

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "order": { ... }
  }
}
```

---

### 8. Cancel Order
**Endpoint:** `PATCH /api/orders/:id/cancel`

**Requires:** Authentication

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "order": { ... }
  }
}
```

**Rules:**
- Can only cancel pending or confirmed orders
- Cannot cancel orders already shipped

---

### 9. Delete Order (Soft Delete)
**Endpoint:** `DELETE /api/orders/:id`

**Requires:** Authentication

**Response:**
```json
{
  "success": true,
  "message": "Order deleted successfully",
  "data": {
    "order": { ... }
  }
}
```

---

### 10. Get Seller Order Statistics
**Endpoint:** `GET /api/orders/seller/:sellerId/stats`

**Response:**
```json
{
  "success": true,
  "message": "Order statistics retrieved successfully",
  "data": {
    "stats": {
      "totalOrders": 150,
      "completedOrders": 120,
      "pendingOrders": 10,
      "totalRevenue": 7500000000  // Total VND earned
    }
  }
}
```

---

## VNPay Integration Flow

### Complete Payment Flow

```
1. Customer Creates Order
   POST /api/orders/create
        ↓
2. Order Stored (pending status)
        ↓
3. Customer Initiates Checkout
   POST /api/payments/vnpay/create-checkout
        ↓
4. Backend Generates VNPay URL
   - Amount in VND from order
   - 15-minute expiry
   - Return URL: /api/payments/vnpay/return
        ↓
5. Customer Redirected to VNPay
   - VNPay displays payment methods
   - Customer chooses bank/card/e-wallet
   - Customer completes payment
        ↓
6. VNPay Processes Payment
   - Validates transaction
   - Deducts funds from customer
   - Returns response code
        ↓
7. VNPay Redirects Back to App
   GET /api/payments/vnpay/return?vnp_ResponseCode=00&...
        ↓
8. Backend Updates Order
   - If responseCode = 00: Mark as paid (confirmed)
   - If responseCode != 00: Mark as cancelled
   - Store payment details
        ↓
9. Frontend Redirects Customer
   - Success: /checkout/vnpay-return?status=success&order_id=...
   - Failed: /checkout/vnpay-return?status=failed&code=...
```

---

## VNPay Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| `00` | Success | Order marked as confirmed, payment successful |
| `01` | Bank error | Order cancelled, payment failed |
| `02` | Merchant error | Order cancelled, payment failed |
| `03` | Invalid customer | Order cancelled, payment failed |
| `04` | Merchant locked | Order cancelled, payment failed |
| `05` | Excess limit | Order cancelled, payment failed |
| `07` | Exceed daily limit | Order cancelled, payment failed |
| `08` | Merchant not registered | Order cancelled, payment failed |
| `09` | Merchant suspended | Order cancelled, payment failed |
| `99` | Unknown error | Order cancelled, payment failed |

---

## Environment Variables

```env
# VNPay Configuration
VNPAY_TMN_CODE="your_merchant_code"           # Get from VNPay
VNPAY_HASH_SECRET="your_hash_secret"          # Get from VNPay
VNPAY_HOST="https://sandbox.vnpayment.vn"    # Sandbox for testing

# Deployment: Change to production URL
# VNPAY_HOST="https://paygate.vnpayment.vn"
```

---

## Frontend Integration

### 1. Create Order
```javascript
const createOrder = async (orderData) => {
  const response = await axios.post(
    'http://localhost:3000/api/orders/create',
    orderData,
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    }
  );
  return response.data.data.order;
};
```

### 2. Initiate VNPay Payment
```javascript
const initiateVNPayPayment = async (orderId) => {
  const response = await axios.post(
    'http://localhost:3000/api/payments/vnpay/create-checkout',
    { orderId },
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    }
  );
  
  // Redirect to VNPay
  window.location.href = response.data.data.url;
};
```

### 3. Handle Return from VNPay
```javascript
// On /checkout/vnpay-return page
const handleVNPayReturn = async () => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('vnpay_status');
  const orderId = params.get('order_id');
  
  if (status === 'success') {
    // Verify payment status
    const response = await axios.get(
      `http://localhost:3000/api/payments/vnpay/verify/${orderId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      }
    );
    
    if (response.data.data.paymentStatus) {
      // Show success message
      toast.success('Payment successful!');
      // Redirect to order details
      navigate(`/orders/${orderId}`);
    }
  } else {
    toast.error('Payment failed');
  }
};
```

---

## Testing with VNPay Sandbox

### Test Card Details (Sandbox)
```
Card Number: 4111111111111111
Expiry: 12/99
OTP: Any 6 digits
```

### Test Bank Info
- **Bank:** TMCP Vietnam Advances/V Bank
- **Code:** 970405

---

## Currency Information

- **Currency Used:** Vietnamese Dong (VND)
- **Decimal Places:** No decimals (always whole numbers)
- **Example Amount:** 500,000,000 VND (~ $20 USD)
- **Exchange Rate:** Approximately 1 USD = 24,000 VND

---

## Error Handling

### Common Errors

**Order Not Found**
```json
{
  "success": false,
  "message": "Order not found",
  "statusCode": 404
}
```

**Invalid Payment Amount**
```json
{
  "success": false,
  "message": "Invalid order amount",
  "statusCode": 400
}
```

**Payment Already Processed**
```json
{
  "success": false,
  "message": "Payment already processed for this order",
  "statusCode": 400
}
```

---

## Database Indexes

For optimal performance, these indexes are created:

- `{ customer: 1, createdAt: -1 }` - Get customer's recent orders
- `{ orderStatus: 1 }` - Filter by status
- `{ "items.carPost": 1 }` - Find orders containing specific car
- `{ paymentId: 1 }` - Unique index on paymentId (VNPay txn ref)

---

## Security Considerations

1. **HTTPS Required** - VNPay enforces HTTPS in production
2. **Hash Validation** - All VNPay responses must be validated with hash
3. **Return URL Verification** - Verify VNPay signature before processing
4. **Amount Validation** - Always verify amount matches database order
5. **Idempotency** - Process same payment only once
6. **Rate Limiting** - Recommended on payment endpoints

---

## Troubleshooting

### "Cannot find VNPay credentials"
- Check VNPAY_TMN_CODE and VNPAY_HASH_SECRET in .env
- Ensure they're from correct VNPay account

### "Payment successful but order not updated"
- Check MongoDB connection
- Verify orderId in return URL matches database
- Check server logs for errors

### "Redirect loop on return URL"
- Ensure return URL matches in VNPay config
- Check frontend route exists
- Verify order exists before redirect

### "Invalid signature error"
- VNPAY_HASH_SECRET must match account
- Hash algorithm must be SHA512
- All parameters must be included

---

**Last Updated:** December 15, 2024
**VNPay API Version:** Latest
**Status:** Production Ready
