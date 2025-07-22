const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academic_level: {
    type: String,
    default: ''
  },
  learning_goals: {
    type: String,
    default: ''
  },
  preferred_subjects: {
    type: [String],
    default: []
  },
  availability: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports =  mongoose.model('StudentProfile', studentProfileSchema);
