# Database Reset and Seed Summary

## Executed on: January 6, 2026

### What Was Done:
The database was successfully cleared (except original admin users) and seeded with fresh test data including 3 test users, 21 car listings, 5 news articles, and 2 orders.

### Data Cleared:
- ✓ All car posts (21 removed)
- ✓ All news articles (5 removed)
- ✓ All orders (2 removed)
- ✓ All comments
- ✓ All payments
- ✓ All posting fees
- ✓ Test user accounts (3 removed)
- **✓ Original admin accounts preserved**

### New Test Users Created:

#### Seller Accounts (2)
1. **seller1@cardb.com** / Password123!
   - Role: user
   - Verified: true
   - Sells: 11 cars (includes VinFast electric)

2. **seller2@cardb.com** / Password123!
   - Role: user
   - Verified: true
   - Sells: 10 cars

#### Buyer Account (1)
3. **buyer1@cardb.com** / Password123!
   - Role: user
   - Verified: true
   - Has purchased 2 cars

### New Data Seeded:

#### 1. Car Listings - Seller 1 (11 cars)

**Approved Cars (8):**
1. 2024 Toyota Camry XSE - ₫750,000,000 (used) - SOLD
2. 2023 Honda Civic Type R - ₫1,050,000,000 (new) - SOLD
3. 2024 Mercedes-Benz E-Class E350 - ₫1,600,000,000 (new)
4. 2023 Ford F-150 Lightning - ₫1,680,000,000 (used)
5. 2024 BMW X5 M50i - ₫2,080,000,000 (new)
6. 2023 Tesla Model 3 Performance - ₫1,260,000,000 (used)
7. 2021 Toyota Corolla LE - ₫420,000,000 (used)
8. 2025 VinFast VF 8 Plus - ₫980,000,000 (new)

**Waitlist Cars (3):**
1. 2024 Audi Q7 Premium Plus - ₫1,650,000,000 (new)
2. 2023 Porsche 911 Carrera - ₫2,900,000,000 (used)
3. 2024 Lexus RX 350h Hybrid - ₫1,370,000,000 (new)

#### 2. Car Listings - Seller 2 (10 cars)

**Approved Cars (7):**
1. 2022 Hyundai Tucson Limited - ₫660,000,000 (used)
2. 2023 Mazda CX-5 Turbo - ₫850,000,000 (used)
3. 2024 Kia Sportage SX - ₫720,000,000 (used)
4. 2015 Honda City - ₫100,000,000 (used) 🔥 Budget Pick
5. 2024 Toyota RAV4 Hybrid - ₫950,000,000 (new)
6. 2023 Nissan Rogue SL - ₫680,000,000 (used)
7. 2014 Toyota Vios - ₫100,000,000 (used) 🔥 Budget Pick

**Waitlist Cars (3):**
1. 2024 Chevrolet Tahoe High Country - ₫1,950,000,000 (new)
2. 2023 Jeep Wrangler Rubicon - ₫1,100,000,000 (used)
3. 2024 Volkswagen Tiguan R-Line - ₫820,000,000 (new)

#### Summary Stats:
- **Total Cars:** 21
- **Approved:** 15 (8 new, 7 used)
- **Waitlist:** 6 (5 new, 1 used)
- **Sold:** 2
- **Budget Cars (≤100M VND):** 2 (both approved)
- **Images per car:** 2-4 photos

#### 3. Orders (2)

**Order #1 - Toyota Camry**
- Customer: buyer1@cardb.com
- Total: ₫750,000,000
- Payment Method: VNPay
- Status: Delivered

**Order #2 - Honda Civic Type R**
- Customer: buyer1@cardb.com
- Total: ₫1,050,000,000
- Payment Method: Bank Transfer
- Status: Delivered

#### 4. News Articles (5)

All articles include:
1. "2025 Electric Vehicle Market Outlook: What to Expect"
2. "Top 10 Most Reliable Used Cars of 2024"
3. "How to Negotiate the Best Price on Your Next Car"
4. "Understanding Carfax Reports: A Buyer's Guide"
5. "The Rise of Hybrid Technology: Best Hybrid Cars for 2025"

**Article Format:**
- Plain text content with line breaks
- Thumbnail images from Unsplash
- Author: admin user
- Created date: January 6, 2026

### How to Use:

#### Run the seed script:
```bash
cd car-db-backend
node seedData.js
```

This will:
1. Clear all data except original admin users
2. Create 3 test user accounts
3. Seed 21 car listings (11 for seller1, 10 for seller2)
4. Create 2 sold cars with complete orders
5. Seed 5 news articles

#### Test Account Credentials:
```
seller1@cardb.com / Password123!
seller2@cardb.com / Password123!
buyer1@cardb.com / Password123!
```

### Key Features:

#### Cars:
- 2-4 images per listing
- Mix of new (8) and used (13) inventory
- Mix of approved (15) and waitlist (6) status
- 2 budget-friendly cars at 100M VND
- VinFast electric vehicle included
- High-quality Unsplash images
- Complete specifications and dealer info
- Vietnamese cities (HCMC, Hanoi, Da Nang, etc.)

#### News:
- Plain text format (no HTML tags)
- Proper line breaks for readability
- Professional automotive content
- Thumbnail images included

#### Orders:
- Complete billing information
- Multiple payment methods (VNPay, Bank Transfer)
- Order status tracking
- Customer details from buyer account

### What's Preserved:
- ✅ Original admin accounts (including passwords and roles)
- ✅ Authentication data
- ✅ User profiles

### What Gets Reset:
- ❌ Test user accounts (recreated fresh)
- ❌ All car listings
- ❌ All news articles
- ❌ All orders
- ❌ All comments, payments, posting fees

This allows you to test the application with consistent, fresh data while keeping your original admin accounts intact.
