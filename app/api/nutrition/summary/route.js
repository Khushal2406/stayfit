import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Meal from '@/models/Meal';
import User from '@/models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get user's details for calculations
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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

    // Initialize totals with safe default values
    const currentTotals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    };

    // Safely calculate totals from meals
    meals.forEach(meal => {
      if (meal.foods && Array.isArray(meal.foods)) {
        meal.foods.forEach(food => {
          if (food && food.nutrition) {
            currentTotals.calories += Number(food.nutrition.calories || 0);
            currentTotals.protein += Number(food.nutrition.protein || 0);
            currentTotals.carbs += Number(food.nutrition.carbs || 0);
            // Note: fat in nutrition model, fats in our totals
            currentTotals.fats += Number(food.nutrition.fat || 0);
          }
        });
      }
    });

    // Calculate targets based on weight and goals with safe defaults
    const weight = Number(user.weight) || 70; // Default to 70kg if no weight set
    const weeklyRate = Number(user.weeklyRate) || 0.5; // Default to 0.5kg per week
    
    // Calculate calorie adjustment only if both weight goal and current weight are set
    let calorieAdjustment = 0;
    if (user.weightGoal && user.weight) {
      // If target weight is more than current weight (bulk), add calories; otherwise subtract
      calorieAdjustment = (Number(user.weightGoal) > weight ? 1 : -1) * Math.round((7700 * weeklyRate) / 7);
    }

    // Base calorie target (can be adjusted based on activity level later)
    const baseCalories = Number(user.dailyCalorieTarget) || 2000;
    const targetCalories = Math.max(1200, baseCalories + calorieAdjustment); // Ensure minimum healthy calories

    // Calculate macro targets based on body weight
    const proteinTarget = Math.round(weight * 2); // 2g/kg
    const fatTarget = Math.round(weight * 1); // 1g/kg
    // Remaining calories from carbs, ensure it's not negative
    const carbTarget = Math.max(0, Math.round((targetCalories - (proteinTarget * 4 + fatTarget * 9)) / 4));

    // Return nutrition summary with safe number handling
    return NextResponse.json({
      success: true,
      calories: {
        current: Math.max(0, Math.round(Number(currentTotals.calories))),
        target: Math.max(1200, Math.round(Number(targetCalories))),
        adjustment: Math.round(Number(calorieAdjustment))
      },
      protein: {
        current: Math.max(0, Math.round(Number(currentTotals.protein))),
        target: Math.max(0, Math.round(Number(proteinTarget)))
      },
      carbs: {
        current: Math.max(0, Math.round(Number(currentTotals.carbs))),
        target: Math.max(0, Math.round(Number(carbTarget)))
      },
      fats: {
        current: Math.max(0, Math.round(Number(currentTotals.fats))),
        target: Math.max(0, Math.round(Number(fatTarget)))
      }
    });

  } catch (error) {
    console.error('Error getting nutrition summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get nutrition summary' },
      { status: 500 }
    );
  }
}
