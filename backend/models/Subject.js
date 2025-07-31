// backend/models/Subject.js
const mongoose = require('mongoose');

const bunkHistorySchema = mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  type: { type: String, enum: ['bunk', 'attended'], required: true },
});

const subjectSchema = mongoose.Schema(
  {
    user: {
      type: String, // Changed to String for simplicity as we're not doing full auth yet
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    totalClasses: {
      type: Number,
      required: true,
      default: 0,
    },
    attendedClasses: {
      type: Number,
      required: true,
      default: 0,
    },
    totalBunks: {
      type: Number,
      required: true,
      default: 0,
    },
    minAttendance: {
      type: Number,
      required: true,
      default: 75, // Default minimum attendance percentage
    },
    bunkHistory: [bunkHistorySchema], // Array of bunk/attendance records
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;
