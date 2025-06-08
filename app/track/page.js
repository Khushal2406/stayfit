'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function TrackPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    evening_snacks: [],
    dinner: []
  });
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchMeals();
    }
  }, [session]);

  const fetchMeals = async () => {
    try {
      const response = await fetch('/api/nutrition/meals');
      if (response.ok) {
        const data = await response.json();
        setMeals(data);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
      toast.error('Failed to load meals');
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/nutrition/search?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching foods:', error);
      toast.error('Failed to search foods');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFood = async (food) => {
    if (!selectedMeal) {
      toast.error('Please select a meal type');
      return;
    }

    try {
      const response = await fetch('/api/nutrition/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: selectedMeal,
          foodId: food.id
        }),
      });

      if (response.ok) {
        toast.success('Food added successfully');
        fetchMeals(); // Refresh meals
        setSearchResults([]); // Clear search results
        setSearchQuery(''); // Clear search query
      }
    } catch (error) {
      console.error('Error adding food:', error);
      toast.error('Failed to add food');
    }
  };

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center mb-8">Track Your Meals</h1>
        
        {/* Search and Add Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex gap-4 mb-4">
              <select
                value={selectedMeal || ''}
                onChange={(e) => setSelectedMeal(e.target.value)}
                className="block w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Meal Type</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="evening_snacks">Evening Snacks</option>
                <option value="dinner">Dinner</option>
              </select>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  placeholder="Search foods..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {isLoading && (
                  <div className="absolute right-3 top-2">
                    {/* Add your loading spinner component here */}
                  </div>
                )}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((food) => (
                  <motion.div
                    key={food.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {food.image && (
                        <img
                          src={`https://spoonacular.com/cdn/ingredients_100x100/${food.image}`}
                          alt={food.name}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-medium">{food.name}</h3>
                        {food.nutrition && (
                          <p className="text-sm text-gray-500">
                            {food.nutrition.calories} cal | {food.nutrition.protein}g protein
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddFood(food)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Meals Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(meals).map(([mealType, foods]) => (
              <motion.div
                key={mealType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <h2 className="text-xl font-semibold mb-4 capitalize">
                  {mealType.replace('_', ' ')}
                </h2>
                {foods.length === 0 ? (
                  <p className="text-gray-500">No foods added yet</p>
                ) : (
                  <div className="space-y-3">
                    {foods.map((food) => (
                      <div
                        key={food._id}
                        className="flex items-center justify-between p-2 border-b"
                      >
                        <div>
                          <p className="font-medium">{food.name}</p>
                          <p className="text-sm text-gray-500">
                            {food.calories} cal | {food.servingSize} {food.servingUnit}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveFood(food._id, mealType)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
