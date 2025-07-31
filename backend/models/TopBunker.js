// backend/models/TopBunker.js
const mongoose = require('mongoose');

const topBunkerEntrySchema = mongoose.Schema({
  userId: { type: String, required: true }, // Store userId as string for simplicity
  totalBunks: { type: Number, required: true, default: 0 },
  lastBunk: { type: Date, required: true, default: Date.now },
  // You might want to store username/email here too for display, or fetch from User model
});

const topBunkerSchema = mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject', // References the Subject model
      required: true,
      unique: true, // Ensure only one topBunker entry per subject
    },
    subjectName: {
      type: String,
      required: true,
    },
    bunkers: [topBunkerEntrySchema], // Array of top bunkers for this subject
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const TopBunker = mongoose.model('TopBunker', topBunkerSchema);
module.exports = TopBunker;
