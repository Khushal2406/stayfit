'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CircularProgress = ({ value, max, label, color }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="56"
            cy="56"
          />
          <motion.circle
            className={color}
            strokeWidth="8"
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="56"
            cy="56"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
          <span className="text-sm text-gray-500">{label}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">{value} / {max}</p>
    </div>
  );
};

const LinearProgress = ({ value, max, label, color }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{value}g / {max}g</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <motion.div
          className={`h-2.5 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default function NutritionMeters({ targetCalories }) {
  const [nutritionData, setNutritionData] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        const response = await fetch('/api/nutrition/summary');
        if (response.ok) {
          const data = await response.json();
          setNutritionData(data);
        }
      } catch (error) {
        console.error('Error fetching nutrition data:', error);
      }
    };

    fetchNutritionData();
    // Set up interval to refresh data every 5 minutes
    const interval = setInterval(fetchNutritionData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate macro targets based on target calories
  const targets = {
    protein: Math.round((targetCalories * 0.3) / 4), // 30% of calories from protein (4 cal/g)
    carbs: Math.round((targetCalories * 0.45) / 4),  // 45% of calories from carbs (4 cal/g)
    fat: Math.round((targetCalories * 0.25) / 9),    // 25% of calories from fat (9 cal/g)
  };

  return (
    <div className="space-y-6">
      <CircularProgress
        value={nutritionData.calories}
        max={targetCalories}
        label="Calories"
        color="text-blue-500"
      />
      
      <div className="space-y-4">
        <LinearProgress
          value={nutritionData.protein}
          max={targets.protein}
          label="Protein"
          color="bg-red-500"
        />
        <LinearProgress
          value={nutritionData.carbs}
          max={targets.carbs}
          label="Carbs"
          color="bg-yellow-500"
        />
        <LinearProgress
          value={nutritionData.fat}
          max={targets.fat}
          label="Fat"
          color="bg-green-500"
        />
      </div>
    </div>
  );
}
