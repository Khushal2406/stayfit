const CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;
const BASE_URL = 'https://platform.fatsecret.com/rest/server.api';

import crypto from 'crypto';

function generateOAuthSignature(method, url, params, consumerSecret) {
  // Create a new array of encoded key-value pairs
  const encodedPairs = Array.from(params.entries()).map(([key, value]) => {
    return [
      encodeURIComponent(key),
      encodeURIComponent(value)
    ];
  });

  // Sort by encoded key and value
  encodedPairs.sort(([keyA, valueA], [keyB, valueB]) => {
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    if (valueA < valueB) return -1;
    if (valueA > valueB) return 1;
    return 0;
  });

  // Create parameter string with properly encoded values
  const paramString = encodedPairs
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
    .replace(/%20/g, '+');

  // Create base string
  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(paramString)
  ].join('&');

  // Create signing key (secret key only needs to be encoded once)
  const signingKey = `${encodeURIComponent(consumerSecret)}&`;

  // Generate signature
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  return signature;
}

let accessToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  if (accessToken && tokenExpiry && tokenExpiry > Date.now()) {
    return accessToken;
  }

  const response = await fetch('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'basic',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000);
  return accessToken;
}

export async function searchFood(query) {
  try {
    const params = new URLSearchParams({
      method: 'foods.search',
      search_expression: query,
      format: 'json',
      max_results: 20,
      oauth_consumer_key: CLIENT_ID,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: Math.random().toString(36).substring(2),
      oauth_version: '1.0'
    });

    // Generate and add signature
    const signature = generateOAuthSignature('POST', BASE_URL, params, CLIENT_SECRET);
    params.append('oauth_signature', signature);

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    if (!response.ok) {
      console.error('FatSecret API error:', await response.text());
      throw new Error('Failed to search foods');
    }

    const data = await response.json();
    console.log('FatSecret search response:', JSON.stringify(data, null, 2));
    
    if (!data.foods?.food) {
      return { results: [] };
    }

    // Normalize to array even if single result
    const foods = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];
    
    return {
      results: foods.map(food => ({
        id: food.food_id,
        name: food.food_name,
        brandName: food.brand_name || '',
        servingQty: 1,  // Default serving
        servingUnit: 'serving',
        nutrition: {
          calories: food.food_description ? parseInt(food.food_description.match(/\d+(?=\s*kcal)/) || '0') : 0,
          protein: food.food_description ? parseFloat(food.food_description.match(/Protein:\s*(\d+(?:\.\d+)?)g/)?.[1] || '0') : 0,
          carbs: food.food_description ? parseFloat(food.food_description.match(/Carbs:\s*(\d+(?:\.\d+)?)g/)?.[1] || '0') : 0,
          fat: food.food_description ? parseFloat(food.food_description.match(/Fat:\s*(\d+(?:\.\d+)?)g/)?.[1] || '0') : 0
        }
      }))
    };
  } catch (error) {
    console.error('Search food error:', error);
    throw error;
  }
}

export async function getNutritionInfo(foodId) {
  try {
    const params = new URLSearchParams({
      method: 'food.get.v2',
      food_id: foodId,
      format: 'json',
      oauth_consumer_key: CLIENT_ID,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: Math.random().toString(36).substring(2),
      oauth_version: '1.0'
    });

    // Generate and add signature
    const signature = generateOAuthSignature('POST', BASE_URL, params, CLIENT_SECRET);
    params.append('oauth_signature', signature);

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    if (!response.ok) {
      console.error('FatSecret API error:', await response.text());
      throw new Error('Failed to get food information');
    }

    const data = await response.json();
    const food = data.food;
    const servings = Array.isArray(food.servings.serving) ? 
      food.servings.serving : [food.servings.serving];
    
    // Use the first serving as default
    const serving = servings[0];
    
    return {
      food_name: food.food_name,
      brand_name: food.brand_name,
      serving_qty: parseFloat(serving.number_of_units) || 1,
      serving_unit: serving.serving_description || 'serving',
      calories: parseFloat(serving.calories),
      protein: parseFloat(serving.protein),
      carbs: parseFloat(serving.carbohydrate),
      fat: parseFloat(serving.fat),
      photo: {
        thumb: food.food_image // FatSecret might provide image URL
      }
    };
  } catch (error) {
    console.error('Get nutrition info error:', error);
    throw error;
  }
}
