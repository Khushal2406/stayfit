import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import foods from '@/foodinfo.json';

const extractNumber = (str) => {
  if (!str) return 0;
  const match = str.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase();
    const name = searchParams.get('name')?.toLowerCase();

    if (!query && !name) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (query) {
      // Search for food suggestions
      const results = foods
        .filter(food => {
          const foodName = String(food.name || food.food_link || '').toLowerCase();
          return foodName.includes(query);
        })
        .slice(0, 20) // Limit results
        .map(food => ({
          id: food.food_link || food.name,
          name: food.name || food.food_link,
          brand: food.brand || '',
          calories: extractNumber(food.nutri_energy), // Extract number from "84 kj (20 kcal)"
          protein: extractNumber(food.nutri_protein),
          carbs: extractNumber(food.nutri_carbohydrate),
          fat: extractNumber(food.nutri_fat),
          fiber: extractNumber(food.nutri_fiber),
          description: 'Per 100g serving'
        }))
        .filter(food => food.calories > 0); // Only include foods with valid calorie data

      return NextResponse.json({ 
        success: true, 
        results 
      });
    } 
    
    if (name) {
      // Get specific food details
      const food = foods.find(f => String(f.name || f.food_link || '').toLowerCase() === name);
      
      if (!food) {
        return NextResponse.json(
          { success: false, error: 'Food not found' },
          { status: 404 }
        );
      }

      const nutritionInfo = {
        id: food.food_link || food.name,
        name: food.name || food.food_link,
        brand: food.brand || '',
        calories: extractNumber(food.nutri_energy),
        protein: extractNumber(food.nutri_protein),
        carbs: extractNumber(food.nutri_carbohydrate),
        fat: extractNumber(food.nutri_fat),
        fiber: extractNumber(food.nutri_fiber),
        description: 'Per 100g serving'
      };

      return NextResponse.json({ 
        success: true,
        ...nutritionInfo
      });
    }
  } catch (error) {
    console.error('Nutrition search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search nutrition data' },
      { status: 500 }
    );
  }
}
