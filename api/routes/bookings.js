const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Pet = require('../models/Pet');

// Default catalog add-on prices
const ADD_ON_RATES = {
  grooming: 120000,
  webcam_stream: 35000,
  custom_diet: 25000,
  medication_administration: 30000,
  daily_walk: 40000,
};

// In-memory fallback bookings store
const inMemoryBookings = [
  {
    _id: '670f3a2b3c4d5e6f7a8b9e01',
    bookingCode: 'PH-2026-8192',
    roomId: {
      _id: '670f1a2b3c4d5e6f7a8b9c01',
      roomNumber: 'D-01',
      tier: 'Deluxe Suite',
      pricing: { baseRatePerNight: 280000 },
    },
    petIds: [
      {
        _id: '670f2a2b3c4d5e6f7a8b9d01',
        name: 'Kopi',
        species: 'dog',
        breed: 'Golden Retriever',
        weightKg: 28,
      },
    ],
    dates: {
      checkIn: new Date(Date.now() - 24 * 3600 * 1000),
      checkOut: new Date(Date.now() + 48 * 3600 * 1000),
      actualCheckIn: new Date(Date.now() - 22 * 3600 * 1000),
    },
    addOnServices: [
      { serviceType: 'webcam_stream', unitPrice: 35000, quantity: 3, notes: 'VIP Camera Access' },
      { serviceType: 'grooming', unitPrice: 120000, quantity: 1, notes: 'Herbal Spa Bath' },
    ],
    financials: {
      nights: 3,
      baseTotal: 840000,
      addOnsTotal: 225000,
      discount: 0,
      grandTotal: 1065000,
      currency: 'IDR',
      paymentStatus: 'paid',
    },
    status: 'checked_in',
    intakeChecklist: {
      belongingsReceived: ['Red Harness', 'Favorite Duck Chew Toy'],
      ownFoodProvided: true,
      medicationsHandedOver: false,
    },
    createdAt: new Date(Date.now() - 48 * 3600 * 1000),
  },
  {
    _id: '670f3a2b3c4d5e6f7a8b9e02',
    bookingCode: 'PH-2026-4402',
    roomId: {
      _id: '670f1a2b3c4d5e6f7a8b9c05',
      roomNumber: 'C-01',
      tier: 'Cat Condo',
      pricing: { baseRatePerNight: 180000 },
    },
    petIds: [
      {
        _id: '670f2a2b3c4d5e6f7a8b9d02',
        name: 'Matcha',
        species: 'cat',
        breed: 'British Shorthair',
        weightKg: 4.5,
      },
    ],
    dates: {
      checkIn: new Date(Date.now() + 24 * 3600 * 1000),
      checkOut: new Date(Date.now() + 96 * 3600 * 1000),
    },
    addOnServices: [
      { serviceType: 'custom_diet', unitPrice: 25000, quantity: 3, notes: 'Salmon Pate Topper' },
    ],
    financials: {
      nights: 3,
      baseTotal: 540000,
      addOnsTotal: 75000,
      discount: 0,
      grandTotal: 615000,
      currency: 'IDR',
      paymentStatus: 'paid',
    },
    status: 'confirmed',
    intakeChecklist: {
      belongingsReceived: ['Carrier Box', 'Cozy Wool Blanket'],
      ownFoodProvided: true,
      medicationsHandedOver: false,
    },
    createdAt: new Date(Date.now() - 12 * 3600 * 1000),
  },
];

// GET /api/v1/bookings
router.get('/', async (req, res) => {
  try {
    const hasDB = Boolean(process.env.MONGODB_URI && Booking.db && Booking.db.readyState === 1);
    if (hasDB) {
      const bookings = await Booking.find()
        .populate('roomId')
        .populate('petIds')
        .sort({ 'dates.checkIn': 1 });
      return res.json({ success: true, count: bookings.length, data: bookings });
    }
    return res.json({ success: true, count: inMemoryBookings.length, data: inMemoryBookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/bookings
router.post('/', async (req, res) => {
  try {
    const { petIds, roomId, checkIn, checkOut, addOnServices, intakeNotes } = req.body;

    if (!petIds || !Array.isArray(petIds) || petIds.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one pet must be selected.' });
    }
    if (!roomId) {
      return res.status(400).json({ success: false, message: 'Room selection is required.' });
    }
    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'Check-in and check-out dates are required.' });
    }

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime()) || inDate >= outDate) {
      return res.status(400).json({ success: false, message: 'Invalid check-in/check-out date range.' });
    }

    const diffDays = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
    const nights = Math.max(1, diffDays);

    const hasDB = Boolean(process.env.MONGODB_URI && Booking.db && Booking.db.readyState === 1);

    let roomPrice = 200000;
    let roomDoc = null;

    if (hasDB) {
      // Conflict check
      const conflict = await Booking.findOne({
        roomId,
        status: { $in: ['confirmed', 'checked_in', 'pending'] },
        'dates.checkIn': { $lt: outDate },
        'dates.checkOut': { $gt: inDate },
      });
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: 'Selected room is already reserved for the chosen date range.',
        });
      }

      roomDoc = await Room.findById(roomId);
      if (!roomDoc) {
        return res.status(404).json({ success: false, message: 'Room not found.' });
      }
      roomPrice = roomDoc.pricing.baseRatePerNight * (roomDoc.pricing.peakSeasonMultiplier || 1.0);
    }

    // Verified add-ons computation
    let addOnsTotal = 0;
    const validatedAddOns = (addOnServices || []).map((addon) => {
      const type = addon.serviceType;
      const unitPrice = ADD_ON_RATES[type] || addon.unitPrice || 25000;
      const quantity = Math.max(1, Number(addon.quantity) || 1);
      const subtotal = unitPrice * quantity;
      addOnsTotal += subtotal;
      return {
        serviceType: type,
        unitPrice,
        quantity,
        notes: addon.notes || '',
      };
    });

    const baseTotal = roomPrice * nights;
    const grandTotal = baseTotal + addOnsTotal;
    const bookingCode = `PH-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const bookingPayload = {
      bookingCode,
      petIds,
      roomId,
      dates: {
        checkIn: inDate,
        checkOut: outDate,
      },
      addOnServices: validatedAddOns,
      financials: {
        nights,
        baseTotal,
        addOnsTotal,
        discount: 0,
        grandTotal,
        currency: 'IDR',
        paymentStatus: 'paid',
      },
      status: 'confirmed',
      intakeChecklist: {
        belongingsReceived: intakeNotes?.belongingsReceived || [],
        ownFoodProvided: Boolean(intakeNotes?.ownFoodProvided),
        medicationsHandedOver: Boolean(intakeNotes?.medicationsHandedOver),
      },
    };

    if (hasDB) {
      const created = await Booking.create(bookingPayload);
      const populated = await Booking.findById(created._id).populate('roomId').populate('petIds');
      return res.status(201).json({ success: true, data: populated });
    }

    // In-memory fallback
    const mockCreated = {
      _id: 'bk_' + Date.now().toString(36),
      ...bookingPayload,
      roomId: {
        _id: roomId,
        roomNumber: 'D-02',
        tier: 'Deluxe Suite',
        pricing: { baseRatePerNight: roomPrice },
      },
      petIds: [
        {
          _id: petIds[0],
          name: 'Buddy',
          species: 'dog',
          breed: 'Companion Dog',
          weightKg: 15,
        },
      ],
      createdAt: new Date(),
    };
    inMemoryBookings.unshift(mockCreated);
    return res.status(201).json({ success: true, data: mockCreated });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/v1/bookings/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actualCheckIn, actualCheckOut, intakeChecklist } = req.body;

    const hasDB = Boolean(process.env.MONGODB_URI && Booking.db && Booking.db.readyState === 1);
    if (hasDB) {
      const update = {};
      if (status) update.status = status;
      if (actualCheckIn) update['dates.actualCheckIn'] = new Date(actualCheckIn);
      if (actualCheckOut) update['dates.actualCheckOut'] = new Date(actualCheckOut);
      if (intakeChecklist) update.intakeChecklist = intakeChecklist;

      const updated = await Booking.findByIdAndUpdate(id, update, { new: true })
        .populate('roomId')
        .populate('petIds');
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }
      return res.json({ success: true, data: updated });
    }

    // In-memory fallback
    const target = inMemoryBookings.find((b) => b._id === id || b.bookingCode === id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    if (status) target.status = status;
    if (actualCheckIn) target.dates.actualCheckIn = new Date(actualCheckIn);
    if (actualCheckOut) target.dates.actualCheckOut = new Date(actualCheckOut);
    if (intakeChecklist) target.intakeChecklist = { ...target.intakeChecklist, ...intakeChecklist };

    return res.json({ success: true, data: target });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
