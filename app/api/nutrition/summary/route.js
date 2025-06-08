import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/config';
import { Meal } from '@/models/Meal';

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

    // Calculate daily totals
    const summary = meals.reduce((acc, meal) => {
      meal.foods.forEach(food => {
        acc.calories += food.calories || 0;
        acc.protein += food.protein || 0;
        acc.carbs += food.carbs || 0;
        acc.fat += food.fat || 0;
      });
      return acc;
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });

    return Response.json(summary);
  } catch (error) {
    console.error('Get nutrition summary error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
