import { GoogleGenerativeAI } from "@google/generative-ai";
import CarPost from '../model/CarPost.js';
import { VIETNAM_CAR_BRANDS } from '../services/vietnamCarBrands.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const BOT_NAME = "Carlo";

// Simple in-memory cache for chatbot responses
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1500; // 5 minutes

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
function sanitizeFilters(filters, hasSpecificMake = false) {
  const valid = { 
    isDeleted: false
  };
  
  // Only enforce verified + paid if user didn't specifically ask for a make/model
  // If they asked for a specific make/model, show all cars of that make regardless of verification status
  if (!hasSpecificMake) {
    valid.verified = true;
    valid.paymentStatus = 'paid';
  }

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
  // Use gemma-3-4b model
  const modelsToTry = ["gemma-3-4b-it"];
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

    // --- FIRST CALL: Check for inappropriate questions ---
    const inappropriateKeywords = [
      // Violence & Illegal Activities
      'hack', 'illegal', 'stolen', 'bomb', 'kill', 'violence', 'weapon', 'gun', 'explosives',
      'murder', 'kidnap', 'robbery', 'theft', 'steal', 'break-in', 'burglary',
      
      // Adult Content
      'adult', 'porn', 'sexual', 'sex', 'nude', 'naked', 'xxx', 'escort', 'prostitution',
      'pornographic', 'erotic',
      
      // Hate & Discrimination
      'racist', 'hate', 'racism', 'discrimination', 'sexism', 'sexist', 'homophobic',
      
      // Money Laundering & Fraud
      'launder', 'money laundering', 'fraud', 'scam', 'scheme', 'ponzi', 'counterfeit',
      'fake money', 'forge', 'forgery',
      
      // Drugs & Controlled Substances
      'drug', 'cocaine', 'heroin', 'meth', 'marijuana', 'cannabis', 'fentanyl',
      'dealer', 'smuggle', 'trafficking', 'opium',
      
      // Other Illegal Activities
      'human trafficking', 'slavery', 'exploit', 'abuse', 'assault', 'rape',
      'blackmail', 'extortion', 'bribery', 'corruption'
    ];
    
    const isInappropriate = inappropriateKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isInappropriate) {
      const responseData = {
        success: true,
        botName: BOT_NAME,
        intent: "inappropriate",
        filters: {},
        matchedCars: 0,
        reply: "I can't answer that."
      };
      return res.json(responseData);
    }

    // --- SECOND CALL: Ask Gemini to extract intent + filters ---
    const extractPrompt = `Extract intent and filters from user message.

Message: "${message}"

Instructions:
1. If user asks for "fuel saving", "efficient", or "good mpg", set "minMPG" to 30 (unless user specifies another number).
2. If user asks for seats (e.g. "7 seater"), set "minSeats" to that number.
3. IMPORTANT: If user mentions car brand or make (e.g. "ford", "toyota", "Honda", "BMW"), ALWAYS extract and set "make" field.
4. IMPORTANT: If user mentions car model or name (e.g. "Camry", "Civic", "Mustang"), ALWAYS extract and set "model" field.

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
    
    // Use comprehensive Vietnam car brands list for detection
    const messageLower = message.toLowerCase();
    
    // Auto-detect make if not extracted by Gemini
    if (!parsed.filters.make) {
      // Convert all brands to lowercase for comparison
      for (const brand of VIETNAM_CAR_BRANDS) {
        if (messageLower.includes(brand.toLowerCase())) {
          // Use proper casing from the official list
          parsed.filters.make = brand;
          console.log(`Auto-detected make from message: ${brand}`);
          break;
        }
      }
    }
    
    // Check if user specified a make or model - if so, we'll skip verification filters
    const hasSpecificMakeOrModel = parsed.filters.make || parsed.filters.model;
    
    // Now sanitize the filters (including the fallback-detected make)
    // Pass hasSpecificMakeOrModel to skip verification/payment filters if a make/model was specified
    let filters = sanitizeFilters(parsed.filters, hasSpecificMakeOrModel);

    console.log('Parsed Filters:', JSON.stringify(parsed.filters, null, 2));
    console.log('Has Specific Make/Model:', hasSpecificMakeOrModel);
    console.log('Sanitized Filters:', JSON.stringify(filters, null, 2));
    
    // If we detected a make or model, ensure intent is set to car_search
    const detectedMakeOrModel = filters.make || filters.model;
    const finalIntent = detectedMakeOrModel ? "car_search" : intent;

    console.log('\n====== CHATBOT REQUEST ======');
    console.log('User Message:', message);
    console.log('Gemini Intent:', intent);
    console.log('Final Intent:', finalIntent);
    console.log('Detected Make/Model:', detectedMakeOrModel);
    console.log('Parsed Filters:', JSON.stringify(parsed.filters, null, 2));
    console.log('Sanitized Filters for Query:', JSON.stringify(filters, null, 2));
    console.log('==============================\n');

    // SKIP CACHE FOR DEBUGGING - Comment this out later
    // const cachedResponse = getCachedResponse(finalIntent, filters);
    // if (cachedResponse) {
    //   return res.json(cachedResponse);
    // }

    let cars = [];
    let finalPrompt = "";

    // Check if user is asking for cheap/budget cars without specific details
    const cheapCarKeywords = ['cheap', 'affordable', 'budget', 'low cost', 'inexpensive', 'economical'];
    const isCheapCarQuery = cheapCarKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    // Check if user provided specific filtering criteria (price, fuel type, body type, make, model, etc.)
    const hasSpecificDetails = filters.maxPrice || filters.minPrice || filters.fuel_type || filters.body_type || filters.make || filters.model;

    if (isCheapCarQuery && !hasSpecificDetails) {
      const responseData = {
        success: true,
        botName: BOT_NAME,
        intent: "car_search",
        filters: parsed.filters,
        matchedCars: 0,
        reply: `I'd be happy to help you find an affordable car! To give you better recommendations, could you provide more details? For example: What's your budget (price range)? What fuel type do you prefer (Gasoline, Diesel, Electric, Hybrid)? Do you have a preference for body type (Sedan, SUV, Truck, etc.)? Any specific brand or model in mind? Once you provide these details, I can show you the best options for your budget.`
      };
      return res.json(responseData);
    }

    if (finalIntent === "car_search") {
      console.log('\n--- EXECUTING DATABASE QUERY ---');
      console.log('Query filters:', JSON.stringify(filters, null, 2));
      
      // Query database for matching cars
      cars = await CarPost.find(filters)
        .limit(5)
        .select('make model year price body_type fuel_type transmission miles dealer std_seating highway_mpg city_mpg')
        .lean();

      console.log(`Query returned ${cars.length} cars`);
      
      if (cars.length > 0) {
        console.log('Sample results:');
        cars.slice(0, 2).forEach((car, idx) => {
          console.log(`  Car ${idx + 1}: ${car.make} ${car.model} (${car.year})`);
        });
      }
      
      // If no cars found and user searched by make, run diagnostic queries
      if (cars.length === 0 && filters.make) {
        console.log('\n--- DIAGNOSTIC QUERIES ---');
        console.log('No results with strict filters. Running diagnostics...');
        
        // Show the exact make filter being used
        console.log('Make filter value:', filters.make);
        
        // Try a simple make query without other filters
        const simpleQuery = { make: filters.make, isDeleted: false };
        const simpleResults = await CarPost.find(simpleQuery).select('make model year verified paymentStatus');
        console.log(`Found ${simpleResults.length} cars with just make filter (ignoring verified/paid)`);
        
        if (simpleResults.length > 0) {
          console.log('Sample unverified/unpaid cars:');
          simpleResults.slice(0, 2).forEach((car, idx) => {
            console.log(`  Car ${idx + 1}: ${car.make} ${car.model} (verified=${car.verified}, paymentStatus=${car.paymentStatus})`);
          });
        }
        
        // List all available makes in database
        const allMakes = await CarPost.find({ isDeleted: false }).distinct('make');
        console.log('All makes in database:', allMakes);
        
        // List makes that are verified + paid
        const verifiedMakes = await CarPost.find({ isDeleted: false, verified: true, paymentStatus: 'paid' }).distinct('make');
        console.log('Verified + Paid makes:', verifiedMakes);
      }
      
      console.log('--- END QUERY ---\n');

      // If no cars found, provide helpful guidance based on what they searched for
      if (cars.length === 0) {
        let noResultsMessage = `Sorry, we don't have any cars matching your search criteria at the moment.`;
        
        // Add helpful suggestions based on what they searched for
        if (filters.make) {
          const makeValue = parsed.filters.make;
          noResultsMessage = `We currently don't have any ${makeValue} vehicles available in our verified inventory.`;
        }
        if (filters.maxPrice) {
          noResultsMessage += ` Try increasing your budget range to see more options.`;
        }
        if (isCheapCarQuery) {
          noResultsMessage += ` Would you like to provide more details about your budget range, preferred fuel type (Gasoline, Diesel, Electric, Hybrid), or body type (Sedan, SUV, Truck, etc.)?`;
        } else if (filters.make) {
          noResultsMessage += ` We recommend checking back soon, or would you like to search for a different brand?`;
        } else {
          noResultsMessage += ` Please try adjusting your preferences or check back later.`;
        }

        const responseData = {
          success: true,
          botName: BOT_NAME,
          intent: finalIntent,
          filters: parsed.filters,
          matchedCars: 0,
          reply: noResultsMessage
        };
        return res.json(responseData);
      }

      finalPrompt = `You are ${BOT_NAME}, a helpful car dealer assistant in Vietnam.
User message: "${message}"
Matched Cars: ${JSON.stringify(cars)}

Task: Recommend cars from the list.
Tone: Natural, professional, and helpful. Start with something like "Based on your search, here is what we have in stock...".
Details to mention: Highlight features relevant to the user's request (e.g., if they asked for seats, mention seat count; if fuel, mention MPG).
Currency: The 'price' field is already in VND. Display the exact value from the data followed by "VND" (e.g. "1,212 VND"). Do not convert, multiply, or change the unit.
Context: You are speaking to a Vietnamese consumer but in English.
Format: Keep the response in a single paragraph. Do not use line breaks, newlines (\\n), or bullet points. Do not use markdown formatting. Limit your response to maximum 150 words.`;
    }

    if (finalIntent === "policy") {
      finalPrompt = `You are ${BOT_NAME}, a helpful car dealer assistant in Vietnam.
Answer about our policies:

Policy: New/Used 6mo warranty, EV 8yr battery, 7-day return, financing 10% down 3.5-9% APR, free delivery 50km

Question: "${message}"

Do not use markdown formatting. Limit your response to maximum 150 words.`;
    }

    if (finalIntent === "troubleshooting") {
      finalPrompt = `You are ${BOT_NAME}, a helpful car assistant.
Help with car issue: "${message}"

Give safe, simple steps. Recommend mechanic if dangerous/complex. Do not use markdown formatting. Limit your response to maximum 150 words.`;
    }

    if (finalIntent === "general") {
      finalPrompt = `You are ${BOT_NAME}. Answer: "${message}"

Do not use markdown formatting. Limit your response to maximum 150 words.`;
    }

    // --- SECOND CALL: Generate final response ---
    const finalResponse = await generateContentSafe(finalPrompt);

    const responseData = {
      success: true,
      botName: BOT_NAME,
      intent: finalIntent,
      filters: parsed.filters,
      matchedCars: cars.length,
      reply: finalResponse.response.text()
    };

    // SKIP CACHE FOR DEBUGGING - Comment this out later
    // setCachedResponse(finalIntent, filters, responseData);

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
