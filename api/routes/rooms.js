const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Mock fallback rooms for seamless preview without DB connection
const defaultRooms = [
  {
    _id: '670f1a2b3c4d5e6f7a8b9c01',
    roomNumber: 'D-01',
    tier: 'Deluxe Suite',
    allowedSpecies: ['dog'],
    capacity: { maxPets: 2, maxWeightTotalKg: 45 },
    pricing: { baseRatePerNight: 280000, peakSeasonMultiplier: 1.0 },
    features: ['Climate-controlled', '24/7 Webcam Stream', 'Private Outdoor Run', 'Orthopedic Bedding'],
    status: 'available',
    active: true,
  },
  {
    _id: '670f1a2b3c4d5e6f7a8b9c02',
    roomNumber: 'D-02',
    tier: 'Deluxe Suite',
    allowedSpecies: ['dog'],
    capacity: { maxPets: 2, maxWeightTotalKg: 45 },
    pricing: { baseRatePerNight: 250000, peakSeasonMultiplier: 1.0 },
    features: ['Climate-controlled', '24/7 Webcam Stream', 'Private Outdoor Run'],
    status: 'available',
    active: true,
  },
  {
    _id: '670f1a2b3c4d5e6f7a8b9c03',
    roomNumber: 'S-01',
    tier: 'Standard',
    allowedSpecies: ['dog'],
    capacity: { maxPets: 1, maxWeightTotalKg: 20 },
    pricing: { baseRatePerNight: 160000, peakSeasonMultiplier: 1.0 },
    features: ['Sound-dampened Wall', 'Daily Group Play', 'Natural Light Skylight'],
    status: 'available',
    active: true,
  },
  {
    _id: '670f1a2b3c4d5e6f7a8b9c04',
    roomNumber: 'S-02',
    tier: 'Standard',
    allowedSpecies: ['dog'],
    capacity: { maxPets: 1, maxWeightTotalKg: 20 },
    pricing: { baseRatePerNight: 160000, peakSeasonMultiplier: 1.0 },
    features: ['Sound-dampened Wall', 'Daily Group Play'],
    status: 'available',
    active: true,
  },
  {
    _id: '670f1a2b3c4d5e6f7a8b9c05',
    roomNumber: 'C-01',
    tier: 'Cat Condo',
    allowedSpecies: ['cat'],
    capacity: { maxPets: 2, maxWeightTotalKg: 15 },
    pricing: { baseRatePerNight: 180000, peakSeasonMultiplier: 1.0 },
    features: ['Scratching Post Tower', 'Multi-tier Vantage Ledges', 'Botanical Garden View', 'Calming Pheromone Diffuser'],
    status: 'available',
    active: true,
  },
  {
    _id: '670f1a2b3c4d5e6f7a8b9c06',
    roomNumber: 'C-02',
    tier: 'Cat Condo',
    allowedSpecies: ['cat'],
    capacity: { maxPets: 1, maxWeightTotalKg: 10 },
    pricing: { baseRatePerNight: 140000, peakSeasonMultiplier: 1.0 },
    features: ['Scratching Post Tower', 'Multi-tier Vantage Ledges', 'Calming Pheromone Diffuser'],
    status: 'available',
    active: true,
  },
];

// GET /api/v1/rooms/availability
router.get('/availability', async (req, res) => {
  try {
    const { checkIn, checkOut, species, tier } = req.query;

    const hasDB = Boolean(process.env.MONGODB_URI && Room.db && Room.db.readyState === 1);

    if (hasDB) {
      const roomFilter = { active: true, status: 'available' };
      if (species) roomFilter.allowedSpecies = species;
      if (tier) roomFilter.tier = tier;

      let excludedRoomIds = [];
      if (checkIn && checkOut) {
        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);
        const conflicting = await Booking.find({
          status: { $in: ['confirmed', 'checked_in', 'pending'] },
          'dates.checkIn': { $lt: outDate },
          'dates.checkOut': { $gt: inDate },
        }).select('roomId');
        excludedRoomIds = conflicting.map((b) => b.roomId);
      }

      if (excludedRoomIds.length > 0) {
        roomFilter._id = { $nin: excludedRoomIds };
      }

      const rooms = await Room.find(roomFilter);
      return res.json({ success: true, count: rooms.length, data: rooms });
    }

    // In-memory fallback
    let filtered = defaultRooms.filter((r) => r.active && r.status === 'available');
    if (species) {
      filtered = filtered.filter((r) => r.allowedSpecies.includes(species));
    }
    if (tier) {
      filtered = filtered.filter((r) => r.tier.toLowerCase() === tier.toLowerCase());
    }

    return res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.error('Error fetching room availability:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/rooms
router.get('/', async (req, res) => {
  try {
    const hasDB = Boolean(process.env.MONGODB_URI && Room.db && Room.db.readyState === 1);
    if (hasDB) {
      let rooms = await Room.find({ active: true });
      if (rooms.length === 0) {
        // Seed default rooms if empty
        rooms = await Room.insertMany(defaultRooms.map(({ _id, ...r }) => r));
      }
      return res.json({ success: true, count: rooms.length, data: rooms });
    }

    return res.json({ success: true, count: defaultRooms.length, data: defaultRooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
