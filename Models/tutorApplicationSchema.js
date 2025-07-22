const mongoose = require('mongoose');
const tutorApplicationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interview_status: {
    type: String,
    enum: ['Pending', 'Scheduled', 'Passed', 'Failed'],
    default: 'Pending'
  },
  code_of_conduct_agreed: {
    type: Boolean,
    default: false
  },
  // application_status: {
  //   type: String,
  //   enum: ['Pending', 'Approved', 'Rejected'],
  //   default: 'Pending'
  // },
  applied_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TutorApplication', tutorApplicationSchema);