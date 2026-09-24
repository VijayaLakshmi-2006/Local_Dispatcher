import Groq from 'groq-sdk';
import Product from '../models/Product.js';

export const parseShoppingPrompt = async (prompt) => {
  const apiKey = process.env.GROQ_API_KEY;
  let parsedResult;

  // Fetch unique categories and minimal product info to save tokens
  const allProducts = await Product.find({}).lean();
  
  // Create a minimal inventory context
  const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
  const inventoryContext = allProducts.map(p => p.name);

  if (!apiKey) {
    throw new Error('No GROQ_API_KEY present in environment');
  }

  try {
    const groq = new Groq({ apiKey });

    const systemPrompt = `
You are an advanced hyperlocal shopping and health assistant (ChatGPT + Instamart + Zepto + Pharmacy Assistant).
Given the user's input, perform Intent Classification, Entity Extraction, Priority Assignment, and Product Mapping.

Supported Intents:
"Grocery Purchase" | "Recipe Based Shopping" | "Health & Medical Needs" | "Household Shopping" | "Emergency Shopping" | "Bulk Shopping" | "Party/Event Planning"

Available Categories:
${JSON.stringify(uniqueCategories)}

Rules:
1. Intent Classification: Decide which of the intents best matches the query.
2. Entity Extraction: Extract recipe names, serving count, health symptoms, family size, duration, budget, etc.
3. Priority Assignment: Decide the order priority based on urgency. 
   - "NORMAL" for groceries, snacks, standard orders.
   - "HIGH" for parties, urgent needs, baby supplies.
   - "EMERGENCY" for severe medical needs, safety items, urgent health requirements like ORS or fever medicine.
4. Product Generation: Generate a COMPLETE, ITEMIZED shopping list based on the request.
   - For recipes (e.g., "Chicken biryani for 4 people"), determine EVERY necessary ingredient.
   - For events (e.g., "Pizza party for 6 guests"), determine all relevant items (drinks, food, supplies).
   - Scale the quantities intelligently based on the number of people, serving size, or duration. 2 people ≠ 4 people.
   - Provide realistic quantities and compatible units (e.g., kg, g, L, ml, packet, piece, dozen, bunch).
5. Product Mapping: Map the user's needs to general, commonly used product names (e.g., "Tomato", "Paneer", "Soft Drink", "Chips"). DO NOT invent fake products. 
6. If the request is too vague and confidence is low, set clarificationNeeded to true and ask a clarificationQuestion.

Return ONLY a valid JSON object matching this schema EXACTLY:
{
  "intent": "string (one of the intents)",
  "suggestedPriority": "string (NORMAL, HIGH, EMERGENCY)",
  "confidenceScore": "number (0.0 to 1.0)",
  "clarificationNeeded": "boolean",
  "clarificationQuestion": "string (or null)",
  "entities": {
    "recipeName": "string (or null)",
    "servingCount": "number (or null)",
    "healthSymptoms": ["array of strings"],
    "familySize": "number (or null)",
    "duration": "string (or null)",
    "budget": "number (or null, extracted as a number without currency symbol)"
  },
  "medicalDisclaimer": "string (or null)",
  "message": "string (A helpful message to the user based on their query)",
  "items": [
    {
      "productName": "General product name (e.g., Potato, Soft Drink)",
      "quantity": "number (calculated quantity)",
      "unit": "string (e.g., Kg, units, strips)",
      "category": "string"
    }
  ]
}
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `User Request: "${prompt}"` }
      ],
      model: "openai/gpt-oss-120b",
      response_format: { type: 'json_object' }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";
    const match = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = match ? match[0] : responseText;
    parsedResult = JSON.parse(cleanJson);

  } catch (error) {
    console.error("Groq API call or JSON Parse failed:", error);
    if (error.response) console.error(error.response);

    parsedResult = {
      intent: 'Search Fallback',
      confidenceScore: 0.1,
      clarificationNeeded: true,
      clarificationQuestion: "I'm having trouble connecting to my AI brain. Could you please specify exactly what you need from the catalog?",
      entities: {},
      message: "AI connection failed. Please search manually.",
      items: [],
      isFallback: true,
      error: error.message
    };
  }

  // Map returned products back to database objects
  const enrichedItems = [];
  let totalCost = 0;

  if (parsedResult.items && parsedResult.items.length > 0) {
    for (const item of parsedResult.items) {
      const searchTerm = item.productName.toLowerCase();
      
      let matchedDbProduct = allProducts.find(p => p.name.toLowerCase() === searchTerm);
      
      if (!matchedDbProduct) {
        matchedDbProduct = allProducts.find(p => p.name.toLowerCase().includes(searchTerm) || searchTerm.includes(p.name.toLowerCase()));
      }
      
      if (!matchedDbProduct) {
        matchedDbProduct = allProducts.find(p => p.category.toLowerCase().includes(searchTerm) || searchTerm.includes(p.category.toLowerCase()));
      }
      
      if (!matchedDbProduct) {
        matchedDbProduct = allProducts.find(p => p.description.toLowerCase().includes(searchTerm));
      }

      if (matchedDbProduct) {
        const itemPrice = matchedDbProduct.price * (1 - (matchedDbProduct.discount || 0) / 100);
        totalCost += (itemPrice * item.quantity);

        enrichedItems.push({
          ingredientName: item.productName,
          requiredQuantity: `${item.quantity} ${item.unit}`,
          rawQuantity: item.quantity,
          matchedProduct: {
            id: matchedDbProduct._id,
            name: matchedDbProduct.name,
            price: matchedDbProduct.price,
            discount: matchedDbProduct.discount,
            unit: matchedDbProduct.unit,
            brand: matchedDbProduct.brand,
            image: matchedDbProduct.image,
            stock: matchedDbProduct.stock,
            category: matchedDbProduct.category
          }
        });
      }
    }
  }

  const budget = parsedResult.entities?.budget;
  let budgetExceeded = false;
  if (budget && totalCost > budget) {
    budgetExceeded = true;
    parsedResult.message = `Your requested basket total (₹${totalCost.toFixed(2)}) exceeds your budget of ₹${budget}. We have provided the closest matches, but you may need to adjust quantities.`;
  }

  return {
    ...parsedResult,
    priority: parsedResult.suggestedPriority || 'NORMAL',
    category: parsedResult.intent, 
    dish: parsedResult.intent, 
    ingredients: enrichedItems,
    budgetExceeded,
    totalEstimatedCost: totalCost
  };
};
