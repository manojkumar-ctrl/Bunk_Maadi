// 📄 models/Bunk.js
const mongoose = require('mongoose');

const bunkSchema = new mongoose.Schema({
  userId: {
    type: String, // Clerk user ID
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['BUNKED', 'ATTENDED'],
    default: 'BUNKED'
  }
}, { timestamps: true });

module.exports = mongoose.model('Bunk', bunkSchema);
