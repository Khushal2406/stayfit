import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
const { connectDB } = require('@/lib/db');
const User = require('@/models/User');

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();    const user = await User.findById(session.user.id);
    
    const userData = {
      age: user?.age || '',
      gender: user?.gender || '',
      weight: user?.weight || '',
      height: user?.height || '',
      dailyCalorieTarget: user?.dailyCalorieTarget || 2000
    };

    return NextResponse.json(userData);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching user details' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { age, gender, weight, height } = await req.json();
    await connectDB();

    // Update user details    // Calculate BMR using the Mifflin-St Jeor Equation
    const bmr = gender === 'male'
      ? (10 * parseFloat(weight)) + (6.25 * parseFloat(height)) - (5 * parseInt(age)) + 5
      : (10 * parseFloat(weight)) + (6.25 * parseFloat(height)) - (5 * parseInt(age)) - 161;

    // Set daily calorie target based on BMR (assuming moderate activity level - multiply by 1.55)
    const dailyCalorieTarget = Math.round(bmr * 1.55);    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        age: parseInt(age),
        gender,
        weight: parseFloat(weight),
        height: parseFloat(height),
        dailyCalorieTarget,
        'nutritionTracking.date': new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate BMI and format response data
    const heightInMeters = updatedUser.height / 100;
    const bmi = (updatedUser.weight / (heightInMeters * heightInMeters)).toFixed(1);

    const responseData = {
      age: updatedUser.age,
      gender: updatedUser.gender,
      weight: updatedUser.weight,
      height: updatedUser.height,
      dailyCalorieTarget: updatedUser.dailyCalorieTarget,
      bmi: parseFloat(bmi)
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error updating user details:', error);
    return NextResponse.json({ error: 'Error updating user details' }, { status: 500 });
  }
}
