import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/config';
import { Meal } from '@/models/Meal';
import { getNutritionInfo } from '@/lib/fatsecret';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    await connectDB();
    
    // Get today's meals
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const meals = await Meal.find({
      userId: session.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Group meals by type
    const groupedMeals = {
      breakfast: [],
      lunch: [],
      evening_snacks: [],
      dinner: []
    };

    meals.forEach(meal => {
      if (groupedMeals[meal.mealType]) {
        groupedMeals[meal.mealType].push(...meal.foods);
      }
    });

    return Response.json(groupedMeals);
  } catch (error) {
    console.error('Get meals error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { mealType, foodId } = await request.json();
    
    if (!mealType || !foodId) {
      return new Response('Meal type and food ID are required', { status: 400 });
    }

    await connectDB();

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get nutrition info for the food
    const nutrition = await getNutritionInfo(foodId);
    
    // Find or create today's meal of this type
    let meal = await Meal.findOne({
      userId: session.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      mealType
    });

    if (!meal) {
      meal = new Meal({
        userId: session.user.id,
        date: today,
        mealType,
        foods: []
      });    }

    // Add the food to the meal
    meal.foods.push({
      fatSecretId: foodId,
      name: nutrition.food_name,
      brandName: nutrition.brand_name,
      servingQty: nutrition.serving_qty,
      servingUnit: nutrition.serving_unit,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      imageUrl: nutrition.photo?.thumb
    });

    await meal.save();
    return Response.json(meal);
  } catch (error) {
    console.error('Add food error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mealId = searchParams.get('mealId');
    const foodId = searchParams.get('foodId');

    if (!mealId || !foodId) {
      return new Response('Meal ID and food ID are required', { status: 400 });
    }

    await connectDB();

    const meal = await Meal.findOne({
      _id: mealId,
      userId: session.user.id
    });

    if (!meal) {
      return new Response('Meal not found', { status: 404 });
    }

    // Remove the food from the meal    meal.foods = meal.foods.filter(food => food._id.toString() !== foodId);
    await meal.save();
    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete food error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
