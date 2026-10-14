const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: () => new mongoose.Types.ObjectId(),
    },
    petIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true,
      },
    ],
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    dates: {
      checkIn: { type: Date, required: true },
      checkOut: { type: Date, required: true },
      actualCheckIn: { type: Date },
      actualCheckOut: { type: Date },
    },
    addOnServices: [
      {
        serviceType: {
          type: String,
          enum: [
            'grooming',
            'webcam_stream',
            'custom_diet',
            'medication_administration',
            'daily_walk',
          ],
          required: true,
        },
        unitPrice: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
        notes: { type: String, default: '' },
      },
    ],
    financials: {
      nights: { type: Number, required: true },
      baseTotal: { type: Number, required: true },
      addOnsTotal: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
      currency: { type: String, default: 'IDR' },
      paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial', 'paid', 'refunded'],
        default: 'unpaid',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    intakeChecklist: {
      belongingsReceived: [{ type: String }],
      ownFoodProvided: { type: Boolean, default: false },
      medicationsHandedOver: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
