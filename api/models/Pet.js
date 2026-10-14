const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: () => new mongoose.Types.ObjectId(),
    },
    name: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true,
    },
    species: {
      type: String,
      enum: ['dog', 'cat', 'other'],
      required: [true, 'Species is required'],
    },
    breed: {
      type: String,
      required: [true, 'Breed is required'],
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
    },
    weightKg: {
      type: Number,
      required: [true, 'Weight in kg is required'],
      min: 0.1,
    },
    dietary: {
      foodType: { type: String, default: 'Standard Kibble' },
      portionPerMeal: { type: String, default: '1 cup' },
      feedingsPerDay: { type: Number, default: 2 },
      allergies: [{ type: String }],
      specialInstructions: { type: String, default: '' },
    },
    temperament: {
      socialWithDogs: { type: Boolean, default: true },
      socialWithCats: { type: Boolean, default: false },
      handlingNotes: { type: String, default: '' },
      aggressionTriggers: [{ type: String }],
    },
    vaccines: [
      {
        name: { type: String, required: true },
        administeredDate: { type: Date, default: Date.now },
        expiryDate: { type: Date, required: true },
        documentUrl: { type: String },
        verified: { type: Boolean, default: false },
      },
    ],
    medicalNotes: {
      chronicConditions: [{ type: String }],
      medications: [
        {
          name: { type: String },
          dosage: { type: String },
          frequency: { type: String },
          instructions: { type: String },
        },
      ],
      emergencyVetContact: {
        clinicName: { type: String, default: 'Central Animal Hospital' },
        phone: { type: String, default: '+62-21-555-0199' },
        vetName: { type: String, default: 'Dr. Sarah Setiawan' },
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Pet || mongoose.model('Pet', PetSchema);
