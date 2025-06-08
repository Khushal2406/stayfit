import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
const { connectDB } = require('@/lib/db');
const User = require('@/models/User');

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);    // Create new user with default values for nutrition tracking
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      dailyCalorieTarget: 2000, // Default value
      nutritionTracking: {
        date: new Date(),
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0
      }
    });

    return NextResponse.json(
      { message: 'User created successfully', userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    );
  }
}
