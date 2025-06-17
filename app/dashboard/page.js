'use client';
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NutritionMeters from "@/components/NutritionMeters";
import LoadingSpinner from "@/components/LoadingSpinner";
import WeeklyCalorieTracker from "@/components/WeeklyCalorieTracker";
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const { data: session } = useSession();
  const [nutritionData, setNutritionData] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // New state for weight goal inputs
  const [weightGoal, setWeightGoal] = useState('');
  const [weeklyRate, setWeeklyRate] = useState(0.5);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Get user details
        const userRes = await fetch('/api/user/details');
        const userData = await userRes.json();

        if (userData.error) {
          throw new Error(userData.error);
        }

        setUserDetails(userData);
        setWeightGoal(userData.weightGoal || userData.weight || '');
        setWeeklyRate(userData.weeklyRate || 0.5);

        // Get nutrition data
        const nutritionRes = await fetch('/api/nutrition/summary');
        const nutritionData = await nutritionRes.json();

        if (!nutritionData.success) {
          throw new Error(nutritionData.error || 'Failed to load nutrition data');
        }

        setNutritionData(nutritionData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, router]);
  const handleWeightGoalSubmit = async () => {
    try {
      if (!weightGoal || isNaN(weightGoal)) {
        toast.error('Please enter a valid target weight');
        return;
      }

      const response = await fetch('/api/user/details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weightGoal: parseFloat(weightGoal),
          weeklyRate: parseFloat(weeklyRate),
          isGaining: parseFloat(weightGoal) > userDetails.weight
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      toast.success('Weight goal updated successfully');
      // Refresh the page to update calculations
      window.location.reload();
    } catch (error) {
      console.error('Error updating weight goal:', error);
      toast.error(error.message || 'Failed to update weight goal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {userDetails?.name || 'User'}!</h1>
          <p className="text-gray-600">Track your nutrition and fitness goals all in one place</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Nutrition Meters Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:scale-[1.02]">            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Today's Nutrition</h2>
            </div>
            <NutritionMeters nutritionData={nutritionData} />
            <div className="mt-6 flex justify-center">
              <Link 
                href="/track" 
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-600 rounded-lg transition-all duration-300"
              >
                <span>Track Your Meals</span>
                <svg 
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Weight Goal Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Weight Goal</h2>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col space-y-2">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-lg font-medium text-gray-700">Current Weight: 
                    <span className="ml-2 text-blue-600 font-semibold">
                      {userDetails?.weight || 'Not set'} kg
                    </span>
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Target Weight</label>
                    <input
                      type="number"
                      value={weightGoal}
                      onChange={(e) => setWeightGoal(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium"
                      placeholder="Target kg"
                      step="0.1"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Weekly Rate</label>
                    <select
                      value={weeklyRate}
                      onChange={(e) => setWeeklyRate(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 font-medium"
                    >
                      <option value="0.25">0.25 kg/week</option>
                      <option value="0.5">0.5 kg/week</option>
                      <option value="0.75">0.75 kg/week</option>
                      <option value="1">1.0 kg/week</option>
                    </select>
                  </div>
                  <button
                    onClick={handleWeightGoalSubmit}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Update Goal
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Progress Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Weekly Progress</h2>
            </div>
            <WeeklyCalorieTracker />
          </div>
        </div>
      </div>
    </div>
  );
}
