'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';

const launchConfetti = () => {
  const duration = 3 * 1000;
  const end = Date.now() + duration;

  const colors = ['#00ff00', '#4CAF50', '#45D1FD', '#2196F3'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};

export default function WeeklyCalorieTracker() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allGoalsMet, setAllGoalsMet] = useState(false);

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  useEffect(() => {
    const allMet = weeklyData.length === 7 && weeklyData.every(day => day.goalMet);
    if (allMet && !allGoalsMet) {
      launchConfetti();
      toast.success('Amazing! You met your calorie goals for the entire week! 🎉');
    }
    setAllGoalsMet(allMet);
  }, [weeklyData]);

  const fetchWeeklyData = async () => {
    try {
      const response = await fetch('/api/nutrition/weekly');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch weekly data');
      }

      setWeeklyData(data.weeklyData);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      toast.error('Failed to load weekly nutrition data');
    } finally {
      setIsLoading(false);
    }
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Calorie Tracker</h2>
      <div className="grid grid-cols-7 gap-2">
        {weeklyData.map(({ date, calories, goalMet }) => (
          <motion.div
            key={date}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-3 rounded-lg ${
              goalMet 
                ? 'bg-gradient-to-br from-green-100 to-green-50 border-2 border-green-200' 
                : 'bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-gray-200'
            } flex flex-col items-center justify-center transition-colors duration-300`}
          >
            <span className="text-sm font-medium text-gray-600">{getDayName(date)}</span>
            <span className={`text-lg font-bold ${goalMet ? 'text-green-600' : 'text-gray-700'}`}>
              {calories}
            </span>
            <span className="text-xs text-gray-500">kcal</span>
            {goalMet && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-green-500 mt-1"
              >
                ✓
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      {allGoalsMet && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-green-600 font-medium"
        >
          🎉 Perfect week! All calorie goals met! 🎉
        </motion.div>
      )}
    </div>
  );
}
