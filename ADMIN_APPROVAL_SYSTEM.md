# Admin Car Post Approval System

## Overview

This system implements a two-tier verification process:
1. **Payment Verification:** Seller pays 15,000 VND posting fee via VNPay
2. **Admin Approval:** Admin reviews and approves the car post before it becomes visible to users

Only **verified posts that have been paid** are visible to regular users.

---

## System Architecture

### User Flows

```
SELLER FLOW:
├─ Pay 15,000 VND posting fee
├─ Post created with verified=false
├─ Admin reviews post
├─ Admin approves → verified=true → Post visible to users
└─ Or admin rejects → Post remains hidden

ADMIN FLOW:
├─ View all posts (GET /api/cars/admin/all)
├─ View only unverified posts (GET /api/cars/admin/unverified)
├─ Approve posts (PATCH /api/cars/admin/:id/approve)
├─ Reject posts with reason (PATCH /api/cars/admin/:id/reject)
└─ Filter and search across all posts

USER FLOW:
├─ View only verified AND paid posts (GET /api/cars)
├─ Filter and search verified posts
└─ See post details, seller info, location
```

---

## CarPost Model Updates

**New Fields:**

```javascript
{
  verified: Boolean,              // default: false (admin approval status)
  rejectionReason: String,        // Reason if rejected by admin
  approvedBy: ObjectId,           // Admin who approved (ref: User)
  approvedAt: Date,               // When post was approved
  // ... existing fields ...
}
```

---

## API Endpoints

### 1. Get All Verified Posts (Users)

**Endpoint:** `GET /api/cars`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 12)
- `status` - "Available" or "Sold"
- `minPrice` - Minimum price in VND
- `maxPrice` - Maximum price in VND
- `make` - Car make (Toyota, Honda, etc.)
- `year` - Model year
- `inventory_type` - "new" or "used"

**Example:**
```
GET /api/cars?page=1&limit=12&make=Toyota&minPrice=10000000&maxPrice=50000000&year=2020
```

**Response (200):**
```json
{
  "success": true,
  "message": "Car posts retrieved successfully",
  "data": [
    {
      "_id": "car_id",
      "seller": {
        "_id": "seller_id",
        "name": "John Seller",
        "email": "john@example.com",
        "phone": "0912345678"
      },
      "heading": "2020 Toyota Camry SE",
      "price": 15000000,
      "miles": 45000,
      "year": 2020,
      "make": "Toyota",
      "model": "Camry",
      "verified": true,
      "approvedAt": "2024-12-15T10:30:00Z",
      "status": "Available"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 58,
    "itemsPerPage": 12
  }
}
```

---

### 2. Get All Posts (Admin)

**Endpoint:** `GET /api/cars/admin/all`

**Requires:** Authentication + Admin role

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 12)
- `status` - Post status
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `make` - Car make
- `year` - Model year
- `inventory_type` - "new" or "used"
- `verified` - "true" or "false" (filter by approval status)

**Example:**
```
GET /api/cars/admin/all?verified=false&page=1
```

**Response (200):**
```json
{
  "success": true,
  "message": "All car posts retrieved successfully",
  "data": [
    {
      "_id": "car_id",
      "seller": {
        "_id": "seller_id",
        "name": "Jane Seller",
        "email": "jane@example.com",
        "phone": "0987654321"
      },
      "heading": "2019 Honda Accord",
      "price": 12000000,
      "miles": 60000,
      "year": 2019,
      "make": "Honda",
      "model": "Accord",
      "verified": false,
      "rejectionReason": null,
      "approvedBy": null,
      "approvedAt": null,
      "createdAt": "2024-12-15T08:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 3. Get Unverified Posts (Admin)

**Endpoint:** `GET /api/cars/admin/unverified`

**Requires:** Authentication + Admin role

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 12)
- `make` - Car make
- `year` - Model year

**Example:**
```
GET /api/cars/admin/unverified?page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "message": "Unverified car posts retrieved successfully",
  "data": [
    {
      "_id": "car_id",
      "seller": { ... },
      "heading": "2021 BMW X5",
      "price": 45000000,
      "verified": false,
      "createdAt": "2024-12-15T09:15:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 4. Approve Car Post (Admin)

**Endpoint:** `PATCH /api/cars/admin/:id/approve`

**Requires:** Authentication + Admin role

**Validation:**
- Post must exist
- Post must have paid posting fee (checked via PostingFee model)
- Post will be marked as verified and visible to users

**Response (200):**
```json
{
  "success": true,
  "message": "Car post approved successfully",
  "data": {
    "carPost": {
      "_id": "car_id",
      "heading": "2020 Toyota Camry",
      "verified": true,
      "approvedBy": "admin_id",
      "approvedAt": "2024-12-15T10:45:00Z"
    },
    "approvedAt": "2024-12-15T10:45:00Z",
    "approvedBy": "admin_id"
  }
}
```

**Error (400) - Payment Not Verified:**
```json
{
  "success": false,
  "message": "Cannot approve this post. The posting fee has not been paid."
}
```

---

### 5. Reject Car Post (Admin)

**Endpoint:** `PATCH /api/cars/admin/:id/reject`

**Requires:** Authentication + Admin role

**Request Body:**
```json
{
  "reason": "Images are unclear, need better quality photos"
}
```

**Validation:**
- Post must exist
- Rejection reason is required

**Response (200):**
```json
{
  "success": true,
  "message": "Car post rejected successfully",
  "data": {
    "carPost": {
      "_id": "car_id",
      "heading": "2020 Toyota Camry",
      "verified": false,
      "rejectionReason": "Images are unclear, need better quality photos",
      "approvedBy": null,
      "approvedAt": null
    },
    "rejectionReason": "Images are unclear, need better quality photos"
  }
}
```

---

## Filtering Examples

### Get New Cars Under 30 Million VND
```
GET /api/cars?inventory_type=new&maxPrice=30000000
```

### Get Available Used Cars (Admin View)
```
GET /api/cars/admin/all?inventory_type=used&status=Available&verified=true
```

### Find Unverified BMW Posts
```
GET /api/cars/admin/unverified?make=BMW
```

### Get All Toyotas from 2020 or Later (User View)
```
GET /api/cars?make=Toyota&year=2020
```

---

## Frontend Integration

### Admin Dashboard Component

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const [unverifiedPosts, setUnverifiedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnverifiedPosts();
  }, []);

  const fetchUnverifiedPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'http://localhost:3000/api/cars/admin/unverified?limit=20',
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      setUnverifiedPosts(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch unverified posts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `http://localhost:3000/api/cars/admin/${postId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      toast.success('Post approved');
      fetchUnverifiedPosts(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (postId, reason) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `http://localhost:3000/api/cars/admin/${postId}/reject`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      toast.success('Post rejected');
      fetchUnverifiedPosts(); // Refresh list
    } catch (error) {
      toast.error('Failed to reject post');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">
          Pending Approval ({unverifiedPosts.length})
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : unverifiedPosts.length === 0 ? (
          <p className="text-gray-600">No pending posts</p>
        ) : (
          <div className="space-y-4">
            {unverifiedPosts.map((post) => (
              <div key={post._id} className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-400">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold">{post.heading}</h3>
                    <p className="text-gray-600">{post.make} {post.model}</p>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {(post.price || 0).toLocaleString('vi-VN')} ₫
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
                  <div>
                    <p className="font-semibold">Year</p>
                    <p>{post.year}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Miles</p>
                    <p>{post.miles?.toLocaleString()} km</p>
                  </div>
                  <div>
                    <p className="font-semibold">Type</p>
                    <p className="capitalize">{post.inventory_type}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Posted</p>
                    <p>{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(post._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Rejection reason:');
                      if (reason) handleReject(post._id, reason);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <a
                    href={`/cars/${post._id}`}
                    className="text-blue-600 px-4 py-2 border border-blue-600 rounded hover:bg-blue-50"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### User Car Listing Component

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CarListings() {
  const [cars, setCars] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    make: '',
    year: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchCars();
  }, [filters]);

  const fetchCars = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(
        `http://localhost:3000/api/cars?${params}`,
        { withCredentials: true }
      );

      setCars(response.data.data);
    } catch (error) {
      console.error('Failed to fetch cars:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page
    }));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Available Cars</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg mb-6 shadow">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="make"
            placeholder="Make (e.g., Toyota)"
            value={filters.make}
            onChange={handleFilterChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            name="year"
            placeholder="Year (e.g., 2020)"
            value={filters.year}
            onChange={handleFilterChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price (VND)"
            value={filters.minPrice}
            onChange={handleFilterChange}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price (VND)"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="border rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Car Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div key={car._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <img
              src={car.photo_links?.[0] || '/placeholder.jpg'}
              alt={car.heading}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{car.heading}</h3>
              <p className="text-2xl font-bold text-blue-600 my-2">
                {(car.price || 0).toLocaleString('vi-VN')} ₫
              </p>
              <div className="text-sm text-gray-600 mb-3">
                <p>{car.miles?.toLocaleString()} km</p>
                <p>{car.year} • {car.inventory_type}</p>
              </div>
              <div className="flex justify-between">
                <a href={`/cars/${car._id}`} className="text-blue-600 font-semibold hover:underline">
                  View Details
                </a>
                <span className="text-green-600 text-sm font-semibold">✓ Verified</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Status Reference

### Post Visibility

| Condition | Visible to Users | Visible to Admin |
|-----------|------------------|------------------|
| verified=true, paid | ✅ Yes | ✅ Yes |
| verified=false, paid | ❌ No | ✅ Yes (pending) |
| verified=false, unpaid | ❌ No | ✅ Yes (unpaid) |
| rejected | ❌ No | ✅ Yes (with reason) |
| deleted | ❌ No | ✅ No (soft deleted) |

---

## Approval Workflow

```
1. Seller pays 15,000 VND
   └─ PostingFee.paymentStatus = 'paid'
   └─ CarPost created with verified=false

2. Admin views unverified posts
   └─ GET /api/cars/admin/unverified

3. Admin reviews post
   └─ Checks quality, photos, accuracy
   └─ Verifies payment received

4. Admin approves or rejects
   └─ APPROVE: verified=true, approvedBy=admin_id, approvedAt=now
      └─ Post now visible to users
   └─ REJECT: rejectionReason set
      └─ Seller can resubmit or request refund

5. Post visible in user search
   └─ GET /api/cars filters only verified posts
```

---

## Error Handling

**Cannot Approve - Payment Not Verified**
```json
{
  "success": false,
  "message": "Cannot approve this post. The posting fee has not been paid."
}
```

**Admin Access Required**
```json
{
  "success": false,
  "message": "Admin access required"
}
```

**Post Not Found**
```json
{
  "success": false,
  "message": "Car post not found"
}
```

**Missing Rejection Reason**
```json
{
  "success": false,
  "message": "Please provide a rejection reason"
}
```

---

## Best Practices

1. **Always Check Payment:** Admins cannot approve unpaid posts
2. **Clear Rejection Reasons:** Help sellers understand why posts were rejected
3. **Regular Reviews:** Check unverified posts daily
4. **User Communication:** Notify sellers when posts are approved/rejected
5. **Filter Wisely:** Use admin view to focus on specific criteria (make, year, etc.)

---

**Last Updated:** December 15, 2024
**Status:** Production Ready
