// 📄 File: backend/models/Subject.js
const mongoose = require('mongoose');

const bunkHistorySchema = mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  type: { type: String, enum: ['bunk', 'attended'], required: true },
});

const subjectSchema = mongoose.Schema(
  {
    user: {
      type: String,
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
      default: 75,
    },
    credits: {
      type: Number,
      required: true,
      default: 1,
    },
    // Derived fields stored for quick reads
    attendancePercentage: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    maxBunkable: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    bunkHistory: [bunkHistorySchema],
  },
  {
    timestamps: true,
  }
);

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;
