import { GoogleGenerativeAI } from "@google/generative-ai";
import CarPost from '../model/CarPost.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple in-memory cache for chatbot responses
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(intent, filters) {
  return JSON.stringify({ intent, filters });
}

function isCacheValid(cacheEntry) {
  return Date.now() - cacheEntry.timestamp < CACHE_TTL;
}

function getCachedResponse(intent, filters) {
  const key = getCacheKey(intent, filters);
  const cached = responseCache.get(key);
  
  if (cached && isCacheValid(cached)) {
    console.log('Using cached response');
    return cached.data;
  }
  
  // Clean up expired cache entry
  if (cached) {
    responseCache.delete(key);
  }
  
  return null;
}

function setCachedResponse(intent, filters, data) {
  const key = getCacheKey(intent, filters);
  responseCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Validate Gemini filter output to avoid hallucinated DB queries
function sanitizeFilters(filters) {
  const valid = { 
    isDeleted: false, 
    verified: true,
    paymentStatus: 'paid'
  };

  if (!filters) return valid;

  // Match CarPost schema enums
  const allowedBodyTypes = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Van', 'Wagon', 'Convertible'];
  const allowedFuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];
  const allowedTransmissions = ['Automatic', 'Manual'];

  if (filters.body_type && allowedBodyTypes.includes(filters.body_type)) {
    valid.body_type = filters.body_type;
  }

  if (filters.fuel_type && allowedFuelTypes.includes(filters.fuel_type)) {
    valid.fuel_type = filters.fuel_type;
  }

  if (filters.transmission && allowedTransmissions.includes(filters.transmission)) {
    valid.transmission = filters.transmission;
  }

  if (filters.maxPrice && !isNaN(filters.maxPrice)) {
    valid.price = { $lte: Number(filters.maxPrice) };
  }

  if (filters.minPrice && !isNaN(filters.minPrice)) {
    valid.price = { ...valid.price, $gte: Number(filters.minPrice) };
  }

  if (filters.make) {
    valid.make = { $regex: filters.make, $options: 'i' };
  }

  if (filters.model) {
    valid.model = { $regex: filters.model, $options: 'i' };
  }

  if (filters.year) {
    valid.year = Number(filters.year);
  }

  if (filters.minYear && !isNaN(filters.minYear)) {
    valid.year = { ...valid.year, $gte: Number(filters.minYear) };
  }

  if (filters.maxYear && !isNaN(filters.maxYear)) {
    valid.year = { ...valid.year, $lte: Number(filters.maxYear) };
  }

  if (filters.city) {
    valid['dealer.city'] = { $regex: filters.city, $options: 'i' };
  }

  if (filters.minSeats && !isNaN(filters.minSeats)) {
    valid.std_seating = { $gte: Number(filters.minSeats) };
  }

  if (filters.minMPG && !isNaN(filters.minMPG)) {
    // Search for cars where EITHER highway OR city mpg is good enough
    valid.$or = [
      { highway_mpg: { $gte: Number(filters.minMPG) } },
      { city_mpg: { $gte: Number(filters.minMPG) } }
    ];
  }

  return valid;
}

/**
 * Helper to generate content with fallback models
 */
const generateContentSafe = async (prompt) => {
  // Updated model list based on available models for this API key
  const modelsToTry = ["gemma-3-12b-it", "gemini-2.5-flash-lite"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      return await model.generateContent(prompt);
    } catch (error) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
      // If it's a 429 (Quota), don't try other models as they share the quota usually, 
      // but sometimes different models have different quotas. 
      // However, 404 (Not Found) is definitely a reason to try the next one.
      if (error.status === 404 || (error.message && error.message.includes('not found'))) {
        continue;
      }
      // For other errors (like 429), we might want to stop or continue. 
      // Usually 429 is project-wide, so continuing might not help, but let's try anyway just in case.
      if (error.status === 429) {
         throw error; // Fail fast on rate limit
      }
    }
  }
  throw lastError;
};

/**
 * Handle chatbot conversation
 * @route POST /api/chatbot/chat
 */
export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // --- FIRST CALL: Ask Gemini to extract intent + filters ---
    const extractPrompt = `Extract intent and filters from user message.

Message: "${message}"

Instructions:
1. If user asks for "fuel saving", "efficient", or "good mpg", set "minMPG" to 30 (unless user specifies another number).
2. If user asks for seats (e.g. "7 seater"), set "minSeats" to that number.

Return JSON:
{
  "intent": "car_search" | "policy" | "troubleshooting" | "general",
  "filters": {
    "body_type": "Sedan"|"SUV"|"Truck"|"Coupe"|"Hatchback"|"Van"|"Wagon"|"Convertible"|null,
    "fuel_type": "Gasoline"|"Diesel"|"Electric"|"Hybrid"|"Plug-in Hybrid"|null,
    "transmission": "Automatic"|"Manual"|null,
    "make": string|null,
    "model": string|null,
    "year": number|null,
    "maxPrice": number|null,
    "minPrice": number|null,
    "city": string|null,
    "minSeats": number|null,
    "minMPG": number|null
  }
}`;

    const extractResponse = await generateContentSafe(extractPrompt);
    let extractText = extractResponse.response.text().trim();
    
    // Remove markdown code blocks if present
    extractText = extractText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const parsed = JSON.parse(extractText);

    const intent = parsed.intent;
    const filters = sanitizeFilters(parsed.filters);

    console.log('Chatbot Query Filters:', JSON.stringify(filters, null, 2));

    // Check cache first
    const cachedResponse = getCachedResponse(intent, filters);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    let cars = [];
    let finalPrompt = "";

    if (intent === "car_search") {
      console.log('Executing MongoDB Query:', JSON.stringify(filters, null, 2));
      
      // Query database for matching cars
      cars = await CarPost.find(filters)
        .limit(5)
        .select('make model year price body_type fuel_type transmission miles dealer std_seating highway_mpg city_mpg')
        .lean();

      console.log(`Found ${cars.length} cars`);

      finalPrompt = `You are a helpful car dealer assistant in Vietnam.
User message: "${message}"
Matched Cars: ${JSON.stringify(cars)}

Task: Recommend cars from the list.
Tone: Natural, professional, and helpful. Start with something like "Based on your search, here is what we have in stock...".
Details to mention: Highlight features relevant to the user's request (e.g., if they asked for seats, mention seat count; if fuel, mention MPG).
Currency: The 'price' field is already in VND. Display the exact value from the data followed by "VND" (e.g. "1,212 VND"). Do not convert, multiply, or change the unit.
Context: You are speaking to a Vietnamese consumer but in English.
Format: Keep the response in a single paragraph. Do not use line breaks, newlines (\\n), or bullet points.
If no matches found: "I couldn't find any cars matching those exact criteria in our current inventory. You might consider..."`;
    }

    if (intent === "policy") {
      finalPrompt = `Answer about our policies:

Policy: New/Used 6mo warranty, EV 8yr battery, 7-day return, financing 10% down 3.5-9% APR, free delivery 50km

Question: "${message}"`;
    }

    if (intent === "troubleshooting") {
      finalPrompt = `Help with car issue: "${message}"

Give safe, simple steps. Recommend mechanic if dangerous/complex.`;
    }

    if (intent === "general") {
      finalPrompt = `Answer: "${message}"`;
    }

    // --- SECOND CALL: Generate final response ---
    const finalResponse = await generateContentSafe(finalPrompt);

    const responseData = {
      success: true,
      intent,
      filters: parsed.filters,
      matchedCars: cars.length,
      reply: finalResponse.response.text()
    };

    // Cache the response
    setCachedResponse(intent, filters, responseData);

    res.json(responseData);

  } catch (err) {
    console.error('Chatbot error:', err);
    
    // Handle quota exceeded errors
    if (err.status === 429 || err.message?.includes('Quota exceeded')) {
      return res.status(429).json({ 
        success: false,
        error: 'Service temporarily unavailable due to rate limiting. Please try again in a few moments.' 
      });
    }

    if (err.message && err.message.includes('API key')) {
      return res.status(500).json({ 
        success: false,
        error: 'AI service configuration error. Please contact support.' 
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Failed to process your request. Please try again.' 
    });
  }
};
