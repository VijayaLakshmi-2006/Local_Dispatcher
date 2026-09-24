import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key:', apiKey ? 'Loaded' : 'Missing');

if (apiKey) {
  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const systemPrompt = `
    You are a smart shopping list compiler for a MERN hyperlocal delivery application.
    The user will describe their cooking, pharmacy/medicine, electronics/charging, or household cleaning needs (e.g. "iPhone charger", "cold relief for 2 people", "make biryani for five people").
    You must output ONLY a valid JSON object. Do not wrap it in markdown blocks, do not explain. Just the JSON.

    The JSON schema MUST be:
    {
      "category": "One of: Groceries | Vegetables | Fruits | Dairy | Beverages | Snacks | Household | Pharmacy | Electronics | Fast Food",
      "dish": "Intent / Dish / Use Case Title identified (e.g., Cold & Flu Relief, iPhone Charging Accessories, Veg Burger Meal, Chicken Biryani)",
      "people": number_of_people_estimated (default to 2 if not mentioned),
      "duration": "duration of treatment or supply if mentioned (e.g., '3 days', '1 week') or null",
      "ingredients": [
        {
          "product": "Ingredient or product category name (e.g. Basmati Rice, Calpol 650mg, USB-C Cable, French Fries, Onion, Milk, Toilet Cleaner)",
          "quantity": "Scaled quantity with unit based on people count/duration (e.g. 1.5 Kg, 1 strip, 1 unit, 2 packs)",
          "category": "Matching item category: Groceries | Vegetables | Fruits | Dairy | Beverages | Snacks | Household | Pharmacy | Electronics | Fast Food"
        }
      ]
    }

    Estimate standard items lists and scale quantities realistically for the given number of people or duration.
  `;

  async function test() {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\nUser Request: "chicken biryani"` }] }]
      });
      const responseText = result.response.text().trim();
      console.log('Raw Response:', responseText);
      const cleanJson = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
      const parsedResult = JSON.parse(cleanJson);
      console.log('Parsed JSON:', parsedResult);
    } catch (e) {
      console.error('Error:', e);
    }
  }
  test();
}
