'use client';

import { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';

export default function FoodSearch({ onFoodSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchFood = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/nutrition/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to search foods');
        }

        if (!data.success) {
          throw new Error(data.error || 'Failed to get search results');
        }

        setResults(data.results || []);
      } catch (err) {
        console.error('Search error:', err);
        setError(err.message || 'Failed to search foods');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleFoodClick = async (food) => {
    setSelectedFood({
      ...food,
      nutrition: {
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber
      }
    });
    setQuantity(100); // Reset quantity to default 100g
  };

  const calculateNutritionForQuantity = (nutrition) => {
    const factor = quantity / 100;
    return {
      calories: Math.round(nutrition.calories * factor),
      protein: Math.round(nutrition.protein * factor * 10) / 10,
      carbs: Math.round(nutrition.carbs * factor * 10) / 10,
      fat: Math.round(nutrition.fat * factor * 10) / 10,
      fiber: nutrition.fiber ? Math.round(nutrition.fiber * factor * 10) / 10 : 0
    };
  };

  const handleAddFood = () => {
    const adjustedFood = {
      ...selectedFood,
      servingSize: `${quantity}g`,
      nutrition: calculateNutritionForQuantity(selectedFood.nutrition)
    };
    onFoodSelect(adjustedFood);
    setSelectedFood(null);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            searchFood(e.target.value);
          }}
          placeholder="Search for a food..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
        />
        {loading && (
          <div className="absolute right-3 top-3">
            <div className="w-6 h-6 border-t-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg"
        >
          <p className="text-sm text-red-600">{error}</p>
        </motion.div>
      )}

      <AnimatePresence>
        {results.length > 0 && !selectedFood && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 bg-white rounded-lg border border-gray-200 overflow-hidden max-h-[320px] overflow-y-auto shadow-lg"
          >
            {results.map((food) => (
              <motion.button
                key={food.id}
                onClick={() => handleFoodClick(food)}
                whileHover={{ backgroundColor: 'rgb(243 244 246)' }}
                className="w-full px-4 py-3 text-left border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-100"
              >
                <p className="font-medium text-gray-900">{food.name}</p>
                <p className="text-sm text-gray-500">
                  {food.calories} kcal • {food.protein}g protein per 100g
                </p>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedFood && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-5 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium text-lg text-gray-900">{selectedFood.name}</h3>
              <div className="mt-2 flex items-center space-x-2">
                <label htmlFor="quantity" className="text-sm text-gray-600">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(1000, Number(e.target.value))))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                />
                <span className="text-sm text-gray-600">grams</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedFood(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Calories</p>
              <p className="text-lg font-semibold text-orange-600">
                {calculateNutritionForQuantity(selectedFood.nutrition).calories}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Protein</p>
              <p className="text-lg font-semibold text-red-600">
                {calculateNutritionForQuantity(selectedFood.nutrition).protein}g
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Carbs</p>
              <p className="text-lg font-semibold text-yellow-600">
                {calculateNutritionForQuantity(selectedFood.nutrition).carbs}g
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Fat</p>
              <p className="text-lg font-semibold text-green-600">
                {calculateNutritionForQuantity(selectedFood.nutrition).fat}g
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setSelectedFood(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddFood}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add to meal
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
