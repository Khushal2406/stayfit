import { getNutritionInfo } from '@/lib/ai-nutrition';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
const { connectDB } = require('@/lib/db');
const User = require('@/models/User');
import { NextResponse } from 'next/server';
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

    // Get user details for weight-based calculations
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all meals for today
    const meals = await Meal.find({
      userId: session.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Calculate totals
    let totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    };

    meals.forEach(meal => {
      meal.foods.forEach(food => {
        totals.calories += Number(food.nutrition.calories) || 0;
        totals.protein += Number(food.nutrition.protein) || 0;
        totals.carbs += Number(food.nutrition.carbs) || 0;
        totals.fats += Number(food.nutrition.fat) || 0;
      });
    });

    // Calculate targets based on weight and goals
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

    // Return nutrition summary with properly formatted numbers
    return NextResponse.json({
      success: true,
      calories: {
        current: Math.max(0, Math.round(totals.calories)),
        target: Math.round(targetCalories),
        adjustment: Math.round(calorieAdjustment)
      },
      protein: {
        current: Math.max(0, Math.round(totals.protein)),
        target: Math.round(proteinTarget)
      },
      carbs: {
        current: Math.max(0, Math.round(totals.carbs)),
        target: Math.round(carbTarget)
      },
      fats: {
        current: Math.max(0, Math.round(totals.fats)),
        target: Math.round(fatTarget)
      }
    });

  } catch (error) {
    console.error('Nutrition summary error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get nutrition summary' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          nutritionTracking: {
            date: new Date(),
            calories: data.calories,
            protein: data.protein,
            carbs: data.carbs,
            fats: data.fats
          }
        }
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Nutrition data updated successfully" });
  } catch (error) {
    console.error('Error updating nutrition data:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
