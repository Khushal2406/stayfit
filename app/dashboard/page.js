'use client';
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NutritionMeters from "@/components/NutritionMeters";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Dashboard() {
  const { data: session } = useSession();
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceCalories, setMaintenanceCalories] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (session) {      // First get user details
      fetch('/api/user/details')
        .then(res => res.json())        .then(userData => {
          if (!userData.error) {
            // Calculate maintenance calories
            if (userData.weight && userData.height && userData.age && userData.gender) {
              const bmr = userData.gender === 'male'
                ? (10 * userData.weight) + (6.25 * userData.height) - (5 * userData.age) + 5
                : (10 * userData.weight) + (6.25 * userData.height) - (5 * userData.age) - 161;
              setMaintenanceCalories(Math.round(bmr * 1.55));
            }
            // Then get nutrition data
            return fetch('/api/nutrition').then(res => res.json());
          }
          throw new Error('Failed to load user details');
        })
        .then(data => {
          if (!data.error) {
            setNutritionData({
              calories: {
                current: data.calories?.current || 0,
                target: data.calories?.target || 2000,
              },
              protein: {
                current: data.protein?.current || 0,
                target: data.protein?.target || 150,
              },
              carbs: {
                current: data.carbs?.current || 0,
                target: data.carbs?.target || 250,
              },
              fats: {
                current: data.fats?.current || 0,
                target: data.fats?.target || 65,
              },
            });
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching nutrition data:', err);
          setLoading(false);
        });
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Your Nutrition Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Track your daily nutrition goals and progress
          </p>
          <button
            onClick={() => router.push('/track')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200"
          >
            <span>Track Food</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {nutritionData && <NutritionMeters nutritionData={nutritionData} />}
      </div>
    </div>
  );
}
