import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
const { connectDB } = require('@/lib/db');
const User = require('@/models/User');

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate BMR using the Mifflin-St Jeor Equation if we have all the data
    let targetCalories = user.dailyCalorieTarget;
    if (!targetCalories && user.gender && user.weight && user.height && user.age) {
      const bmr = user.gender === 'male'
        ? (10 * user.weight) + (6.25 * user.height) - (5 * user.age) + 5
        : (10 * user.weight) + (6.25 * user.height) - (5 * user.age) - 161;
      targetCalories = Math.round(bmr * 1.55); // Moderate activity level
    } else if (!targetCalories) {
      targetCalories = user.gender === 'male' ? 2500 : 2000; // Default values
    }
    
    // Calculate target macros based on daily calorie target
    const targetProtein = (targetCalories * 0.3) / 4; // 30% of calories from protein
    const targetCarbs = (targetCalories * 0.45) / 4;  // 45% of calories from carbs
    const targetFats = (targetCalories * 0.25) / 9;   // 25% of calories from fats

    // Check if nutrition tracking data is from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isToday = user.nutritionTracking?.date 
      ? new Date(user.nutritionTracking.date).setHours(0, 0, 0, 0) === today.getTime()
      : false;    const nutritionData = {
      calories: {
        current: isToday ? user.nutritionTracking?.calories || 0 : 0,
        target: targetCalories,
      },
      protein: {
        current: isToday ? user.nutritionTracking?.protein || 0 : 0,
        target: Math.round(targetProtein),
        percentage: isToday ? ((user.nutritionTracking?.protein || 0) / targetProtein) * 100 : 0,
      },
      carbs: {
        current: isToday ? user.nutritionTracking?.carbs || 0 : 0,
        target: Math.round(targetCarbs),
        percentage: isToday ? ((user.nutritionTracking?.carbs || 0) / targetCarbs) * 100 : 0,
      },
      fats: {
        current: isToday ? user.nutritionTracking?.fats || 0 : 0,
        target: Math.round(targetFats),
      },
    };    return Response.json(nutritionData);
  } catch (error) {
    console.error('Error in nutrition endpoint:', error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectDB();

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        nutritionTracking: {
          date: new Date(),
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fats: data.fats
        }
      },
      { new: true }
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ message: "Nutrition data updated successfully" });
  } catch (error) {
    console.error('Error updating nutrition data:', error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
