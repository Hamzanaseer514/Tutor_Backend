const mongoose = require('mongoose');

const tutorProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  qualifications: {
    type: String,
    default: ''
  },
  experience_years: {
    type: Number,
    default: 0
  },
  subjects: {
    type: [String],
    default: []
  },
  // is_background_checked: {
  //   type: Boolean,
  //   default: false
  // },
  // is_id_verified: {
  //   type: Boolean,
  //   default: false
  // },
  // is_reference_verified: {
  //   type: Boolean,
  //   default: false
  // },
  // is_profile_approved: {
  //   type: Boolean,
  //   default: false
  // },
  profile_status: {
    type: String,
    enum: ['unverified', 'pending', 'approved', 'rejected'],
    default: 'unverified'
  }
  }, { timestamps: true }
);

module.exports = mongoose.model('TutorProfile', tutorProfileSchema);