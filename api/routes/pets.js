const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');

// In-memory fallback pets store
const inMemoryPets = [
  {
    _id: '670f2a2b3c4d5e6f7a8b9d01',
    name: 'Kopi',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    weightKg: 28,
    dietary: {
      foodType: 'Royal Canin Maxi Adult',
      portionPerMeal: '250g',
      feedingsPerDay: 2,
      allergies: ['Chicken'],
      specialInstructions: 'Mix with warm water before serving',
    },
    temperament: {
      socialWithDogs: true,
      socialWithCats: false,
      handlingNotes: 'Loves belly rubs, mild storm anxiety',
      aggressionTriggers: [],
    },
    vaccines: [
      {
        name: 'Rabies',
        administeredDate: new Date('2026-01-10'),
        expiryDate: new Date('2027-01-10'),
        verified: true,
      },
      {
        name: 'DHPP',
        administeredDate: new Date('2026-02-15'),
        expiryDate: new Date('2027-02-15'),
        verified: true,
      },
    ],
    medicalNotes: {
      chronicConditions: [],
      medications: [],
      emergencyVetContact: {
        clinicName: 'Jakarta Animal Medical Center',
        phone: '+62-21-7888-9999',
        vetName: 'Dr. Hendra Wijaya',
      },
    },
    createdAt: new Date('2026-03-01'),
  },
  {
    _id: '670f2a2b3c4d5e6f7a8b9d02',
    name: 'Matcha',
    species: 'cat',
    breed: 'British Shorthair',
    age: 2,
    weightKg: 4.5,
    dietary: {
      foodType: 'Orijen Cat & Kitten + Wet topper',
      portionPerMeal: '60g',
      feedingsPerDay: 3,
      allergies: [],
      specialInstructions: 'Wet food only for evening feeding',
    },
    temperament: {
      socialWithDogs: false,
      socialWithCats: true,
      handlingNotes: 'Prefers quiet observation from high perches',
      aggressionTriggers: ['Vacuum cleaner sound'],
    },
    vaccines: [
      {
        name: 'FVRCP',
        administeredDate: new Date('2026-04-10'),
        expiryDate: new Date('2027-04-10'),
        verified: true,
      },
    ],
    medicalNotes: {
      chronicConditions: [],
      medications: [],
      emergencyVetContact: {
        clinicName: 'Paws & Claws Veterinary Clinic',
        phone: '+62-21-536-1234',
        vetName: 'Dr. Anita Rahardjo',
      },
    },
    createdAt: new Date('2026-04-01'),
  },
];

// GET /api/v1/pets
router.get('/', async (req, res) => {
  try {
    const hasDB = Boolean(process.env.MONGODB_URI && Pet.db && Pet.db.readyState === 1);
    if (hasDB) {
      const pets = await Pet.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: pets.length, data: pets });
    }
    return res.json({ success: true, count: inMemoryPets.length, data: inMemoryPets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/pets
router.post('/', async (req, res) => {
  try {
    const { name, species, breed, weightKg, dietary, temperament, vaccines, medicalNotes } = req.body;

    if (!name || !species || !breed || weightKg === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, species, breed, and weightKg are required.',
      });
    }

    // Vaccine expiry validation
    if (Array.isArray(vaccines)) {
      const today = new Date();
      for (const v of vaccines) {
        if (v.expiryDate && new Date(v.expiryDate) < today) {
          return res.status(400).json({
            success: false,
            message: `Vaccine '${v.name || 'Unknown'}' is expired. Boarding requires up-to-date vaccinations.`,
          });
        }
      }
    }

    const payload = {
      name,
      species,
      breed,
      weightKg: Number(weightKg),
      dietary: dietary || {},
      temperament: temperament || {},
      vaccines: vaccines || [],
      medicalNotes: medicalNotes || {
        emergencyVetContact: {
          clinicName: 'Central Animal Hospital',
          phone: '+62-21-555-0199',
        },
      },
    };

    const hasDB = Boolean(process.env.MONGODB_URI && Pet.db && Pet.db.readyState === 1);
    if (hasDB) {
      const newPet = await Pet.create(payload);
      return res.status(201).json({ success: true, data: newPet });
    }

    // In-memory fallback
    const mockPet = {
      _id: 'pet_' + Date.now().toString(36),
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryPets.unshift(mockPet);
    return res.status(201).json({ success: true, data: mockPet });
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
