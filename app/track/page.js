'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { AiFillFire } from 'react-icons/ai';
import { GiMeat, GiWheat, GiAvocado } from 'react-icons/gi';
import FoodSearch from '@/components/FoodSearch';

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'lunch', label: 'Lunch', icon: '🌞' },
  { id: 'snack', label: 'Snacks', icon: '🍎' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' },
];

export default function TrackPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  });  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [isLoading, setIsLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchMeals();
  }, [session, router]);

  const fetchMeals = async () => {
    try {
      console.log('Fetching meals...');
      const response = await fetch('/api/nutrition/meals');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch meals');
      }
      
      const data = await response.json();
      console.log('Received meals data:', data);
      
      if (data.success) {
        setMeals(data.meals);
      } else {
        throw new Error(data.error || 'Failed to load meals');
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
      toast.error(error.message || 'Failed to load meals');
    }
  };

  const handleFoodSelect = async (food) => {
    setIsLoading(true);
    try {
      // Format the food data
      const foodData = {
        mealType: selectedMealType,
        food: {
          id: food.id,
          name: food.name,
          servingSize: food.servingSize,
          nutrition: {
            calories: parseFloat(food.nutrition.calories) || 0,
            protein: parseFloat(food.nutrition.protein) || 0,
            carbs: parseFloat(food.nutrition.carbs) || 0,
            fat: parseFloat(food.nutrition.fat) || 0,
            fiber: parseFloat(food.nutrition.fiber) || 0,
            sugars: parseFloat(food.nutrition.sugars) || 0
          }
        }
      };

      const response = await fetch('/api/nutrition/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(foodData)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to add food');
      }
      
      toast.success('Food added to your meal!');
      await fetchMeals();
      setShowSearch(false);
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error(error.message || 'Failed to add food');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFood = async (food) => {
    try {
      const response = await fetch(`/api/nutrition/meals?mealId=${food.mealId}&foodId=${food._id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete food');
      }
      
      toast.success('Food removed from your meal');
      await fetchMeals();
    } catch (error) {
      console.error('Error deleting food:', error);
      toast.error(error.message || 'Failed to delete food');
    }
  };

  const calculateTotalNutrition = () => {
    let totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    Object.values(meals).forEach(mealFoods => {
      mealFoods.forEach(food => {
        totals.calories += food.nutrition.calories || 0;
        totals.protein += food.nutrition.protein || 0;
        totals.carbs += food.nutrition.carbs || 0;
        totals.fat += food.nutrition.fat || 0;
      });
    });

    return totals;
  };

  const totals = calculateTotalNutrition();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Meals</h1>
          <p className="text-gray-600 mb-8">Select a meal type and add your foods to track your nutrition</p>

          {/* Daily Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-orange-100 to-orange-50 p-4 rounded-lg"
            >
              <div className="flex items-center mb-2">
                <AiFillFire className="text-orange-500 text-2xl mr-2" />
                <h3 className="font-semibold text-gray-800">Calories</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600">{Math.round(totals.calories)}</p>
              <p className="text-sm text-gray-600">kcal total</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-red-100 to-red-50 p-4 rounded-lg"
            >
              <div className="flex items-center mb-2">
                <GiMeat className="text-red-500 text-2xl mr-2" />
                <h3 className="font-semibold text-gray-800">Protein</h3>
              </div>
              <p className="text-2xl font-bold text-red-600">{Math.round(totals.protein)}g</p>
              <p className="text-sm text-gray-600">protein total</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-yellow-100 to-yellow-50 p-4 rounded-lg"
            >
              <div className="flex items-center mb-2">
                <GiWheat className="text-yellow-600 text-2xl mr-2" />
                <h3 className="font-semibold text-gray-800">Carbs</h3>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{Math.round(totals.carbs)}g</p>
              <p className="text-sm text-gray-600">carbs total</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-100 to-green-50 p-4 rounded-lg"
            >
              <div className="flex items-center mb-2">
                <GiAvocado className="text-green-500 text-2xl mr-2" />
                <h3 className="font-semibold text-gray-800">Fat</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">{Math.round(totals.fat)}g</p>
              <p className="text-sm text-gray-600">fat total</p>
            </motion.div>
          </div>        </div>

        {/* Food Search */}
        <AnimatePresence>
          {showSearch && (
            <motion.div              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl shadow-sm p-6 mb-8"
              ref={searchRef}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Food to {mealTypes.find(m => m.id === selectedMealType)?.label}</h3>
                <button
                  onClick={() => setShowSearch(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <FoodSearch onFoodSelect={handleFoodSelect} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meals Display */}
        <div className="space-y-8">
          {mealTypes.map(({ id, label, icon }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">{icon}</span>
                  {label}
                </h2>
              </div>
              
              <div className="p-6">
                {meals[id]?.length > 0 ? (
                  <div className="space-y-3">
                    {meals[id].map((food, index) => (
                      <motion.div
                        key={`${food.id}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-12 items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="col-span-5">
                          <div className="font-medium text-gray-900">{food.name}</div>
                          <div className="text-sm text-gray-600">{food.servingSize}</div>
                        </div>
                        <div className="col-span-6 text-right">
                          <div className="font-medium text-gray-900">{food.nutrition.calories} cal</div>
                          <div className="text-sm text-gray-600">
                            P: {food.nutrition.protein}g • C: {food.nutrition.carbs}g • F: {food.nutrition.fat}g
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button 
                            onClick={() => handleDeleteFood(food)}
                            className="text-red-500 p-1 hover:bg-red-50 rounded-full"
                            title="Remove food"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🍽️</div>
                    <p className="text-gray-500 mb-2">No foods added to {label.toLowerCase()} yet</p>
                  </div>
                )}
              </div>
              
              {/* Add Food Button */}
              <div className="p-4 border-t border-gray-100">                <button
                  onClick={() => {
                    setSelectedMealType(id);
                    setShowSearch(true);
                    // Wait for search component to mount before scrolling
                    setTimeout(() => {
                      searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                  className="w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Food to {label}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
