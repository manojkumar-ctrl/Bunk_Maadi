const mongoose = require('mongoose');

const googleTokenSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true }, // Clerk user ID
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    scope: { type: String },
    tokenType: { type: String },
    expiryDate: { type: Number }, // ms since epoch
  },
  { timestamps: true }
);

module.exports = mongoose.model('GoogleToken', googleTokenSchema);


