import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Meal from '@/models/Meal';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Query for today's meals
    const meals = await Meal.find({
      userId: session.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort({ date: 1 });

    // Group meals by type
    const groupedMeals = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };

    for (const meal of meals) {
      if (groupedMeals[meal.mealType]) {
        groupedMeals[meal.mealType].push(...meal.foods);
      }
    }

    return NextResponse.json({ 
      success: true, 
      meals: groupedMeals
    });

  } catch (error) {
    console.error('Get meals error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch meals' 
    }, { 
      status: 500 
    });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { mealType, food } = await request.json();
    
    if (!mealType || !food) {
      return NextResponse.json(
        { success: false, error: 'Meal type and food data are required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find or create today's meal
    let meal = await Meal.findOne({
      userId: session.user.id,
      mealType,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (!meal) {
      meal = new Meal({
        userId: session.user.id,
        mealType,
        date: today,
        foods: []
      });
    }

    // Add the new food
    meal.foods.push({
      id: food.id,
      name: food.name,
      servingSize: food.servingSize,
      nutrition: {
        calories: food.nutrition.calories,
        protein: food.nutrition.protein,
        carbs: food.nutrition.carbs,
        fat: food.nutrition.fat,
        fiber: food.nutrition.fiber || 0,
        sugars: food.nutrition.sugars || 0
      }
    });

    await meal.save();

    return NextResponse.json({ 
      success: true,
      message: 'Food added successfully'
    });

  } catch (error) {
    console.error('Add meal error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add food to meal' 
    }, { 
      status: 500 
    });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mealId = searchParams.get('mealId');
    const foodId = searchParams.get('foodId');

    if (!mealId || !foodId) {
      return Response.json(
        { success: false, error: 'Meal ID and food ID are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const meal = await Meal.findOne({
      _id: mealId,
      userId: session.user.id
    });

    if (!meal) {
      return Response.json(
        { success: false, error: 'Meal not found' },
        { status: 404 }
      );
    }

    meal.foods = meal.foods.filter(food => food._id.toString() !== foodId);
    await meal.save();
    
    return Response.json({ success: true, meal });
  } catch (error) {
    console.error('Delete food error:', error);
    return Response.json(
      { success: false, error: error.message || 'Failed to delete food' },
      { status: 500 }
    );
  }
}
