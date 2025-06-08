const mongoose = require('mongoose');

let User;

try {
  User = mongoose.model('User');
} catch {
  const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    min: 1,
    max: 120
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  weight: {
    type: Number,
    min: 20,
    max: 300
  },
  height: {
    type: Number,
    min: 100,
    max: 250
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Add nutrition tracking fields
  dailyCalorieTarget: {
    type: Number,
    default: 2000
  },
  nutritionTracking: {
    date: {
      type: Date,
      default: Date.now
    },
    calories: {
      type: Number,
      default: 0
    },
    protein: {
      type: Number,
      default: 0
    },
    carbs: {
      type: Number,
      default: 0
    },
    fats: {
      type: Number,
      default: 0
    }  }
});

  User = mongoose.model('User', userSchema);
}

module.exports = User;
