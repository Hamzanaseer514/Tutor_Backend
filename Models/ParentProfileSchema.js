const mongoose = require("mongoose");

const parentProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentProfile" // only ObjectId references
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("ParentProfile", parentProfileSchema);
