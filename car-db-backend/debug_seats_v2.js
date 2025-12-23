import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CarPost from './model/CarPost.js';

dotenv.config();

async function debugSeats() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Check distinct values for std_seating
    const distinctSeats = await CarPost.distinct('std_seating');
    console.log('Distinct std_seating values:', distinctSeats);

    // 2. Check a few documents to see the field structure
    const sampleCars = await CarPost.find({}).limit(5).select('make model std_seating year');
    console.log('Sample cars:', JSON.stringify(sampleCars, null, 2));

    // 3. Test the query that the chatbot is using
    const query = { std_seating: { $gte: 5 } };
    const count = await CarPost.countDocuments(query);
    console.log(`Count of cars with std_seating >= 5 (raw): ${count}`);

    // 5. Check with status filters
    const statusQuery = { 
        std_seating: { $gte: 5 },
        isDeleted: false, 
        verified: true, 
        paymentStatus: 'paid' 
    };
    const statusCount = await CarPost.countDocuments(statusQuery);
    console.log(`Count of cars with std_seating >= 5 AND verified/paid: ${statusCount}`);
    
    if (statusCount === 0) {
        console.log("Checking why they are filtered out...");
        const rawCars = await CarPost.find({ std_seating: { $gte: 5 } }).select('make model verified paymentStatus isDeleted');
        console.log(JSON.stringify(rawCars, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugSeats();
