# Car Posting Fee System Documentation

## Overview

When a seller wants to list a car for sale, they must pay a **posting fee of 15,000 VND** via VNPay. The car post is only created after the payment is confirmed.

---

## System Flow

```
1. Seller Prepares Car Post
   ├─ Fill car details (heading, price, miles, etc.)
   └─ Upload car photos (optional)
   
2. Initiate Posting (Step 1)
   POST /api/cars/initiate/:sellerId
        ↓
   Creates PostingFee record
   Stores car data & photos temporarily
        ↓
   Response: postingFeeId
   
3. Pay with VNPay (Step 2)
   POST /api/posting-fee/pay/checkout
   Body: { postingFeeId }
        ↓
   Backend generates VNPay payment URL
        ↓
   Frontend redirects to VNPay payment page
        ↓
   Seller completes payment (15,000 VND)
        ↓
   VNPay processes transaction
   
4. Payment Callback (Step 3)
   GET /api/posting-fee/pay/return?vnp_ResponseCode=00&...
        ↓
   Backend verifies payment success
   Creates CarPost with stored data
   Links CarPost to PostingFee record
        ↓
   Seller redirected to success page
   
5. Car Post Live
   Post appears in listings
   Seller can manage post via /api/cars/:id endpoints
```

---

## Database Models

### PostingFee Schema

```javascript
{
  seller: ObjectId (ref: User),        // Seller who initiated posting
  carData: Object,                     // Full car details stored temporarily
  photoLinks: [String],                // Cloudinary URLs from upload
  amount: Number,                      // Always 15,000 VND
  paymentId: String,                   // VNPay transaction ref (unique)
  paymentStatus: String,               // 'pending' | 'paid' | 'failed'
  paymentDetails: {
    responseCode: String,              // VNPay response code
    transactionId: String,             // VNPay transaction ID
    bankCode: String,                  // Customer's bank
    bankTmnCode: String,               // Bank terminal code
    paymentTime: Date,                 // When payment processed
  },
  carPost: ObjectId (ref: CarPost),    // Created post (null until paid)
  expiresAt: Date,                     // 24 hours from creation
  isDeleted: Boolean,                  // Soft delete flag
  createdAt: Date,
  updatedAt: Date
}
```

**Auto-Delete:** Expired pending payments are automatically deleted after 24 hours.

---

## API Endpoints

### 1. Initiate Car Posting

**Endpoint:** `POST /api/cars/initiate/:sellerId`

**Headers:**
```
Content-Type: multipart/form-data (if uploading photos)
```

**Request Body:**
```json
{
  "heading": "2020 Toyota Camry SE",
  "price": 15000000,
  "miles": 45000,
  "year": 2020,
  "make": "Toyota",
  "model": "Camry",
  "trim": "SE",
  "body_type": "Sedan",
  "transmission": "Automatic",
  "fuel_type": "Gasoline",
  "exterior_color": "Blue",
  "interior_color": "Gray",
  "inventory_type": "used"
}
```

**Files:**
- Field name: `photos`
- Max 10 photos per request
- Max 5MB per file

**Success Response (201):**
```json
{
  "success": true,
  "message": "Posting initiated. Please proceed to payment.",
  "data": {
    "postingFeeId": "507f1f77bcf86cd799439011",
    "amount": 15000,
    "message": "You need to pay 15,000 VND posting fee to publish your car listing"
  }
}
```

**Error Responses:**
- `404` - Seller not found
- `400` - Missing required fields
- `500` - Photo upload failed

---

### 2. Create Payment URL

**Endpoint:** `POST /api/posting-fee/pay/checkout`

**Requires:** Authentication (JWT token)

**Request Body:**
```json
{
  "postingFeeId": "507f1f77bcf86cd799439011"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment URL created successfully",
  "data": {
    "url": "https://sandbox.vnpayment.vn/paygate?...",
    "postingFeeId": "507f1f77bcf86cd799439011",
    "amount": 15000
  }
}
```

**Error Responses:**
- `400` - PostingFeeId missing or already paid
- `404` - PostingFee not found
- `500` - Server error

---

### 3. VNPay Return Handler

**Endpoint:** `GET /api/posting-fee/pay/return`

**Query Parameters (from VNPay):**
- `vnp_ResponseCode` - Payment result (00 = success)
- `vnp_TxnRef` - Transaction reference
- `vnp_Amount` - Amount paid
- `vnp_TransactionNo` - VNPay transaction ID
- `vnp_BankCode` - Customer's bank code
- `vnp_PayDate` - Payment timestamp

**Success Response (Payment Successful):**
```json
{
  "success": true,
  "message": "Payment successful",
  "data": {
    "postingFeeId": "507f1f77bcf86cd799439011",
    "paymentStatus": "paid",
    "responseCode": "00"
  }
}
```

**Failure Response (Payment Failed):**
```json
{
  "success": false,
  "message": "Payment failed. Code: 01",
  "data": {
    "postingFeeId": "507f1f77bcf86cd799439011",
    "paymentStatus": "failed",
    "responseCode": "01"
  }
}
```

**Actions on Success:**
1. Update PostingFee payment status to 'paid'
2. Store payment details (transaction ID, bank code, etc.)
3. Automatically create CarPost from stored car data
4. Link created CarPost to PostingFee record

---

### 4. Verify Payment Status

**Endpoint:** `GET /api/posting-fee/verify/:postingFeeId`

**Requires:** Authentication (JWT token)

**Success Response:**
```json
{
  "success": true,
  "message": "Payment status retrieved",
  "data": {
    "postingFeeId": "507f1f77bcf86cd799439011",
    "paymentStatus": "paid",
    "carPost": {
      "_id": "507f1f77bcf86cd799439012",
      "seller": "seller_id",
      "heading": "2020 Toyota Camry SE",
      "price": 15000000,
      "status": "Available"
    },
    "paymentDetails": {
      "responseCode": "00",
      "transactionId": "123456789",
      "bankCode": "970422",
      "paymentTime": "2024-12-15T10:30:00Z"
    }
  }
}
```

---

### 5. Get Posting Fee Info

**Endpoint:** `GET /api/posting-fee/:postingFeeId`

**Requires:** Authentication (JWT token)

**Success Response:**
```json
{
  "success": true,
  "message": "Posting fee retrieved successfully",
  "data": {
    "postingFeeId": "507f1f77bcf86cd799439011",
    "seller": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "amount": 15000,
    "paymentStatus": "pending",
    "carData": { ... }
  }
}
```

---

## Frontend Integration

### Step 1: Initiate Posting

```javascript
const initiatePosting = async (sellerId, carData, photos) => {
  const formData = new FormData();
  
  // Add car data
  Object.keys(carData).forEach(key => {
    formData.append(key, carData[key]);
  });
  
  // Add photos
  photos.forEach(photo => {
    formData.append('photos', photo);
  });
  
  const response = await axios.post(
    `http://localhost:3000/api/cars/initiate/${sellerId}`,
    formData,
    {
      headers: { 
        'Content-Type': 'multipart/form-data'
      },
      withCredentials: true
    }
  );
  
  return response.data.data.postingFeeId;
};
```

### Step 2: Create Payment URL

```javascript
const startPayment = async (postingFeeId) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.post(
    'http://localhost:3000/api/posting-fee/pay/checkout',
    { postingFeeId },
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    }
  );
  
  // Redirect to VNPay
  window.location.href = response.data.data.url;
};
```

### Step 3: Handle Payment Return

```javascript
// On /posting-fee-return page
const handlePaymentReturn = async () => {
  const params = new URLSearchParams(window.location.search);
  const postingFeeId = params.get('posting_fee_id');
  const status = params.get('status');
  
  const token = localStorage.getItem('accessToken');
  
  const response = await axios.get(
    `http://localhost:3000/api/posting-fee/verify/${postingFeeId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    }
  );
  
  if (response.data.data.paymentStatus === 'paid') {
    toast.success('Payment successful! Your car post is now live.');
    navigate(`/cars/${response.data.data.carPost._id}`);
  } else {
    toast.error('Payment failed. Please try again.');
    navigate('/sell-car');
  }
};
```

---

## Frontend Components

### Complete Sell Car Form

```javascript
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function SellCarForm() {
  const [loading, setLoading] = useState(false);
  const [carData, setCarData] = useState({
    heading: '',
    price: '',
    miles: '',
    year: '',
    make: '',
    model: '',
    trim: '',
  });
  const [photos, setPhotos] = useState([]);

  const handleChange = (e) => {
    setCarData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePhotosChange = (e) => {
    setPhotos(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!carData.heading || !carData.price || !carData.miles) {
      toast.error('Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const userId = localStorage.getItem('userId');
      
      const formData = new FormData();
      Object.keys(carData).forEach(key => {
        if (carData[key]) formData.append(key, carData[key]);
      });
      photos.forEach(photo => {
        formData.append('photos', photo);
      });

      // Step 1: Initiate posting
      const initiateResponse = await axios.post(
        `http://localhost:3000/api/cars/initiate/${userId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      if (!initiateResponse.data.success) {
        toast.error(initiateResponse.data.message);
        return;
      }

      const postingFeeId = initiateResponse.data.data.postingFeeId;
      toast.info('Car details saved. Proceeding to payment...');

      // Step 2: Create payment
      const paymentResponse = await axios.post(
        'http://localhost:3000/api/posting-fee/pay/checkout',
        { postingFeeId },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      if (paymentResponse.data.success) {
        // Redirect to VNPay
        window.location.href = paymentResponse.data.data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to sell car');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Sell Your Car</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="heading"
          placeholder="Car Title (e.g., 2020 Toyota Camry SE)"
          value={carData.heading}
          onChange={handleChange}
          required
          className="w-full border rounded px-4 py-2"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="price"
            placeholder="Price (VND)"
            value={carData.price}
            onChange={handleChange}
            required
            className="border rounded px-4 py-2"
          />
          <input
            type="number"
            name="miles"
            placeholder="Mileage (km)"
            value={carData.miles}
            onChange={handleChange}
            required
            className="border rounded px-4 py-2"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <input
            type="number"
            name="year"
            placeholder="Year"
            value={carData.year}
            onChange={handleChange}
            className="border rounded px-4 py-2"
          />
          <input
            type="text"
            name="make"
            placeholder="Make"
            value={carData.make}
            onChange={handleChange}
            className="border rounded px-4 py-2"
          />
          <input
            type="text"
            name="model"
            placeholder="Model"
            value={carData.model}
            onChange={handleChange}
            className="border rounded px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Upload Photos (Max 10)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotosChange}
            className="w-full border rounded px-4 py-2"
          />
          {photos.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {photos.length} photo(s) selected
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 my-4">
          <p className="text-sm text-blue-700">
            <strong>Posting Fee:</strong> 15,000 VND per listing
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'List Car for 15,000 VND'}
        </button>
      </form>
    </div>
  );
}
```

---

## Payment Return Page

```javascript
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function PostingFeeReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [carPost, setCarPost] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const postingFeeId = searchParams.get('posting_fee_id');
        
        if (!postingFeeId) {
          setStatus('error');
          return;
        }

        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          `http://localhost:3000/api/posting-fee/verify/${postingFeeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        );

        if (response.data.data.paymentStatus === 'paid' && response.data.data.carPost) {
          setStatus('success');
          setCarPost(response.data.data.carPost);
          toast.success('Payment successful! Your car is now listed.');
          
          setTimeout(() => {
            navigate(`/cars/${response.data.data.carPost._id}`);
          }, 3000);
        } else {
          setStatus('failed');
          toast.error('Payment not confirmed');
        }
      } catch (error) {
        setStatus('error');
        toast.error('Error verifying payment');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        
        {status === 'checking' && (
          <>
            <div className="inline-block animate-spin mb-4">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Verifying Payment</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Success!</h2>
            <p className="text-gray-600 mb-4">Your car has been posted successfully.</p>
            {carPost && (
              <div className="bg-gray-50 p-4 rounded mb-4 text-left text-sm">
                <p><strong>{carPost.heading}</strong></p>
                <p className="text-gray-600">{carPost.price.toLocaleString()} VND</p>
              </div>
            )}
            <p className="text-gray-600 text-sm">Redirecting in 3 seconds...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-600">Your payment could not be processed.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-yellow-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-yellow-600 mb-2">Error</h2>
            <p className="text-gray-600">An error occurred while processing your payment.</p>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## Routes Configuration

Update `src/App.jsx`:

```javascript
import SellCarForm from './pages/SellCarForm';
import PostingFeeReturn from './pages/PostingFeeReturn';

<Routes>
  {/* ... existing routes ... */}
  <Route path="/sell-car" element={<SellCarForm />} />
  <Route path="/posting-fee-return" element={<PostingFeeReturn />} />
</Routes>
```

---

## Fee Configuration

**Current Settings:**
- Amount: **15,000 VND** (defined in both PostingFee model and CarPostController)
- Expiry: **24 hours** (auto-delete after 24 hours of inactivity)
- Currency: **VND** (Vietnamese Dong)
- Payment Gateway: **VNPay**

To change the fee amount:
1. Update `POSTING_FEE` constant in `/controller/CarPostController.js`
2. Update default value in `/model/PostingFee.js`

---

## VNPay Test Cards

**Sandbox Credentials:**
- Card Number: `4111111111111111`
- Expiry: `12/99`
- OTP: Any 6 digits

---

## Status Codes Reference

| Code | Meaning |
|------|---------|
| `00` | Payment successful |
| `01` | Bank/technical error |
| `02` | Merchant error |
| `03` | Invalid customer |
| `04` | Merchant locked |
| `07` | Limit exceeded |

---

## Troubleshooting

**Payment URL not generating:**
- Check `VNPAY_TMN_CODE` and `VNPAY_HASH_SECRET` in `.env`
- Verify `VNPAY_HOST` is correct (sandbox vs production)

**Car post not created after payment:**
- Check PostingFee payment status is 'paid'
- Verify carPost field is null (hasn't been created yet)
- Check server logs for errors

**Photos not saving:**
- Check Cloudinary credentials in `.env`
- Verify photo file size < 5MB
- Ensure photos are valid image formats

---

**Last Updated:** December 15, 2024
**Status:** Production Ready
