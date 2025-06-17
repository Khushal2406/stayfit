import fs from 'fs/promises';
import path from 'path';

// Cache for storing food database
let foodDatabase = null;
let lastModified = 0;
const nutritionCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function loadFoodDatabase() {
  try {
    const dbPath = path.join(process.cwd(), 'foodinfo.json');
    const stats = await fs.stat(dbPath);
    
    // Check if file has been modified since last load
    if (!foodDatabase || stats.mtimeMs > lastModified) {
      const data = await fs.readFile(dbPath, 'utf-8');
      foodDatabase = JSON.parse(data);
      lastModified = stats.mtimeMs;
      console.log('Reloaded food database with', foodDatabase.length, 'items');
    }
    
    return foodDatabase;
  } catch (error) {
    console.error('Failed to load food database:', error);
    throw new Error('Failed to load food database');
  }
}

function parseNutritionValue(value, isEnergy = false) {
  if (!value) return 0;
  
  if (isEnergy) {
    // Try to find kcal value first
    const kcalMatch = value.match(/\((\d+(?:\.\d+)?)\s*kcal\)/);
    if (kcalMatch) {
      return parseFloat(kcalMatch[1]);
    }
  }
  
  const match = value.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function formatNutritionData(foodItem) {
  return {
    name: foodItem.name,
    servingSize: foodItem.serving_size || 'Default serving',
    calories: parseNutritionValue(foodItem.nutri_energy, true),
    protein: parseNutritionValue(foodItem.nutri_protein),
    carbs: parseNutritionValue(foodItem.nutri_carbohydrate),
    fat: parseNutritionValue(foodItem.nutri_fat),
    fiber: parseNutritionValue(foodItem.nutri_fiber),
    sugars: parseNutritionValue(foodItem.nutri_sugars),
    description: foodItem.description || `${foodItem.name} by ${foodItem.brand || 'Unknown brand'}`
  };
}

export async function searchFoodSuggestions(query) {
  if (!query?.trim()) {
    return [];
  }
  try {
    const db = await loadFoodDatabase();
    
    if (!Array.isArray(db)) {
      throw new Error('Database is not properly loaded');
    }
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    if (searchTerms.length === 0) {
      return [];
    }
    
    const suggestions = db      .filter(food => {
        if (!food || typeof food.name !== 'string') return false;
        const foodName = food.name.toLowerCase();
        const foodBrand = typeof food.brand === 'string' ? food.brand.toLowerCase() : '';
        return searchTerms.every(term => 
          foodName.includes(term) || foodBrand.includes(term)
        );
      })
      .slice(0, 8) // Limit to 8 suggestions
      .map(food => ({
        name: food.name,
        description: `${food.brand ? `${food.brand} - ` : ''}${food.nutri_energy || ''}`
      }));

    return suggestions;
  } catch (error) {
    console.error('Food search error:', error);
    throw new Error(
      error.message === 'Failed to load food database' 
        ? 'Database is temporarily unavailable' 
        : 'Failed to get food suggestions'
    );
  }
}

export async function getNutritionInfo(foodName) {
  if (!foodName?.trim()) {
    throw new Error('Food name is required');
  }

  // Check cache first
  const cacheKey = foodName.toLowerCase();
  const cached = nutritionCache.get(cacheKey);
  if (cached && cached.timestamp > Date.now() - CACHE_DURATION) {
    return cached.data;
  }

  try {
    const db = await loadFoodDatabase();
    const food = db.find(item => 
      item.name.toLowerCase() === foodName.toLowerCase() ||
      (item.food_link && item.food_link.toLowerCase() === foodName.toLowerCase())
    );

    if (!food) {
      throw new Error('Food not found in database');
    }

    const nutritionData = formatNutritionData(food);
    
    // Cache the result
    nutritionCache.set(cacheKey, {
      timestamp: Date.now(),
      data: nutritionData
    });

    return nutritionData;
  } catch (error) {
    console.error('Nutrition info error:', error);
    throw new Error('Failed to get nutrition information');
  }
}
