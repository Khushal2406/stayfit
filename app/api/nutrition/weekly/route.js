import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import Meal from '@/models/Meal';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // Get last 7 days including today

    // Get all meals for the last 7 days
    const meals = await Meal.find({
      userId: session.user.id,
      createdAt: {
        $gte: sevenDaysAgo,
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      }
    }).select('createdAt foods');

    // Get user's calorie goal
    const user = await User.findById(session.user.id).select('calorieGoal');    const calorieGoal = user?.calorieGoal || 2000; // Default to 2000 if not set

    // Process meals into daily totals
    const dailyCalories = new Map();
    
    // Initialize all 7 days with 0 calories
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      dailyCalories.set(dateString, 0);
    }

    // Sum up calories for each day
    meals.forEach((meal) => {
      const dateString = meal.createdAt.toISOString().split('T')[0];
      const dayCalories = meal.foods.reduce((sum, food) => {
        return sum + (Number(food.nutrition.calories) || 0);
      }, 0);
      
      if (dailyCalories.has(dateString)) {
        dailyCalories.set(dateString, (dailyCalories.get(dateString) || 0) + dayCalories);
      }
    });

    // Convert to array and sort by date
    const weeklyData = Array.from(dailyCalories.entries())
      .map(([date, calories]) => ({
        date,
        calories: Math.round(calories),
        goalMet: calories >= calorieGoal,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return NextResponse.json({
      success: true,
      weeklyData,
      calorieGoal,
    });
  } catch (error) {
    console.error('Error fetching weekly nutrition data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly nutrition data' },
      { status: 500 }
    );
  }
}
