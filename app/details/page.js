'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

const detailsSchema = z.object({
  age: z.number().min(1, 'Age must be at least 1').max(120, 'Age must be less than 120'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Please select a gender' }),
  weight: z.number().min(20, 'Weight must be at least 20 kg').max(300, 'Weight must be less than 300 kg'),
  height: z.number().min(100, 'Height must be at least 100 cm').max(250, 'Height must be less than 250 cm'),
});

export default function PersonalDetails() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
  });
  const [bmi, setBmi] = useState(null);
  const [maintenanceCalories, setMaintenanceCalories] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingField, setEditingField] = useState(null);

  const calculateMaintenanceCalories = (weight, height, age, gender) => {
    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    // Multiply by activity factor (using moderate activity 1.55 as default)
    return Math.round(bmr * 1.55);
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch('/api/user/details');
        if (response.ok) {
          const data = await response.json();
          setFormData({
            age: data.age || '',
            gender: data.gender || '',
            weight: data.weight || '',
            height: data.height || '',
          });
          
          if (data.weight && data.height) {
            const heightInMeters = data.height / 100;
            const bmiValue = (data.weight / (heightInMeters * heightInMeters)).toFixed(1);
            setBmi(parseFloat(bmiValue));

            if (data.age && data.gender) {
              const calories = calculateMaintenanceCalories(data.weight, data.height, data.age, data.gender);
              setMaintenanceCalories(calories);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast.error('Failed to load your details');
      }
    };

    if (session?.user) {
      fetchDetails();
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validData = detailsSchema.parse({
        age: Number(formData.age),
        gender: formData.gender,
        weight: Number(formData.weight),
        height: Number(formData.height),
      });

      const response = await fetch('/api/user/details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData),
      });      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update details');
      }

      // Update form with returned data
      setFormData({
        age: data.age || '',
        gender: data.gender || '',
        weight: data.weight || '',
        height: data.height || '',
      });

      // Calculate and update BMI and maintenance calories
      const heightInMeters = validData.height / 100;
      const bmiValue = (validData.weight / (heightInMeters * heightInMeters)).toFixed(1);
      setBmi(parseFloat(bmiValue));
      
      const calories = calculateMaintenanceCalories(validData.weight, validData.height, validData.age, validData.gender);
      setMaintenanceCalories(calories);

      // Update session data to reflect changes
      await update({
        ...session,
        user: {
          ...session.user,
          ...data
        }
      });

      toast.success('Details updated successfully!');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
        toast.error('Please check your inputs');
      } else {
        console.error('Error updating details:', error);
        toast.error(error.message || 'Failed to update details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (fieldName) => {
    if (editingField === fieldName) {
      setEditingField(null);
    } else {
      setEditingField(fieldName);
    }
  };

  const handleIndividualUpdate = async (fieldName) => {
    setIsLoading(true);
    setErrors({});

    try {
      const value = fieldName === 'age' || fieldName === 'height' || fieldName === 'weight' 
        ? Number(formData[fieldName])
        : formData[fieldName];

      const validData = {
        ...formData,
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height),
        [fieldName]: value
      };

      // Validate just the field being updated
      detailsSchema.parse(validData);

      const response = await fetch('/api/user/details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update details');
      }      // Update form with returned data
      const updatedData = {
        age: data.age,
        gender: data.gender,
        weight: data.weight,
        height: data.height
      };
      
      setFormData(updatedData);

      // Recalculate BMI and calories if weight or height changed
      if (fieldName === 'weight' || fieldName === 'height') {
        const heightInMeters = validData.height / 100;
        const bmiValue = (validData.weight / (heightInMeters * heightInMeters)).toFixed(1);
        setBmi(parseFloat(bmiValue));
      }

      // Recalculate calories if any relevant field changed
      if (['weight', 'height', 'age', 'gender'].includes(fieldName)) {
        const calories = calculateMaintenanceCalories(
          validData.weight,
          validData.height,
          validData.age,
          validData.gender
        );
        setMaintenanceCalories(calories);
      }

      // Update session
      await update({
        ...session,
        user: {
          ...session.user,
          ...data
        }
      });

      setEditingField(null);
      toast.success(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} updated successfully!`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0] === fieldName) {
            newErrors[fieldName] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error('Please check your input');
      } else {
        console.error('Error updating details:', error);
        toast.error(error.message || 'Failed to update details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-500' };
    if (bmi < 25) return { category: 'Normal weight', color: 'text-green-500' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-500' };
    return { category: 'Obese', color: 'text-red-500' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 text-center">Personal Details</h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Update your fitness information
            </p>
          </motion.div>

          <div className="space-y-4 mt-4">
            {bmi && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900">Your BMI</h3>
                <p className="text-2xl font-bold mt-1">{bmi}</p>
                <p className={`${getBmiCategory(bmi).color} font-medium`}>
                  {getBmiCategory(bmi).category}
                </p>
              </motion.div>
            )}
            
            {maintenanceCalories && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
              >                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Maintenance Calories</h3>
                  <p className="text-2xl font-bold mt-1">{maintenanceCalories} kcal</p>
                  <p className="text-gray-600 text-sm">
                    Daily calories needed to maintain your current weight with moderate activity
                  </p>
                </div>
              </motion.div>
            )}
          </div>          <div className="mt-8 space-y-6">
            <div className="space-y-4">
              {Object.entries({
                age: { label: 'Age', type: 'number', step: '1' },
                weight: { label: 'Weight (kg)', type: 'number', step: '0.1' },
                height: { label: 'Height (cm)', type: 'number', step: '0.1' },
                gender: { label: 'Gender', type: 'select', options: [
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' }
                ]}
              }).map(([key, field]) => (
                <div key={key} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => handleEdit(key)}
                      className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                    >
                      {editingField === key ? 'Cancel' : 'Edit'}
                    </motion.button>
                  </div>
                  
                  {editingField === key ? (
                    <div className="flex gap-2">
                      {field.type === 'select' ? (
                        <select
                          name={key}
                          value={formData[key]}
                          onChange={handleChange}
                          className={`block flex-1 px-3 py-2 border ${
                            errors[key] ? 'border-red-500' : 'border-gray-300'
                          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          name={key}
                          step={field.step}
                          value={formData[key]}
                          onChange={handleChange}
                          className={`block flex-1 px-3 py-2 border ${
                            errors[key] ? 'border-red-500' : 'border-gray-300'
                          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        />
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleIndividualUpdate(key)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        Save
                      </motion.button>
                    </div>
                  ) : (                    <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                      <p className="text-gray-900">
                        {field.type === 'select' 
                          ? field.options.find(opt => opt.value === formData[key])?.label || 'Not set'
                          : formData[key] !== '' 
                            ? field.type === 'number' 
                              ? Number(formData[key]).toFixed(field.step === '1' ? 0 : 1)
                              : formData[key]
                            : 'Not set'}
                      </p>
                    </div>
                  )}
                  
                  {errors[key] && (
                    <p className="mt-1 text-sm text-red-500">{errors[key]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
