import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'snack', 'dinner']
  },foods: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },    servingSize: {
      type: String,
      required: true,
      default: 'serving'
    },
    nutrition: {
      calories: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true },
      fiber: { type: Number, default: 0 },
      sugars: { type: Number, default: 0 }
    }
  }]
}, {
  timestamps: true
});

// Add indexes for common queries
mealSchema.index({ userId: 1, date: -1 });

// Virtual for total nutrition values
mealSchema.virtual('totalNutrition').get(function() {
  return this.foods.reduce((total, food) => {
    return {
      calories: total.calories + (food.nutrition?.calories || 0),
      protein: total.protein + (food.nutrition?.protein || 0),
      carbs: total.carbs + (food.nutrition?.carbs || 0),
      fat: total.fat + (food.nutrition?.fat || 0),
      fiber: total.fiber + (food.nutrition?.fiber || 0),
      sugars: total.sugars + (food.nutrition?.sugars || 0)
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugars: 0 });
});

export default mongoose.models.Meal || mongoose.model('Meal', mealSchema);
