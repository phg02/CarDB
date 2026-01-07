import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import CarPost from './model/CarPost.js';
import News from './model/News.js';
import Order from './model/Order.js';
import Comment from './model/Comment.js';
import Payment from './model/Payment.js';
import PostingFee from './model/PostingFee.js';
import User from './model/User.js';

dotenv.config();

// Sample users to create
const sampleUsers = [
  {
    email: 'seller1@cardb.com',
    password: 'Password123!',
    name: 'Michael Johnson',
    phone: '+84901234567',
    role: 'user', // Regular user who will sell cars
    verified: true
  },
  {
    email: 'seller2@cardb.com',
    password: 'Password123!',
    name: 'Sarah Williams',
    phone: '+84902345678',
    role: 'user', // Regular user who will sell cars
    verified: true
  },
  {
    email: 'buyer1@cardb.com',
    password: 'Password123!',
    name: 'David Chen',
    phone: '+84903456789',
    role: 'user',
    verified: true
  }
];

// Seller 1's cars (10 cars - mix of approved and waitlist, including 1 cheap car)
const seller1Cars = [
  {
    heading: "2015 Honda City - Reliable Budget Sedan",
    price: 100000000, // 100 mil VND - CHEAP CAR
    miles: 85000,
    carfax_clean_title: true,
    inventory_type: "used",
    vin: "JHMAA8D46FC123001",
    photo_links: [
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"
    ],
    dealer: {
      street: "45 Nguyen Hue Street",
      city: "Ho Chi Minh City",
      state: "Ho Chi Minh",
      country: "Vietnam"
    },
    make: "Honda",
    model: "City",
    trim: "LX",
    year: 2015,
    body_type: "Sedan",
    exterior_color: "Silver",
    interior_color: "Gray Cloth",
    drivetrain: "FWD",
    transmission: "Automatic",
    fuel_type: "Gasoline",
    engine: "1.5L I4",
    engine_size: 1.5,
    doors: 4,
    std_seating: 5,
    highway_mpg: 40,
    city_mpg: 31,
    description: "Perfect first car or daily commuter! Well-maintained Honda City with excellent fuel economy. Clean title, no accidents.",
    paymentStatus: "paid",
    verified: true,
    status: "Available"
  },
  {
    heading: "2024 Toyota Camry XSE - Low Miles, Excellent Condition",
    price: 750000000,
    miles: 5200,
    carfax_clean_title: true,
    inventory_type: "new",
    vin: "4T1G11AK8RU123456",
    photo_links: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800"
    ],
    dealer: {
      street: "123 Main St",
      city: "Ho Chi Minh City",
      state: "Ho Chi Minh",
      country: "Vietnam"
    },
    make: "Toyota",
    model: "Camry",
    trim: "XSE",
    year: 2024,
    body_type: "Sedan",
    exterior_color: "Midnight Black Metallic",
    interior_color: "Black",
    drivetrain: "FWD",
    transmission: "Automatic",
    fuel_type: "Gasoline",
    engine: "2.5L I4",
    engine_size: 2.5,
    doors: 4,
    std_seating: 5,
    highway_mpg: 39,
    city_mpg: 28,
    description: "Beautiful 2024 Toyota Camry XSE with low miles. Well maintained, clean title, and loaded with features.",
    paymentStatus: "paid",
    verified: true,
    status: "Available"
  },
  {
    heading: "2023 Honda Civic Type R - Performance Edition",
    price: 1050000000,
    miles: 8500,
    carfax_clean_title: true,
    inventory_type: "used",
    vin: "SHHFK8G75NU123789",
    photo_links: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
      "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800",
      "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800"
    ],
    dealer: {
      street: "456 Auto Plaza",
      city: "Hanoi",
      state: "Hanoi",
      country: "Vietnam"
    },
    make: "Honda",
    model: "Civic",
    trim: "Type R",
    year: 2023,
    body_type: "Hatchback",
    exterior_color: "Championship White",
    interior_color: "Red/Black",
    drivetrain: "FWD",
    transmission: "Manual",
    fuel_type: "Gasoline",
    engine: "2.0L Turbo I4",
    engine_size: 2.0,
    doors: 4,
    std_seating: 5,
    highway_mpg: 31,
    city_mpg: 22,
    description: "Rare Honda Civic Type R with low miles. Perfect for enthusiasts!",
    paymentStatus: "paid",
    verified: true,
    status: "Available"
  },
  {
    heading: "2024 Mercedes-Benz E-Class E350 - Luxury Sedan",
    price: 1600000000,
    miles: 3200,
    carfax_clean_title: true,
    inventory_type: "new",
    vin: "WDDZF4KB5RA123456",
    photo_links: [
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800",
      "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800",
      "https://images.unsplash.com/photo-1614113489855-66422ad300a0?w=800"
    ],
    dealer: {
      street: "789 Luxury Lane",
      city: "Da Nang",
      state: "Da Nang",
      country: "Vietnam"
    },
    make: "Mercedes-Benz",
    model: "E-Class",
    trim: "E350",
    year: 2024,
    body_type: "Sedan",
    exterior_color: "Obsidian Black",
    interior_color: "Beige Leather",
    drivetrain: "AWD",
    transmission: "Automatic",
    fuel_type: "Gasoline",
    engine: "2.0L Turbo I4",
    engine_size: 2.0,
    doors: 4,
    std_seating: 5,
    highway_mpg: 32,
    city_mpg: 23,
    description: "Stunning Mercedes-Benz E-Class with all luxury features. Like new condition!",
    paymentStatus: "paid",
    verified: true,
    status: "Available"
  },
  {
    heading: "2023 Mazda CX-5 Turbo - Sporty SUV",
    price: 820000000,
    miles: 15000,
    carfax_clean_title: true,
    inventory_type: "new",
    vin: "JM3KFBDM5N0123456",
    photo_links: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
      "https://images.unsplash.com/photo-1600705722394-019a6e864a0c?w=800",
      "https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?w=800"
    ],
    dealer: {
      street: "234 SUV Boulevard",
      city: "Hanoi",
      state: "Hanoi",
      country: "Vietnam"
    },
    make: "Mazda",
    model: "CX-5",
    trim: "Turbo",
    year: 2023,
    body_type: "SUV",
    exterior_color: "Soul Red Crystal",
    interior_color: "Black Leather",
    drivetrain: "AWD",
    transmission: "Automatic",
    fuel_type: "Gasoline",
    engine: "2.5L Turbo I4",
    engine_size: 2.5,
    doors: 4,
    std_seating: 5,
    highway_mpg: 28,
    city_mpg: 22,
    description: "Sporty Mazda CX-5 Turbo with AWD. Great handling and premium interior!",
    paymentStatus: "paid",
    verified: true,
    status: "Available"
  },
  {
    heading: "2022 Hyundai Tucson - Modern Family SUV",
    price: 650000000,
    miles: 28000,
    carfax_clean_title: true,
    inventory_type: "used",
    vin: "5NMJC3DH8NH123456",
    photo_links: [
      "https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?w=800",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
      "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800"
    ],
    dealer: {
      street: "567 Family Drive",
      city: "Da Nang",
      state: "Da Nang",
      country: "Vietnam"
    },
    make: "Hyundai",
    model: "Tucson",
    trim: "SEL",
    year: 2022,
    body_type: "SUV",
    exterior_color: "White",
    interior_color: "Gray",
    drivetrain: "FWD",
    transmission: "Automatic",
    fuel_type: "Gasoline",
    engine: "2.5L I4",
    engine_size: 2.5,
    doors: 4,
    std_seating: 5,
    highway_mpg: 32,
    city_mpg: 26,
    description: "Modern Hyundai Tucson with advanced tech features. Perfect family SUV!",
    paymentStatus: "paid",
    verified: false, // WAITLIST
    status: "Available"
  },
  {
    heading: "2023 Kia Seltos - Compact Crossover",
    price: 580000000,
    miles: 12000,
    carfax_clean_title: true,
    inventory_type: "new",
    vin: "KNDEUCAA5P7123456",
    photo_links: [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
      "https://images.unsplash.com/photo-1619362280286-8e8d9e5c7f2c?w=800"
    ],
    dealer: {
      street: "890 Compact Lane",
      city: "Can Tho",
      state: "Can Tho",
      country: "Vietnam"
    },
    make: "Kia",
    model: "Seltos",
    trim: "EX",
    year: 2023,
    body_type: "SUV",
    exterior_color: "Neptune Blue",
    interior_color: "Black",
    drivetrain: "FWD",
    transmission: "CVT",
    fuel_type: "Gasoline",
    engine: "2.0L I4",
    engine_size: 2.0,
    doors: 4,
    std_seating: 5,
    highway_mpg: 34,
    city_mpg: 29,
    description: "Stylish Kia Seltos with great fuel economy. Loaded with safety features!",
    paymentStatus: "paid",
    verified: false, // WAITLIST
    status: "Available"
  },
  {
    heading: "2021 Toyota Corolla - Dependable Compact",
    price: 520000000,
    miles: 35000,
    carfax_clean_title: true,
    inventory_type: "used",
    vin: "2T1BURHE5MC123456",
    photo_links: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800",
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800"
    ],
    dealer: {
      street: "123 Economy Street",
      city: "Vung Tau",
      state: "Ba Ria-Vung Tau",
      country: "Vietnam"
    },
    make: "Toyota",
    model: "Corolla",
    trim: "LE",
    year: 2021,
    body_type: "Sedan",
    exterior_color: "Silver Metallic",
    interior_color: "Black",
    drivetrain: "FWD",
    transmission: "CVT",
    fuel_type: "Gasoline",
    engine: "1.8L I4",
    engine_size: 1.8,
    doors: 4,
    std_seating: 5,
    highway_mpg: 38,
    city_mpg: 30,
    description: "Reliable Toyota Corolla with excellent service history. Toyota quality!",
    paymentStatus: "paid",
    verified: true,
    status: "Available"
  },
  {
    heading: "2020 Nissan Kicks - Urban Crossover",
    price: 480000000,
    miles: 42000,
    carfax_clean_title: true,
    inventory_type: "used",
    vin: "3N1CP5CU6LL123456",
    photo_links: [
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
      "https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?w=800",
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800"
    ],
    dealer: {
      street: "456 Urban Avenue",
      city: "Nha Trang",
      state: "Khanh Hoa",
      country: "Vietnam"
    },
    make: "Nissan",
    model: "Kicks",
    trim: "SV",
    year: 2020,
    body_type: "SUV",
    exterior_color: "Orange",
    interior_color: "Black",
    drivetrain: "FWD",
    transmission: "CVT",
    fuel_type: "Gasoline",
    engine: "1.6L I4",
    engine_size: 1.6,
    doors: 4,
    std_seating: 5,
    highway_mpg: 36,
    city_mpg: 31,
    description: "Fun and efficient Nissan Kicks. Perfect for city driving!",
    paymentStatus: "paid",
    verified: false, // WAITLIST
    status: "Available"
  },
  {
    heading: "2019 Honda HR-V - Versatile Subcompact SUV",
    price: 550000000,
    miles: 48000,
    carfax_clean_title: true,
    inventory_type: "used",
    vin: "3CZRU6H59KM123456",
    photo_links: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
      "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800",
      "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800"
    ],
    dealer: {
      street: "789 Versatile Road",
      city: "Hue",
      state: "Thua Thien Hue",
      country: "Vietnam"
    },
    make: "Honda",
    model: "HR-V",
    trim: "EX",
    year: 2019,
    body_type: "SUV",
    exterior_color: "Blue",
    interior_color: "Black",
    drivetrain: "AWD",
    transmission: "CVT",
    fuel_type: "Gasoline",
    engine: "1.8L I4",
    engine_size: 1.8,
    doors: 4,
    std_seating: 5,
    highway_mpg: 34,
    city_mpg: 28,
    description: "Versatile Honda HR-V with AWD. Magic Seat provides excellent cargo flexibility!",
    paymentStatus: "paid",
    verified: true,
    status: "Available"
  },
  {
    heading: "2024 VinFast VF 8 Plus - Vietnamese Electric SUV",
    price: 980000000,
    miles: 2800,
    carfax_clean_title: true,
    inventory_type: "new",
    vin: "VF8XXNFUXX0123456",
    photo_links: [
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800"
    ],
    dealer: {
      street: "999 Electric Avenue",
      city: "Ho Chi Minh City",
      state: "Ho Chi Minh",
      country: "Vietnam"
    },
    make: "VinFast",
    model: "VF 8",
    trim: "Plus",
    year: 2024,
    body_type: "SUV",
    exterior_color: "Moonlight Blue",
    interior_color: "Black & White",
    drivetrain: "AWD",
    transmission: "Automatic",
    fuel_type: "Electric",
    engine: "Dual Motor Electric",
    doors: 4,
    std_seating: 5,
    description: "Vietnamese pride! VinFast VF 8 Plus electric SUV with impressive range and modern tech. Smart features, spacious interior, and zero emissions. Perfect for eco-conscious drivers!",
    paymentStatus: "paid",
    verified: true,
    status: "Available"
  }
];

// Seller 2's cars (10 cars - mix of approved and waitlist, including 1 cheap car)
const seller2Cars = [
  {
    heading: "2014 Toyota Vios - Budget Friendly Sedan",
    price: 100000000, // 100 mil VND - CHEAP CAR
    miles: 95000,
    carfax_clean_title: true,
    inventory_type: "used",
    vin: "VNKKTUD30FA123002",
    photo_links: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"
    ],
    dealer: {
      street: "78 Budget Auto Street",
      city: "Bien Hoa",
      state: "Dong Nai",
      country: "Vietnam"
    },
    make: "Toyota",
    model: "Vios",
    trim: "E",
    year: 2014,
    body_type: "Sedan",
    exterior_color: "White",
    interior_color: "Beige Cloth",
    drivetrain: "FWD",
    transmission: "Manual",
    fuel_type: "Gasoline",
    engine: "1.5L I4",
    engine_size: 1.5,
    doors: 4,
    std_seating: 5,
    highway_mpg: 42,
    city_mpg: 33,
    description: "Affordable Toyota Vios! Great fuel economy, reliable transportation. Perfect for students or first-time buyers!",
    paymentStatus: "paid",
    verified: true,
    status: "Available"
  },
  {
    heading: "2023 Ford F-150 Lightning - Electric Truck",
    price: 1680000000,
    miles: 12000,
    carfax_clean_title: true,
    inventory_type: "used",
    vin: "1FTVW1EL5PWG12345",
    photo_links: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
      "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800",
      "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800",
      "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800"
    ],
    dealer: {
      street: "321 Truck Ave",
      city: "Can Tho",
      state: "Can Tho",
      country: "Vietnam"
    },
    make: "Ford",
    model: "F-150",
    trim: "Lightning",
    year: 2023,
    body_type: "Truck",
    exterior_color: "Antimatter Blue",
    interior_color: "Black",
    drivetrain: "AWD",
    transmission: "Automatic",
    fuel_type: "Electric",
    engine: "Dual Motor Electric",
    doors: 4,
    std_seating: 5,
    description: "Revolutionary electric F-150 Lightning. Amazing power and efficiency!",
    paymentStatus: "paid",
    verified: true,
    status: "Available"
  },
  {
    heading: "2024 BMW X5 M50i - Premium SUV",
    price: 2080000000,
    miles: 4100,
    carfax_clean_title: true,
    inventory_type: "new",
    vin: "5UXCR6C04R9S12345",
    photo_links: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800"
    ],
    dealer: {
      street: "555 Premium Drive",
      city: "Nha Trang",
      state: "Khanh Hoa",
      country: "Vietnam"
    },
    make: "BMW",
    model: "X5",
    trim: "M50i",
    year: 2024,
    body_type: "SUV",
    exterior_color: "Alpine White",
    interior_color: "Cognac Leather",
    drivetrain: "AWD",
    transmission: "Automatic",
    fuel_type: "Gasoline",
    engine: "4.4L Twin-Turbo V8",
    engine_size: 4.4,
    doors: 4,
    std_seating: 7,
    highway_mpg: 24,
    city_mpg: 17,
    description: "Powerful BMW X5 M50i with incredible performance and luxury features.",
    paymentStatus: "paid",
    verified: true,
    status: "Available"
  },
  {
    heading: "2023 Tesla Model 3 Performance - Ultra Low Miles",
    price: 1260000000,
    miles: 6800,
    carfax_clean_title: true,
    inventory_type: "used",
    vin: "5YJ3E1EC3PF123456",
    photo_links: [
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800"
    ],
    dealer: {
      street: "888 Electric Blvd",
      city: "Vung Tau",
      state: "Ba Ria-Vung Tau",
      country: "Vietnam"
    },
    make: "Tesla",
    model: "Model 3",
    trim: "Performance",
    year: 2023,
    body_type: "Sedan",
    exterior_color: "Pearl White Multi-Coat",
    interior_color: "Black & White",
    drivetrain: "AWD",
    transmission: "Automatic",
    fuel_type: "Electric",
    engine: "Dual Motor Electric",
    doors: 4,
    std_seating: 5,
    description: "Tesla Model 3 Performance with incredible acceleration and tech features.",
    paymentStatus: "paid",
    verified: true,
    status: "Available"
  },
  {
    heading: "2024 Audi Q7 Premium Plus - Family SUV",
    price: 1650000000,
    miles: 2500,
    carfax_clean_title: true,
    inventory_type: "new",
    vin: "WA1LZAF73RD123456",
    photo_links: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800"
    ],
    dealer: {
      street: "100 Family Way",
      city: "Hue",
      state: "Thua Thien Hue",
      country: "Vietnam"
    },
    make: "Audi",
    model: "Q7",
    trim: "Premium Plus",
    year: 2024,
    body_type: "SUV",
    exterior_color: "Navarra Blue",
    interior_color: "Black",
    drivetrain: "AWD",
    transmission: "Automatic",
    fuel_type: "Gasoline",
    engine: "3.0L Turbo V6",
    engine_size: 3.0,
    doors: 4,
    std_seating: 7,
    highway_mpg: 27,
    city_mpg: 20,
    description: "Spacious Audi Q7 perfect for families. Loaded with technology and comfort features.",
    paymentStatus: "paid",
    verified: false, // WAITLIST
    status: "Available"
  },
  {
    heading: "2023 Porsche 911 Carrera - Sports Car Dream",
    price: 2900000000,
    miles: 3200,
    carfax_clean_title: true,
    inventory_type: "used",
    vin: "WP0AA2A99RS123456",
    photo_links: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800",
      "https://images.unsplash.com/photo-1614113489855-66422ad300a0?w=800"
    ],
    dealer: {
      street: "777 Sports Car Row",
      city: "Bien Hoa",
      state: "Dong Nai",
      country: "Vietnam"
    },
    make: "Porsche",
    model: "911",
    trim: "Carrera",
    year: 2023,
    body_type: "Coupe",
    exterior_color: "Racing Yellow",
    interior_color: "Black Leather",
    drivetrain: "RWD",
    transmission: "Automatic",
    fuel_type: "Gasoline",
    engine: "3.0L Twin-Turbo Flat-6",
    engine_size: 3.0,
    doors: 2,
    std_seating: 4,
    highway_mpg: 27,
    city_mpg: 18,
    description: "Iconic Porsche 911 with incredible performance and handling. A true driver's car!",
    paymentStatus: "paid",
    verified: false, // WAITLIST
    status: "Available"
  },
  {
    heading: "2024 Lexus RX 350h Hybrid - Luxury & Efficiency",
    price: 1370000000,
    miles: 4800,
    carfax_clean_title: true,
    inventory_type: "new",
    vin: "2T2HZMDA5RC123456",
    photo_links: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800"
    ],
    dealer: {
      street: "222 Hybrid Highway",
      city: "Quy Nhon",
      state: "Binh Dinh",
      country: "Vietnam"
    },
    make: "Lexus",
    model: "RX",
    trim: "350h",
    year: 2024,
    body_type: "SUV",
    exterior_color: "Caviar",
    interior_color: "Rioja Red",
    drivetrain: "AWD",
    transmission: "CVT",
    fuel_type: "Hybrid",
    engine: "2.5L I4 Hybrid",
    engine_size: 2.5,
    doors: 4,
    std_seating: 5,
    highway_mpg: 33,
    city_mpg: 37,
    description: "Luxurious Lexus RX Hybrid with excellent fuel economy and comfort.",
    paymentStatus: "paid",
    verified: true,
    status: "Available"
  },
  {
    heading: "2022 Subaru Outback - Adventure Ready",
    price: 780000000,
    miles: 22000,
    carfax_clean_title: true,
    inventory_type: "used",
    vin: "4S4BTANC1N3123456",
    photo_links: [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
      "https://images.unsplash.com/photo-1619362280286-8e8d9e5c7f2c?w=800",
      "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800",
      "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800"
    ],
    dealer: {
      street: "333 Adventure Road",
      city: "Da Lat",
      state: "Lam Dong",
      country: "Vietnam"
    },
    make: "Subaru",
    model: "Outback",
    trim: "Limited",
    year: 2022,
    body_type: "Wagon",
    exterior_color: "Forest Green",
    interior_color: "Brown Leather",
    drivetrain: "AWD",
    transmission: "CVT",
    fuel_type: "Gasoline",
    engine: "2.5L Flat-4",
    engine_size: 2.5,
    doors: 4,
    std_seating: 5,
    highway_mpg: 33,
    city_mpg: 26,
    description: "Adventure-ready Subaru Outback with legendary AWD. Perfect for outdoor enthusiasts!",
    paymentStatus: "paid",
    verified: true,
    status: "Available"
  },
  {
    heading: "2021 Volkswagen Tiguan - German Engineering",
    price: 680000000,
    miles: 32000,
    carfax_clean_title: true,
    inventory_type: "used",
    vin: "3VV2B7AX8MM123456",
    photo_links: [
      "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800",
      "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800",
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800"
    ],
    dealer: {
      street: "444 German Auto Street",
      city: "Ho Chi Minh City",
      state: "Ho Chi Minh",
      country: "Vietnam"
    },
    make: "Volkswagen",
    model: "Tiguan",
    trim: "SE",
    year: 2021,
    body_type: "SUV",
    exterior_color: "Dark Gray",
    interior_color: "Black",
    drivetrain: "AWD",
    transmission: "Automatic",
    fuel_type: "Gasoline",
    engine: "2.0L Turbo I4",
    engine_size: 2.0,
    doors: 4,
    std_seating: 5,
    highway_mpg: 29,
    city_mpg: 22,
    description: "Quality German engineering in the VW Tiguan. Spacious and refined!",
    paymentStatus: "paid",
    verified: false, // WAITLIST
    status: "Available"
  },
  {
    heading: "2020 Chevrolet Trailblazer - Bold Crossover",
    price: 560000000,
    miles: 38000,
    carfax_clean_title: true,
    inventory_type: "used",
    vin: "KL79MPSM3LB123456",
    photo_links: [
      "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
      "https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?w=800",
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800"
    ],
    dealer: {
      street: "555 Bold Street",
      city: "Hanoi",
      state: "Hanoi",
      country: "Vietnam"
    },
    make: "Chevrolet",
    model: "Trailblazer",
    trim: "LT",
    year: 2020,
    body_type: "SUV",
    exterior_color: "Red",
    interior_color: "Black",
    drivetrain: "FWD",
    transmission: "CVT",
    fuel_type: "Gasoline",
    engine: "1.3L Turbo I3",
    engine_size: 1.3,
    doors: 4,
    std_seating: 5,
    highway_mpg: 31,
    city_mpg: 28,
    description: "Bold and modern Chevy Trailblazer with surprising fuel efficiency!",
    paymentStatus: "paid",
    verified: true,
    status: "Available"
  }
];

// Sample news articles
const sampleNews = [
  {
    title: "2025 Electric Vehicle Market Outlook: What to Expect",
    content: "The electric vehicle market is set to experience unprecedented growth in 2025. Industry analysts predict that EV sales will increase by 40% compared to 2024, driven by improved battery technology, expanded charging infrastructure, and more affordable options.\n\nKey Trends to Watch\n\nMajor automakers are launching new electric models across all segments, from compact cars to full-size trucks. Battery range continues to improve, with many new models offering over 400 miles per charge.\n\nCharging Infrastructure Expansion\n\nGovernments and private companies are investing heavily in charging networks, making EV ownership more practical than ever. Fast-charging stations are becoming as common as gas stations in urban areas.\n\nFor car buyers, 2025 presents an excellent opportunity to switch to electric vehicles with more choices and better technology than ever before.",
    thumbnail: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
    images: []
  },
  {
    title: "Top 10 Most Reliable Used Cars of 2024",
    content: "Looking for a reliable used car? Our comprehensive analysis of repair records, owner surveys, and expert reviews has identified the most dependable used vehicles you can buy in 2024.\n\nThe Winners\n\n1. Toyota Camry - Legendary reliability and low maintenance costs\n2. Honda Accord - Excellent build quality and longevity\n3. Mazda CX-5 - Reliable SUV with great driving dynamics\n4. Lexus RX - Luxury and reliability combined\n5. Subaru Outback - Adventure-ready and dependable\n\nWhat Makes Them Stand Out\n\nThese vehicles consistently rank high in reliability surveys, have lower-than-average repair costs, and maintain their value well over time. They're proven choices for buyers who want peace of mind.",
    thumbnail: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800",
    images: []
  },
  {
    title: "How to Negotiate the Best Price on Your Next Car",
    content: "Buying a car is one of the biggest purchases you'll make, so getting the best price is crucial. Here are expert tips to help you negotiate effectively and save thousands.\n\nDo Your Research\n\nBefore visiting a dealership, research the market value of the car you want. Use online tools to see what others have paid and check for any available incentives or rebates.\n\nTiming Matters\n\nEnd of month, end of quarter, and end of year are typically the best times to buy as dealers are trying to meet sales goals. You may also find better deals on outgoing model years.\n\nNegotiation Strategies\n\n• Get pre-approved for financing to strengthen your position\n• Be prepared to walk away if the deal isn't right\n• Negotiate the total price, not monthly payments\n• Get quotes from multiple dealers\n\nWith preparation and patience, you can secure a great deal on your next vehicle.",
    thumbnail: "https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?w=800",
    images: []
  },
  {
    title: "Understanding Carfax Reports: A Buyer's Guide",
    content: "A Carfax report is an essential tool when buying a used car. It provides valuable information about the vehicle's history that can help you make an informed decision.\n\nWhat's in a Carfax Report?\n\nCarfax reports include:\n\n• Accident history and damage reports\n• Service and maintenance records\n• Number of previous owners\n• Title information (clean, salvage, rebuilt)\n• Odometer readings to detect fraud\n• Recall information\n\nRed Flags to Watch For\n\nBe cautious of vehicles with multiple accidents, flood damage, inconsistent odometer readings, or salvage titles. These issues can significantly impact the car's value and safety.\n\nAlways request a Carfax report before purchasing a used vehicle. The small cost is worth the peace of mind and protection against potential problems.",
    thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
    images: []
  },
  {
    title: "The Rise of Hybrid Technology: Best Hybrid Cars for 2025",
    content: "Hybrid vehicles offer the perfect balance between fuel efficiency and practicality. As technology advances, hybrids are becoming more powerful, efficient, and affordable than ever.\n\nTop Hybrid Picks for 2025\n\nToyota Prius - The pioneer continues to lead with excellent fuel economy and proven reliability.\n\nHonda Accord Hybrid - Spacious, comfortable, and incredibly efficient for a midsize sedan.\n\nLexus RX Hybrid - Luxury meets efficiency in this premium SUV.\n\nFord Maverick Hybrid - An affordable hybrid truck that's practical and fuel-efficient.\n\nWhy Choose Hybrid?\n\nHybrids offer better fuel economy than gas-only vehicles, lower emissions, and often require less maintenance on brakes thanks to regenerative braking. They're ideal for those not ready for full electric but want better efficiency.",
    thumbnail: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
    images: []
  }
];

// Connect to MongoDB and seed data
async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing data (except the original admin user)
    console.log('\n--- CLEARING EXISTING DATA ---');
    
    const deleteCarPosts = await CarPost.deleteMany({});
    console.log(`✓ Deleted ${deleteCarPosts.deletedCount} car posts`);
    
    const deleteNews = await News.deleteMany({});
    console.log(`✓ Deleted ${deleteNews.deletedCount} news articles`);
    
    const deleteOrders = await Order.deleteMany({});
    console.log(`✓ Deleted ${deleteOrders.deletedCount} orders`);
    
    const deleteComments = await Comment.deleteMany({});
    console.log(`✓ Deleted ${deleteComments.deletedCount} comments`);
    
    const deletePayments = await Payment.deleteMany({});
    console.log(`✓ Deleted ${deletePayments.deletedCount} payments`);
    
    const deletePostingFees = await PostingFee.deleteMany({});
    console.log(`✓ Deleted ${deletePostingFees.deletedCount} posting fees`);

    // Delete test users (but keep original admin)
    const deleteTestUsers = await User.deleteMany({ 
      email: { $in: sampleUsers.map(u => u.email) } 
    });
    console.log(`✓ Deleted ${deleteTestUsers.deletedCount} test users`);

    console.log('\n✓ All data cleared (original admin preserved)');

    // Create new test users
    console.log('\n--- CREATING TEST USERS ---');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      createdUsers.push(user);
      console.log(`✓ Created user: ${user.email} (${user.role})`);
    }

    const [seller1, seller2, buyer] = createdUsers;

    // Get admin for news articles
    const adminUser = await User.findOne({ role: 'admin', email: { $ne: seller1.email, $ne: seller2.email } });
    if (!adminUser) {
      console.log('⚠ No admin user found, using seller1 for news articles');
    }

    // Seed Seller 1's cars
    console.log('\n--- SEEDING SELLER 1 CARS ---');
    const seller1CarsWithSeller = seller1Cars.map(car => ({
      ...car,
      seller: seller1._id,
      approvedBy: car.verified ? (adminUser?._id || seller1._id) : null,
      approvedAt: car.verified ? new Date() : null
    }));

    const createdSeller1Cars = await CarPost.insertMany(seller1CarsWithSeller);
    const seller1Approved = createdSeller1Cars.filter(c => c.verified).length;
    const seller1Waitlist = createdSeller1Cars.filter(c => !c.verified).length;
    console.log(`✓ Created ${createdSeller1Cars.length} cars for ${seller1.email}`);
    console.log(`  - ${seller1Approved} approved`);
    console.log(`  - ${seller1Waitlist} in waitlist`);

    // Seed Seller 2's cars
    console.log('\n--- SEEDING SELLER 2 CARS ---');
    const seller2CarsWithSeller = seller2Cars.map(car => ({
      ...car,
      seller: seller2._id,
      approvedBy: car.verified ? (adminUser?._id || seller2._id) : null,
      approvedAt: car.verified ? new Date() : null
    }));

    const createdSeller2Cars = await CarPost.insertMany(seller2CarsWithSeller);
    const seller2Approved = createdSeller2Cars.filter(c => c.verified).length;
    const seller2Waitlist = createdSeller2Cars.filter(c => !c.verified).length;
    console.log(`✓ Created ${createdSeller2Cars.length} cars for ${seller2.email}`);
    console.log(`  - ${seller2Approved} approved`);
    console.log(`  - ${seller2Waitlist} in waitlist`);

    // Create some sold cars (orders)
    console.log('\n--- CREATING SOLD CARS (ORDERS) ---');
    const allApprovedCars = [...createdSeller1Cars, ...createdSeller2Cars].filter(c => c.verified);
    const soldCars = allApprovedCars.slice(0, 2); // Take first 2 approved cars as sold
    
    // Mark cars as sold
    for (const car of soldCars) {
      car.status = "Sold";
      car.sold = true;
      await car.save();
    }
    console.log(`✓ Marked ${soldCars.length} cars as sold`);

    // Create orders for sold cars
    const nameParts = buyer.name.split(' ');
    const orders = soldCars.map((car, index) => ({
      customer: buyer._id,
      firstName: nameParts[0] || 'David',
      lastName: nameParts.slice(1).join(' ') || 'Chen',
      email: buyer.email,
      phone: buyer.phone || '+84903456789',
      address: '123 Buyer Street',
      city: 'Ho Chi Minh City',
      state: 'Ho Chi Minh',
      country: 'VN',
      zipCode: '700000',
      items: [{
        carPost: car._id,
        seller: car.seller,
        title: car.heading,
        price: car.price,
        quantity: 1
      }],
      total: car.price,
      paymentMethod: index === 0 ? 'vnpay' : 'bank_transfer',
      paymentStatus: true,
      orderStatus: 'delivered',
      notes: 'Test order - vehicle sold'
    }));

    const createdOrders = await Order.insertMany(orders);
    console.log(`✓ Created ${createdOrders.length} orders for sold cars`);

    // Seed news articles
    console.log('\n--- SEEDING NEWS ARTICLES ---');
    const newsWithAuthor = sampleNews.map(article => ({
      ...article,
      author: adminUser?._id || seller1._id
    }));

    const createdNews = await News.insertMany(newsWithAuthor);
    console.log(`✓ Created ${createdNews.length} news articles`);

    // Summary
    const totalCars = createdSeller1Cars.length + createdSeller2Cars.length;
    const totalApproved = seller1Approved + seller2Approved;
    const totalWaitlist = seller1Waitlist + seller2Waitlist;
    const cheapCars = [...createdSeller1Cars, ...createdSeller2Cars].filter(c => c.price === 100000000 && c.verified);

    console.log('========================================');
    console.log('DATABASE SEEDING COMPLETED!');
    console.log('========================================');
    console.log(`✓ Test Users Created: ${createdUsers.length}`);
    console.log(`  - Sellers (users who sell): 2`);
    console.log(`  - Buyers (regular users): 1`);
    console.log('');
    console.log(`✓ Total Cars: ${totalCars}`);
    console.log(`  - Approved: ${totalApproved}`);
    console.log(`  - Waitlist: ${totalWaitlist}`);
    console.log(`  - Cheap Cars (100M VND, Approved): ${cheapCars.length}`);
    console.log('');
    console.log(`✓ Seller 1 (${seller1.email}): ${createdSeller1Cars.length} cars (includes VinFast electric)`);
    console.log(`✓ Seller 2 (${seller2.email}): ${createdSeller2Cars.length} cars`);
    console.log('');
    console.log(`✓ Sold Cars: ${soldCars.length}`);
    console.log(`✓ Orders: ${createdOrders.length}`);
    console.log(`✓ News Articles: ${createdNews.length}`);
    console.log('========================================');
    console.log('\nTest Account Credentials:');
    console.log('------------------------');
    sampleUsers.forEach(u => {
      console.log(`${u.email} / ${u.password}`);
    });
    console.log('========================================\n');

    mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
