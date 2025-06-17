import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

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
      dailyCalorieTarget: user?.dailyCalorieTarget || 2000,
      weightGoal: user?.weightGoal || '',
      weeklyRate: user?.weeklyRate || 0.5,
      isGaining: user?.isGaining
    };

    return NextResponse.json(userData);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching user details' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }    const data = await req.json();
    await connectDB();

    // Get current user data first
    const existingUser = await User.findById(session.user.id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Basic validation for weight goal fields
    if (data.weightGoal !== undefined) {
      if (isNaN(data.weightGoal) || data.weightGoal < 20 || data.weightGoal > 300) {
        return NextResponse.json({ error: 'Weight goal must be between 20 and 300 kg' }, { status: 400 });
      }
    }

    if (data.weeklyRate !== undefined) {
      const validRates = [0.25, 0.5, 1];
      if (!validRates.includes(Number(data.weeklyRate))) {
        return NextResponse.json({ error: 'Weekly rate must be 0.25, 0.5, or 1 kg' }, { status: 400 });
      }
    }

    // Use findOneAndUpdate to ensure atomic updates
    const updateFields = {};
    if (data.age !== undefined) updateFields.age = data.age;
    if (data.gender !== undefined) updateFields.gender = data.gender;
    if (data.weight !== undefined) updateFields.weight = data.weight;
    if (data.height !== undefined) updateFields.height = data.height;    if (data.weightGoal !== undefined) {
      updateFields.weightGoal = data.weightGoal;
      // Get current weight from either the new data or the existing user
      const currentWeight = data.weight || existingUser.weight;
      updateFields.isGaining = data.weightGoal > currentWeight; // If target weight is more than current weight, we're bulking
    }
    if (data.weeklyRate !== undefined) updateFields.weeklyRate = data.weeklyRate;
    if (data.dailyCalorieTarget !== undefined) updateFields.dailyCalorieTarget = data.dailyCalorieTarget;

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const responseData = {
      message: 'User details updated successfully',
      age: user.age,
      gender: user.gender,
      weight: user.weight,
      height: user.height,
      weightGoal: user.weightGoal,
      weeklyRate: user.weeklyRate,
      isGaining: user.isGaining,
      dailyCalorieTarget: user.dailyCalorieTarget
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error updating user details:', error);
    return NextResponse.json({ error: 'Error updating user details' }, { status: 500 });
  }
}
