const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    tier: {
      type: String,
      enum: ['Standard', 'Deluxe Suite', 'Cat Condo'],
      required: true,
    },
    allowedSpecies: {
      type: [{ type: String, enum: ['dog', 'cat', 'other'] }],
      default: ['dog'],
    },
    capacity: {
      maxPets: { type: Number, default: 1, min: 1 },
      maxWeightTotalKg: { type: Number, default: 25 },
    },
    pricing: {
      baseRatePerNight: { type: Number, required: true },
      peakSeasonMultiplier: { type: Number, default: 1.0 },
    },
    features: [{ type: String }],
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance'],
      default: 'available',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Room || mongoose.model('Room', RoomSchema);
