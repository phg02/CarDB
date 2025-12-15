# Frontend Order & Payment Implementation Guide

## Overview

This guide explains how to build the order creation and VNPay payment UI on the frontend.

---

## 1. Order Creation Form Component

### File: `src/components/OrderForm.jsx`

```javascript
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function OrderForm({ cartItems, totalAmount, onOrderCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'VN',
    zipCode: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cartItems || cartItems.length === 0) {
      toast.error('No items in cart');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const orderPayload = {
        ...formData,
        items: cartItems.map(item => ({
          carPost: item.carPostId,
          seller: item.sellerId,
          quantity: 1
        }))
      };

      const response = await axios.post(
        `http://localhost:3000/api/orders/create`,
        orderPayload,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success('Order created successfully!');
        const order = response.data.data.order;
        onOrderCreated(order);
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Billing Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="border rounded px-4 py-2"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="border rounded px-4 py-2"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border rounded px-4 py-2"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone (09xxxxxxxxx)"
            value={formData.phone}
            onChange={handleChange}
            className="border rounded px-4 py-2"
          />
        </div>

        {/* Address */}
        <textarea
          name="address"
          placeholder="Street Address"
          value={formData.address}
          onChange={handleChange}
          required
          className="border rounded px-4 py-2 w-full"
          rows="2"
        />

        {/* City, State, Country, Zip */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
            className="border rounded px-4 py-2"
          />
          <input
            type="text"
            name="state"
            placeholder="State/Province"
            value={formData.state}
            onChange={handleChange}
            className="border rounded px-4 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            readOnly
            className="border rounded px-4 py-2 bg-gray-100"
          />
          <input
            type="text"
            name="zipCode"
            placeholder="ZIP Code"
            value={formData.zipCode}
            onChange={handleChange}
            className="border rounded px-4 py-2"
          />
        </div>

        {/* Notes */}
        <textarea
          name="notes"
          placeholder="Order notes (optional)"
          value={formData.notes}
          onChange={handleChange}
          className="border rounded px-4 py-2 w-full"
          rows="2"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating Order...' : 'Proceed to Payment'}
        </button>
      </form>

      {/* Order Summary */}
      <div className="mt-6 border-t pt-4">
        <h3 className="font-semibold mb-3">Order Summary</h3>
        <div className="flex justify-between mb-2">
          <span>Items: {cartItems?.length || 0}</span>
          <span>{(totalAmount || 0).toLocaleString('vi-VN')} ₫</span>
        </div>
      </div>
    </div>
  );
}
```

---

## 2. VNPay Checkout Handler

### File: `src/components/CheckoutPage.jsx`

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import OrderForm from './OrderForm';
import OrderSummary from './OrderSummary';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Get cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartItems(cart);
      
      // Calculate total
      const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);
      setTotalAmount(total);
    }
  }, []);

  const handleOrderCreated = async (createdOrder) => {
    setOrder(createdOrder);
    toast.info('Order created! Redirecting to payment...');
    
    // Initiate VNPay payment
    await initiateVNPayPayment(createdOrder._id);
  };

  const initiateVNPayPayment = async (orderId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.post(
        'http://localhost:3000/api/payments/vnpay/create-checkout',
        { orderId },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        // Redirect to VNPay
        window.location.href = response.data.data.url;
      } else {
        toast.error('Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-3 gap-6">
          {/* Order Form */}
          <div className="col-span-2">
            <OrderForm 
              cartItems={cartItems}
              totalAmount={totalAmount}
              onOrderCreated={handleOrderCreated}
            />
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <OrderSummary 
              items={cartItems}
              total={totalAmount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Order Summary Component

### File: `src/components/OrderSummary.jsx`

```javascript
export default function OrderSummary({ items, total }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

      {/* Items List */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {items && items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <div>
              <p className="font-semibold">{item.title || 'Car'}</p>
              <p className="text-gray-500">Qty: 1</p>
            </div>
            <p className="font-semibold">
              {(item.price || 0).toLocaleString('vi-VN')} ₫
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t mb-4"></div>

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Total:</span>
        <span className="text-2xl font-bold text-blue-600">
          {(total || 0).toLocaleString('vi-VN')} ₫
        </span>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-500 mt-4">
        You will be redirected to VNPay to complete payment
      </p>
    </div>
  );
}
```

---

## 4. VNPay Return/Callback Handler

### File: `src/pages/VNPayReturn.jsx`

```javascript
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function VNPayReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Extract parameters from URL
        const vnpResponseCode = searchParams.get('vnp_ResponseCode');
        const vnpTxnRef = searchParams.get('vnp_TxnRef');
        
        // Extract orderId from transaction reference
        // VNPay txnRef format: orderId_timestamp
        const orderId = vnpTxnRef?.split('_')[0];

        if (!orderId) {
          setStatus('error');
          toast.error('Invalid transaction reference');
          return;
        }

        const token = localStorage.getItem('accessToken');

        if (vnpResponseCode === '00') {
          // Payment successful - verify with backend
          const response = await axios.get(
            `http://localhost:3000/api/payments/vnpay/verify/${orderId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true
            }
          );

          if (response.data.success && response.data.data.paymentStatus) {
            setStatus('success');
            setOrderData(response.data.data);
            toast.success('Payment successful!');

            // Clear cart
            localStorage.removeItem('cart');

            // Redirect to order details after 3 seconds
            setTimeout(() => {
              navigate(`/orders/${orderId}`);
            }, 3000);
          } else {
            setStatus('error');
            toast.error('Payment verification failed');
          }
        } else {
          // Payment failed
          setStatus('failed');
          toast.error(`Payment failed. Code: ${vnpResponseCode}`);
          
          setTimeout(() => {
            navigate('/checkout');
          }, 3000);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        toast.error('Error verifying payment');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        
        {status === 'checking' && (
          <>
            <div className="inline-block animate-spin mb-4">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Your order has been confirmed.</p>
            
            {orderData && (
              <div className="bg-gray-50 rounded p-4 mb-4 text-left">
                <p className="text-sm"><strong>Order ID:</strong> {orderData.orderId}</p>
                <p className="text-sm"><strong>Status:</strong> {orderData.orderStatus}</p>
                <p className="text-sm"><strong>Amount:</strong> {orderData.amount?.toLocaleString('vi-VN')} ₫</p>
              </div>
            )}

            <p className="text-gray-600 text-sm">Redirecting to order details in 3 seconds...</p>
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
            <p className="text-gray-600 mb-4">Your payment could not be processed.</p>
            <p className="text-gray-600 text-sm">Returning to checkout in 3 seconds...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-yellow-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-yellow-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">An error occurred while processing your payment.</p>
            <p className="text-gray-600 text-sm">Returning to checkout...</p>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 5. Order Details Page

### File: `src/pages/OrderDetails.jsx`

```javascript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          `http://localhost:3000/api/orders/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        );

        if (response.data.success) {
          setOrder(response.data.data.order);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="text-center py-12">Loading order details...</div>;
  }

  if (!order) {
    return <div className="text-center py-12">Order not found</div>;
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold">Order #{order._id?.slice(-8).toUpperCase()}</h1>
            <p className="text-gray-600">
              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full font-semibold ${statusColors[order.orderStatus] || 'bg-gray-100'}`}>
            {order.orderStatus?.toUpperCase()}
          </span>
        </div>

        {/* Billing Information */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Billing Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-semibold">{order.firstName} {order.lastName}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-semibold">{order.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-semibold">{order.phone}</p>
            </div>
            <div>
              <p className="text-gray-600">Address</p>
              <p className="font-semibold">
                {order.address}, {order.city}, {order.country}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between border rounded p-4">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{(item.price || 0).toLocaleString('vi-VN')} ₫</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Information */}
        <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
          <div>
            <h3 className="font-bold text-gray-700 mb-2">Payment Status</h3>
            <div className="flex items-center gap-2">
              {order.paymentStatus ? (
                <>
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-600 font-semibold">Paid</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-yellow-600 font-semibold">Pending</span>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-700 mb-2">Payment Method</h3>
            <p className="text-gray-800 capitalize">{order.paymentMethod}</p>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center mb-8">
          <span className="text-lg font-semibold">Total Amount:</span>
          <span className="text-3xl font-bold text-blue-600">
            {(order.total || 0).toLocaleString('vi-VN')} ₫
          </span>
        </div>

        {/* Payment Details (if available) */}
        {order.paymentDetails && order.paymentDetails.transactionId && (
          <div className="bg-gray-50 rounded p-4 text-sm">
            <h3 className="font-bold mb-2">Payment Details</h3>
            <p><strong>Transaction ID:</strong> {order.paymentDetails.transactionId}</p>
            <p><strong>Bank Code:</strong> {order.paymentDetails.bankCode}</p>
            <p><strong>Paid at:</strong> {new Date(order.paymentDetails.paymentTime).toLocaleString('vi-VN')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 6. Update App.jsx Routes

Add these new routes to your `src/App.jsx`:

```javascript
import CheckoutPage from './pages/CheckoutPage';
import VNPayReturn from './pages/VNPayReturn';
import OrderDetails from './pages/OrderDetails';

// In your router configuration:
<Routes>
  {/* ... existing routes ... */}
  
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/vnpay-return" element={<VNPayReturn />} />
  <Route path="/orders/:orderId" element={<OrderDetails />} />
</Routes>
```

---

## 7. Update Cart Component

Add a "Checkout" button to your cart/product page:

```javascript
const handleCheckout = () => {
  if (cartItems.length === 0) {
    toast.error('Your cart is empty');
    return;
  }
  
  // Save cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cartItems));
  
  // Navigate to checkout
  navigate('/checkout');
};

// In your JSX:
<button 
  onClick={handleCheckout}
  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
>
  Proceed to Checkout
</button>
```

---

## 8. Number Formatting Helper

Create a utility for consistent currency formatting:

### File: `src/utils/formatCurrency.js`

```javascript
/**
 * Format number as Vietnamese Dong
 * @param {number} amount - Amount in VND
 * @returns {string} Formatted amount with ₫ symbol
 */
export const formatVND = (amount) => {
  return (amount || 0).toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) + ' ₫';
};

/**
 * Format number as Vietnamese Dong without symbol
 * @param {number} amount - Amount in VND
 * @returns {string} Formatted amount
 */
export const formatNumber = (amount) => {
  return (amount || 0).toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};
```

Usage:
```javascript
import { formatVND } from './utils/formatCurrency';

<span>{formatVND(500000000)}</span> // Output: 500,000,000 ₫
```

---

## 9. Environment Configuration

Update your `.env.local` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_PAYMENT_RETURN_URL=http://localhost:5173/vnpay-return
```

---

## 10. Flow Diagram

```
Cart Page
    ↓ (Add items)
Cart Summary
    ↓ (Click "Checkout")
Checkout Page
    ├─ Order Form (billing info)
    └─ Order Summary (preview)
    ↓ (Submit form)
Create Order (POST /api/orders/create)
    ↓ (Success)
Initiate Payment (POST /api/payments/vnpay/create-checkout)
    ↓ (Get payment URL)
Redirect to VNPay
    ├─ Customer enters payment info
    └─ VNPay processes payment
    ↓ (Payment complete)
VNPay Redirects Back
    (GET /api/payments/vnpay/return?vnp_ResponseCode=00&...)
    ↓
Verify Payment (GET /api/payments/vnpay/verify/:orderId)
    ↓ (Payment confirmed)
VNPay Return Page
    ├─ Show success message
    └─ Clear cart
    ↓ (Redirect after 3 seconds)
Order Details Page
    ├─ Show order info
    ├─ Show items purchased
    └─ Show payment confirmation
```

---

## Testing Checklist

- [ ] Create order with valid billing information
- [ ] Order appears in database with correct data
- [ ] VNPay checkout URL is generated correctly
- [ ] Can complete test payment on VNPay sandbox
- [ ] Payment return handler updates order status
- [ ] Order details page displays payment confirmation
- [ ] Cart is cleared after successful payment
- [ ] Failed payment redirects back to checkout
- [ ] Order history shows all customer orders
- [ ] Amount displays correctly in VND format

---

**Last Updated:** December 15, 2024
**Status:** Ready for Implementation
