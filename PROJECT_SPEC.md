# PROJECT SPECIFICATION: Pet Hostel Platform

**Repository:** RizalSwikey/pet-hostel-platform  
**Architect / Author:** Rizal Akbar Syah Fauzan Putra  
**Target Architecture:** MERN (MongoDB, Express.js Serverless, React / Vite, Node.js) + Vercel Deployment  

---

## 1. Domain & Data Models (MongoDB / Mongoose)

### 1.1. Pet Model (`models/Pet.js`)
Captures health, behavioral, and boarding requirements.

```typescript
interface IPet {
  _id: ObjectId;
  ownerId: ObjectId; // ref: 'User'
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: number; // in months or years
  weightKg: number;
  dietary: {
    foodType: string;
    portionPerMeal: string;
    feedingsPerDay: number;
    allergies: string[];
    specialInstructions?: string;
  };
  temperament: {
    socialWithDogs: boolean;
    socialWithCats: boolean;
    handlingNotes: string; // e.g., 'Anxious during storms, needs slow intro'
    aggressionTriggers: string[];
  };
  vaccines: Array<{
    name: string; // Rabies, DHPP, Bordetella, FVRCP
    administeredDate: Date;
    expiryDate: Date;
    documentUrl?: string;
    verified: boolean;
  }>;
  medicalNotes: {
    chronicConditions: string[];
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      instructions: string;
    }>;
    emergencyVetContact: {
      clinicName: string;
      phone: string;
      vetName?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.2. Room / Suite Model (`models/Room.js`)
Configurable room tiers with pricing, species restriction, and capacity.

```typescript
interface IRoom {
  _id: ObjectId;
  roomNumber: string;
  tier: 'Standard' | 'Deluxe Suite' | 'Cat Condo';
  allowedSpecies: ('dog' | 'cat')[];
  capacity: {
    maxPets: number;
    maxWeightTotalKg: number;
  };
  pricing: {
    baseRatePerNight: number; // in IDR / cents
    peakSeasonMultiplier: number; // default 1.0
  };
  features: string[]; // ['Climate-controlled', '24/7 Webcam', 'Private Outdoor Run', 'Scratching Post Tower']
  status: 'available' | 'occupied' | 'maintenance';
  active: boolean;
}
```

### 1.3. Booking Model (`models/Booking.js`)
Tracks reservation window, selected suites, add-ons, and intake state.

```typescript
interface IBooking {
  _id: ObjectId;
  bookingCode: string; // unique human-readable, e.g. PH-2026-9481
  ownerId: ObjectId; // ref: 'User'
  petIds: ObjectId[]; // ref: 'Pet'
  roomId: ObjectId; // ref: 'Room'
  dates: {
    checkIn: Date;
    checkOut: Date;
    actualCheckIn?: Date;
    actualCheckOut?: Date;
  };
  addOnServices: Array<{
    serviceType: 'grooming' | 'webcam_stream' | 'custom_diet' | 'medication_administration' | 'daily_walk';
    unitPrice: number;
    quantity: number;
    notes?: string;
  }>;
  financials: {
    nights: number;
    baseTotal: number;
    addOnsTotal: number;
    discount: number;
    grandTotal: number;
    currency: 'IDR' | 'USD';
    paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  };
  status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
  intakeChecklist: {
    belongingsReceived: string[]; // e.g. ['Leash', 'Blue bowl', 'Kong toy']
    ownFoodProvided: boolean;
    medicationsHandedOver: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 2. Core API Specifications (Express REST)

Base URL: `/api/v1`

### 2.1. Room Availability
- **Endpoint:** `GET /api/v1/rooms/availability`
- **Query Params:**
  - `checkIn` (ISO string, required)
  - `checkOut` (ISO string, required)
  - `species` (`dog` | `cat`, optional)
  - `tier` (`Standard` | `Deluxe Suite` | `Cat Condo`, optional)
- **Logic:**
  1. Validate `checkIn < checkOut` and `checkIn >= today`.
  2. Query `Booking` collection for conflicting dates:
     `status IN ['confirmed', 'checked_in', 'pending']` AND `dates.checkIn < req.checkOut` AND `dates.checkOut > req.checkIn`.
  3. Exclude booked `roomId`s from the `Room` query where `active: true` and `status: 'available'`.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "count": 4,
    "data": [
      {
        "_id": "670f...",
        "roomNumber": "D-02",
        "tier": "Deluxe Suite",
        "allowedSpecies": ["dog"],
        "capacity": { "maxPets": 2, "maxWeightTotalKg": 45 },
        "pricing": { "baseRatePerNight": 250000 },
        "features": ["Climate-controlled", "Webcam access", "Private run"]
      }
    ]
  }
  ```

### 2.2. Pet Onboarding
- **Endpoint:** `POST /api/v1/pets`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:** Validated payload matching `IPet` (excluding `_id`, `createdAt`, `ownerId` injected from auth session).
- **Validation Rules:**
  - `name`, `species`, `breed`, `weightKg` required.
  - At least one contact in `medicalNotes.emergencyVetContact`.
  - Vaccine expiry date cannot be in the past at onboarding.
- **Response `201 Created`:** Returns created Pet document.

### 2.3. Booking Creation
- **Endpoint:** `POST /api/v1/bookings`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body:**
  ```json
  {
    "petIds": ["670f..."],
    "roomId": "670e...",
    "checkIn": "2026-11-01T08:00:00.000Z",
    "checkOut": "2026-11-05T12:00:00.000Z",
    "addOnServices": [
      { "serviceType": "webcam_stream", "quantity": 4, "unitPrice": 35000 },
      { "serviceType": "grooming", "quantity": 1, "unitPrice": 120000 }
    ],
    "intakeNotes": { "ownFoodProvided": true }
  }
  ```
- **Atomicity & Conflict Guard:**
  - Execute within MongoDB transaction or conditional write lock check to avoid double booking.
  - Calculate total nights: `Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))`.
  - Compute total server-side; do not trust client prices.
- **Response `201 Created`:** Returns booking confirmation object with `bookingCode`.

---

## 3. Visual System & Anti-AI-Slop Tokens

Design Direction: **Heritage Sanatorium & Modern Botanical Retreat**. Grounded, high-trust, editorial, legible. Eliminates generic template fatigue.

### 3.1. Color Tokens
- **Canvas / Background:** `#FDFBF7` (Linen / Warm Off-White)
- **Primary / Structure:** `#1B382B` (Heritage Deep Forest Green)
- **Secondary Accent:** `#C86432` (Warm Terracotta / Clay)
- **Support / Highlight:** `#E0A838` (Muted Amber)
- **Border / Neutral Line:** `#E4DED4` (Warm Raw Paper)
- **Text Primary:** `#14211A` (Deep Pine Charcoal)
- **Text Muted:** `#5C6B61` (Moss Gray)

### 3.2. Prohibited Aesthetics (Strict Zero-Tolerance)
- **NO Purple / Blue / Magenta neon gradients.**
- **NO `backdrop-blur` glassy translucent cards with neon drop shadows.**
- **NO Pill-shaped ultra-round button clusters or cartoonish bubbly borders.**
- **NO Stock AI marketing slogans** (e.g. "Unleash the Ultimate Pawsome Experience", "Smart AI Care for your Furry Friend").
- **NO Placeholder fake numbers** (e.g. "Over 10,000+ Happy Dogs" unless verified).

### 3.3. Typography & UI Layout Standards
- **Font Stack:** Clean geometric sans for UI (`Plus Jakarta Sans` or `Inter`) paired with serif accents for headings (`Instrument Serif` or `Newsreader`).
- **Corner Radius:** Subtle and structured: `rounded-sm` (2px) to `rounded-md` (6px). No `rounded-3xl` or `rounded-full` cards.
- **Borders:** Crisp single-pixel hairpins (`border border-[#E4DED4]`).
- **Shadows:** Hard minimal offset shadow (`box-shadow: 2px 2px 0px #1B382B`) or soft warm tint (`rgba(27, 56, 43, 0.05)`).

---

## 4. OMP (Execution & Code Generation Directives)

### 4.1. Silent File Generation Rule
- **Direct Workspace Output:** All code, models, controllers, routers, and client components must be written directly to workspace files using filesystem tools.
- **No Chat Dumps:** Do not print giant multi-file code blocks into the interactive conversational output. Write the files, run tests or syntax verification, and report compact execution status.

### 4.2. Vercel Serverless Express Setup
The backend runs as a single serverless function bundle on Vercel or separate micro-routes under `api/`.

#### Folder Layout:
```
pet-hostel-platform/
├── api/
│   └── index.js             # Serverless Express wrapper
├── server/
│   ├── config/db.js         # Mongoose connection with reuse caching
│   ├── controllers/
│   ├── models/
│   │   ├── Pet.js
│   │   ├── Room.js
│   │   └── Booking.js
│   ├── routes/
│   └── app.js               # Express application definition
├── client/                  # Vite + React or Next.js static output
├── vercel.json
├── package.json
└── PROJECT_SPEC.md
```

#### `api/index.js` (Serverless Entry Point)
```javascript
const app = require('../server/app');
const connectDB = require('../server/config/db');

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
```

#### `server/config/db.js` (Cached Connection for Lambda / Vercel Serverless)
```javascript
const mongoose = require('mongoose');

let cachedConnection = global.mongooseConnection;

if (!cachedConnection) {
  cachedConnection = global.mongooseConnection = { conn: null, promise: null };
}

async function connectDB() {
  if (cachedConnection.conn) {
    return cachedConnection.conn;
  }
  if (!cachedConnection.promise) {
    cachedConnection.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    }).then((m) => m);
  }
  cachedConnection.conn = await cachedConnection.promise;
  return cachedConnection.conn;
}

module.exports = connectDB;
```

#### `vercel.json` Configuration
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/client/dist/$1"
    }
  ]
}
```
