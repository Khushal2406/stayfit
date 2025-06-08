import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'evening_snacks', 'dinner'],
    required: true  },  foods: [{
    fatSecretId: String, // FatSecret food ID
    name: String,
    brandName: String,
    servingQty: Number,
    servingUnit: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    imageUrl: String
  }]
}, {
  timestamps: true
});

// Create compound index for efficient queries
mealSchema.index({ userId: 1, date: 1 });

export const Meal = mongoose.models.Meal || mongoose.model('Meal', mealSchema);
