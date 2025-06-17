'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CircularProgress = ({ value, max, label, color }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const unit = label === "Calories" ? "kcal" : "g";

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
          <span className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</span>
          <span className="text-sm text-gray-500">{label}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">{value} / {max}</p>
      <p className="text-xs text-gray-400">{unit}</p>
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

export default function NutritionMeters({ nutritionData }) {
  if (!nutritionData) {
    return <div>Loading nutrition data...</div>;
  }

  const {
    calories = { current: 0, target: 2000 },
    protein = { current: 0, target: 150 },
    carbs = { current: 0, target: 250 },
    fats = { current: 0, target: 65 }
  } = nutritionData;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <CircularProgress
        value={calories.current || 0}
        max={calories.target || 2000}
        label="Calories"
        color="text-blue-500"
      />
      <CircularProgress
        value={protein.current || 0}
        max={protein.target || 150}
        label="Protein"
        color="text-red-500"
      />
      <CircularProgress
        value={carbs.current || 0}
        max={carbs.target || 250}
        label="Carbs"
        color="text-green-500"
      />
      <CircularProgress
        value={fats.current || 0}
        max={fats.target || 65}
        label="Fats"
        color="text-yellow-500"
      />
    </div>
  );
}
