import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, HeartPulse, Utensils, Shield, Plus, Check, AlertCircle, FileText } from 'lucide-react';

const ADD_ON_OPTIONS = [
  {
    type: 'webcam_stream',
    title: 'Akses Kamera Live Stream 24/7',
    price: 35000,
    perNight: true,
    desc: 'Pemantauan real-time melalui feed terenkripsi resolusi HD langsung ke ponsel pemilik.',
  },
  {
    type: 'grooming',
    title: 'Spa & Mandi Herbal Botanikal',
    price: 120000,
    perNight: false,
    desc: 'Bilas chamomile organik, pembersihan telinga higienis, dan potong kuku menjelang check-out.',
  },
  {
    type: 'custom_diet',
    title: 'Preparasi Diet Khusus / Raw Food',
    price: 25000,
    perNight: true,
    desc: 'Penyiapan makanan khusus sesuai gramatur dan instruksi nutrisi khusus di dapur steril.',
  },
  {
    type: 'daily_walk',
    title: 'Jalan Santai Terpandu di Taman Terbuka',
    price: 40000,
    perNight: true,
    desc: 'Sesi latihan penciuman dan peregangan kaki 30 menit di padang rumput privat bersertifikat.',
  },
  {
    type: 'medication_administration',
    title: 'Pemberian Obat Terjadwal oleh Paravet',
    price: 30000,
    perNight: true,
    desc: 'Pemberian obat resep/vitamin oral sesuai jadwal tepat waktu disertai log kepatuhan dosis.',
  },
];

export default function BookingForm({ selectedRoom, rooms = [], onBookingSuccess }) {
  // Booking dates
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];

  const [roomId, setRoomId] = useState(selectedRoom?._id || '');
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);

  // Sync selectedRoom prop
  useEffect(() => {
    if (selectedRoom?._id) {
      setRoomId(selectedRoom._id);
    }
  }, [selectedRoom]);

  // Pet Profile State
  const [petForm, setPetForm] = useState({
    name: 'Milo',
    species: 'dog',
    breed: 'Beagle',
    age: 2,
    weightKg: 12,
    dietary: {
      foodType: 'Royal Canin Medium Adult',
      portionPerMeal: '180g',
      feedingsPerDay: 2,
      allergies: 'Ayam, Jagung',
      specialInstructions: 'Campur air hangat suam kuku sebelum disajikan.',
    },
    temperament: {
      socialWithDogs: true,
      socialWithCats: false,
      handlingNotes: 'Ramah pada perawat baru, takut suara guntur mendadak.',
      aggressionTriggers: '',
    },
    vaccines: [
      {
        name: 'Rabies',
        expiryDate: '2027-04-15',
      },
      {
        name: 'DHPP / Core',
        expiryDate: '2027-05-20',
      },
    ],
    medicalNotes: {
      chronicConditions: '',
      medications: [
        {
          name: 'Glucosamine Joint Support',
          dosage: '1 tablet',
          frequency: 'Pagi hari setelah sarapan',
          instructions: 'Masukkan langsung ke makanan',
        },
      ],
      emergencyVetContact: {
        clinicName: 'RS Hewan Jakarta Pusat',
        phone: '+62-21-555-0199',
        vetName: 'Drh. Iwan Santoso',
      },
    },
  });

  // Intake Checklist
  const [intakeChecklist, setIntakeChecklist] = useState({
    ownFoodProvided: true,
    medicationsHandedOver: false,
    belongingsReceived: ['Kalung Nama Kulit', 'Mangkuk Keramik', 'Boneka Kesayangan'],
  });
  const [belongingInput, setBelongingInput] = useState('');

  // Selected add-ons: map of serviceType -> quantity
  const [selectedAddOns, setSelectedAddOns] = useState({
    webcam_stream: 1,
    grooming: 1,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Current active room object
  const activeRoom = useMemo(() => {
    return rooms.find((r) => r._id === roomId) || selectedRoom || rooms[0];
  }, [roomId, rooms, selectedRoom]);

  // Calculation of nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const diff = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  // Financial calculations
  const financials = useMemo(() => {
    const baseRate = activeRoom?.pricing?.baseRatePerNight || 200000;
    const baseTotal = baseRate * nights;

    let addOnsTotal = 0;
    const detailedAddOns = [];

    Object.entries(selectedAddOns).forEach(([type, qty]) => {
      if (qty > 0) {
        const option = ADD_ON_OPTIONS.find((o) => o.type === type);
        if (option) {
          const effectiveQty = option.perNight ? qty * nights : qty;
          const subtotal = option.price * effectiveQty;
          addOnsTotal += subtotal;
          detailedAddOns.push({
            serviceType: type,
            title: option.title,
            unitPrice: option.price,
            quantity: effectiveQty,
            subtotal,
          });
        }
      }
    });

    return {
      nights,
      baseRate,
      baseTotal,
      addOnsTotal,
      grandTotal: baseTotal + addOnsTotal,
      detailedAddOns,
    };
  }, [activeRoom, nights, selectedAddOns]);

  const toggleAddOn = (type) => {
    setSelectedAddOns((prev) => {
      const next = { ...prev };
      if (next[type]) {
        delete next[type];
      } else {
        next[type] = 1;
      }
      return next;
    });
  };

  const handleAddBelonging = (e) => {
    e.preventDefault();
    if (!belongingInput.trim()) return;
    setIntakeChecklist((prev) => ({
      ...prev,
      belongingsReceived: [...prev.belongingsReceived, belongingInput.trim()],
    }));
    setBelongingInput('');
  };

  const handleRemoveBelonging = (idx) => {
    setIntakeChecklist((prev) => ({
      ...prev,
      belongingsReceived: prev.belongingsReceived.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (!roomId) {
        throw new Error('Silakan pilih kamar/suite terlebih dahulu.');
      }
      if (new Date(checkIn) >= new Date(checkOut)) {
        throw new Error('Tanggal check-out harus lebih lambat dari check-in.');
      }

      // Step 1: Create or register pet
      const petPayload = {
        name: petForm.name,
        species: petForm.species,
        breed: petForm.breed,
        age: Number(petForm.age),
        weightKg: Number(petForm.weightKg),
        dietary: {
          foodType: petForm.dietary.foodType,
          portionPerMeal: petForm.dietary.portionPerMeal,
          feedingsPerDay: Number(petForm.dietary.feedingsPerDay),
          allergies: petForm.dietary.allergies
            ? petForm.dietary.allergies.split(',').map((s) => s.trim())
            : [],
          specialInstructions: petForm.dietary.specialInstructions,
        },
        temperament: petForm.temperament,
        vaccines: petForm.vaccines.map((v) => ({
          name: v.name,
          expiryDate: new Date(v.expiryDate),
          verified: true,
        })),
        medicalNotes: {
          chronicConditions: petForm.medicalNotes.chronicConditions
            ? petForm.medicalNotes.chronicConditions.split(',').map((s) => s.trim())
            : [],
          medications: petForm.medicalNotes.medications,
          emergencyVetContact: petForm.medicalNotes.emergencyVetContact,
        },
      };

      const petRes = await fetch('/api/v1/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(petPayload),
      });

      const petData = await petRes.json();
      if (!petData.success) {
        throw new Error(petData.message || 'Gagal menyimpan profil hewan.');
      }

      const savedPetId = petData.data._id;

      // Step 2: Create Booking
      const bookingPayload = {
        petIds: [savedPetId],
        roomId: activeRoom._id,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        addOnServices: financials.detailedAddOns.map((a) => ({
          serviceType: a.serviceType,
          unitPrice: a.unitPrice,
          quantity: a.quantity,
          notes: a.title,
        })),
        intakeNotes: intakeChecklist,
      };

      const bookingRes = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });

      const bookingData = await bookingRes.json();
      if (!bookingData.success) {
        throw new Error(bookingData.message || 'Gagal menyelesaikan reservasi.');
      }

      setConfirmedBooking(bookingData.data);
      if (onBookingSuccess) {
        onBookingSuccess(bookingData.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section id="reservasi" className="py-8">
      {/* Section Header */}
      <div className="border-b border-line pb-6 mb-8">
        <span className="text-xs font-semibold tracking-widest text-terracotta uppercase">
          Intake & Boarding Dossier
        </span>
        <h2 className="font-serif text-3xl md:text-4xl text-primary font-medium mt-1">
          Formulir Reservasi & Rekam Medis Hewan
        </h2>
        <p className="text-moss text-sm mt-1 max-w-2xl">
          Standar penerimaan klinis sanatorium. Seluruh informasi nutrisi, penanganan temperamen,
          dan vaksinasi diverifikasi sebelum kunci suite diserahkan.
        </p>
      </div>

      {confirmedBooking ? (
        /* Booking Confirmation Receipt */
        <div className="bg-white border-2 border-primary p-6 md:p-8 rounded-sm shadow-stamp max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xs text-xs font-semibold mb-6">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Reservasi Berhasil Dikonfirmasi & Terverifikasi di Ledger</span>
          </div>

          <div className="border-b border-line pb-4 mb-4 flex justify-between items-baseline">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-moss block">Nomor Tiket Reservasi</span>
              <span className="font-mono text-2xl font-bold text-primary tracking-wider">
                {confirmedBooking.bookingCode}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-moss block">Status Suite</span>
              <span className="inline-block bg-primary text-white text-xs px-2.5 py-0.5 rounded-xs font-medium">
                Confirmed / Siap Intake
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-[#F8F5EE] p-4 rounded-xs border border-line">
            <div>
              <span className="text-moss block">Tamu Menginap:</span>
              <span className="font-semibold text-pine text-sm">{petForm.name} ({petForm.breed})</span>
              <span className="text-moss block mt-1">Bobot Terdaftar: {petForm.weightKg} kg</span>
            </div>
            <div>
              <span className="text-moss block">Suite Dipesan:</span>
              <span className="font-semibold text-pine text-sm">
                {activeRoom?.roomNumber} — {activeRoom?.tier}
              </span>
              <span className="text-moss block mt-1">
                {new Date(checkIn).toLocaleDateString('id-ID')} s/d {new Date(checkOut).toLocaleDateString('id-ID')} ({nights} malam)
              </span>
            </div>
          </div>

          <div className="border-t border-line pt-4 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pine mb-2">Rincian Finansial Bersih:</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-moss">
                <span>Biaya Suite ({nights} malam × {formatIDR(financials.baseRate)})</span>
                <span className="font-mono text-pine">{formatIDR(financials.baseTotal)}</span>
              </div>
              {financials.detailedAddOns.map((addon, i) => (
                <div key={i} className="flex justify-between text-moss">
                  <span>{addon.title} ({addon.quantity} unit)</span>
                  <span className="font-mono text-pine">{formatIDR(addon.subtotal)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold text-primary pt-2 border-t border-line mt-2">
                <span>Total Akhir</span>
                <span className="font-mono text-terracotta">{formatIDR(financials.grandTotal)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setConfirmedBooking(null)}
            className="w-full py-2.5 bg-primary text-white text-xs font-semibold rounded-xs shadow-stamp hover:bg-primary-hover"
          >
            Buat Reservasi Baru
          </button>
        </div>
      ) : (
        /* Booking Input Form */
        <form onSubmit={handleSubmit} className="space-y-8">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs rounded-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Details & Pet Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Dates & Room Selection */}
              <div className="bg-white border border-line p-5 rounded-sm shadow-subtle">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-line">
                  <Calendar className="w-4 h-4 text-terracotta" />
                  <h3 className="font-serif text-lg font-medium text-primary">
                    1. Periode Menginap & Pilihan Suite
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-moss mb-1 font-medium">Tanggal Check-In:</label>
                    <input
                      type="date"
                      min={todayStr}
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      required
                      className="w-full border border-line p-2 rounded-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-moss mb-1 font-medium">Tanggal Check-Out:</label>
                    <input
                      type="date"
                      min={checkIn || todayStr}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                      className="w-full border border-line p-2 rounded-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-moss mb-1 font-medium">Kamar Terpilih:</label>
                    <select
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="w-full border border-line p-2 rounded-xs focus:border-primary focus:outline-none bg-white font-medium text-pine"
                    >
                      {rooms.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.roomNumber} — {r.tier} ({formatIDR(r.pricing.baseRatePerNight)}/mlm)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-[#F8F5EE] border border-line/70 rounded-xs flex items-center justify-between text-xs">
                  <span className="text-moss">Durasi inap terhitung:</span>
                  <span className="font-bold text-primary font-mono">{nights} Malam</span>
                </div>
              </div>

              {/* 2. Pet Health & Identity Form */}
              <div className="bg-white border border-line p-5 rounded-sm shadow-subtle">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-line">
                  <HeartPulse className="w-4 h-4 text-terracotta" />
                  <h3 className="font-serif text-lg font-medium text-primary">
                    2. Identitas Tamu & Riwayat Medis Hewan
                  </h3>
                </div>

                {/* Identity Basics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                  <div>
                    <label className="block text-moss mb-1">Nama Panggilan:</label>
                    <input
                      type="text"
                      value={petForm.name}
                      onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                      required
                      className="w-full border border-line p-2 rounded-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-moss mb-1">Spesies:</label>
                    <select
                      value={petForm.species}
                      onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}
                      className="w-full border border-line p-2 rounded-xs focus:border-primary focus:outline-none bg-white"
                    >
                      <option value="dog">Anjing</option>
                      <option value="cat">Kucing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-moss mb-1">Ras / Breed:</label>
                    <input
                      type="text"
                      value={petForm.breed}
                      onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                      required
                      className="w-full border border-line p-2 rounded-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-moss mb-1">Bobot (kg):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={petForm.weightKg}
                      onChange={(e) => setPetForm({ ...petForm, weightKg: e.target.value })}
                      required
                      className="w-full border border-line p-2 rounded-xs focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Dietary Section */}
                <div className="border-t border-line pt-4 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-3">
                    <Utensils className="w-3.5 h-3.5 text-terracotta" />
                    <span>Protokol Makanan & Nutrisi Harian</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-moss mb-1">Merek & Jenis Makanan:</label>
                      <input
                        type="text"
                        value={petForm.dietary.foodType}
                        onChange={(e) =>
                          setPetForm({
                            ...petForm,
                            dietary: { ...petForm.dietary, foodType: e.target.value },
                          })
                        }
                        className="w-full border border-line p-2 rounded-xs focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-moss mb-1">Porsi per Jadwal:</label>
                      <input
                        type="text"
                        value={petForm.dietary.portionPerMeal}
                        onChange={(e) =>
                          setPetForm({
                            ...petForm,
                            dietary: { ...petForm.dietary, portionPerMeal: e.target.value },
                          })
                        }
                        className="w-full border border-line p-2 rounded-xs focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-moss mb-1">Frekuensi / Hari:</label>
                      <select
                        value={petForm.dietary.feedingsPerDay}
                        onChange={(e) =>
                          setPetForm({
                            ...petForm,
                            dietary: { ...petForm.dietary, feedingsPerDay: Number(e.target.value) },
                          })
                        }
                        className="w-full border border-line p-2 rounded-xs focus:border-primary focus:outline-none bg-white"
                      >
                        <option value={1}>1 kali</option>
                        <option value={2}>2 kali (Pagi & Sore)</option>
                        <option value={3}>3 kali</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-3">
                    <div>
                      <label className="block text-moss mb-1">Riwayat Alergi Makanan:</label>
                      <input
                        type="text"
                        placeholder="Contoh: Ayam, Telur, Gluten"
                        value={petForm.dietary.allergies}
                        onChange={(e) =>
                          setPetForm({
                            ...petForm,
                            dietary: { ...petForm.dietary, allergies: e.target.value },
                          })
                        }
                        className="w-full border border-line p-2 rounded-xs focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-moss mb-1">Instruksi Khusus Diet:</label>
                      <input
                        type="text"
                        placeholder="Contoh: Rendam air hangat sebelum makan"
                        value={petForm.dietary.specialInstructions}
                        onChange={(e) =>
                          setPetForm({
                            ...petForm,
                            dietary: { ...petForm.dietary, specialInstructions: e.target.value },
                          })
                        }
                        className="w-full border border-line p-2 rounded-xs focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Vaccines & Veterinary Section */}
                <div className="border-t border-line pt-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-3">
                    <Shield className="w-3.5 h-3.5 text-terracotta" />
                    <span>Verifikasi Vaksin & Kontak Darurat Paravet</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                    <div className="p-2.5 bg-[#FAF8F3] border border-line rounded-xs">
                      <span className="font-medium text-pine block mb-1">Vaksin Wajib: Rabies</span>
                      <div className="flex items-center justify-between text-moss">
                        <span>Kadaluarsa:</span>
                        <input
                          type="date"
                          value={petForm.vaccines[0]?.expiryDate || ''}
                          onChange={(e) => {
                            const newVax = [...petForm.vaccines];
                            newVax[0] = { ...newVax[0], name: 'Rabies', expiryDate: e.target.value };
                            setPetForm({ ...petForm, vaccines: newVax });
                          }}
                          className="border border-line px-2 py-1 rounded-xs bg-white"
                        />
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#FAF8F3] border border-line rounded-xs">
                      <span className="font-medium text-pine block mb-1">
                        {petForm.species === 'cat' ? 'Vaksin FVRCP' : 'Vaksin DHPP'}
                      </span>
                      <div className="flex items-center justify-between text-moss">
                        <span>Kadaluarsa:</span>
                        <input
                          type="date"
                          value={petForm.vaccines[1]?.expiryDate || ''}
                          onChange={(e) => {
                            const newVax = [...petForm.vaccines];
                            newVax[1] = {
                              ...newVax[1],
                              name: petForm.species === 'cat' ? 'FVRCP' : 'DHPP',
                              expiryDate: e.target.value,
                            };
                            setPetForm({ ...petForm, vaccines: newVax });
                          }}
                          className="border border-line px-2 py-1 rounded-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-moss mb-1">Klinik Dokter Hewan Langganan:</label>
                      <input
                        type="text"
                        value={petForm.medicalNotes.emergencyVetContact.clinicName}
                        onChange={(e) =>
                          setPetForm({
                            ...petForm,
                            medicalNotes: {
                              ...petForm.medicalNotes,
                              emergencyVetContact: {
                                ...petForm.medicalNotes.emergencyVetContact,
                                clinicName: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full border border-line p-2 rounded-xs focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-moss mb-1">Nomor Telepon Paravet / Dokter:</label>
                      <input
                        type="text"
                        value={petForm.medicalNotes.emergencyVetContact.phone}
                        onChange={(e) =>
                          setPetForm({
                            ...petForm,
                            medicalNotes: {
                              ...petForm.medicalNotes,
                              emergencyVetContact: {
                                ...petForm.medicalNotes.emergencyVetContact,
                                phone: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full border border-line p-2 rounded-xs focus:border-primary focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Intake Checklist & Belongings */}
                <div className="border-t border-line pt-4 mt-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-3">
                    <FileText className="w-3.5 h-3.5 text-terracotta" />
                    <span>Checklist Bawaan Intake Saat Tiba</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={intakeChecklist.ownFoodProvided}
                        onChange={(e) =>
                          setIntakeChecklist({
                            ...intakeChecklist,
                            ownFoodProvided: e.target.checked,
                          })
                        }
                        className="rounded-xs text-primary focus:ring-0"
                      />
                      <span>Membawa pakan sendiri dari rumah</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={intakeChecklist.medicationsHandedOver}
                        onChange={(e) =>
                          setIntakeChecklist({
                            ...intakeChecklist,
                            medicationsHandedOver: e.target.checked,
                          })
                        }
                        className="rounded-xs text-primary focus:ring-0"
                      />
                      <span>Menyerahkan obat rutin saat intake</span>
                    </label>
                  </div>

                  <div className="text-xs">
                    <label className="block text-moss mb-1">Daftar Barang Bawaan Fisik:</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {intakeChecklist.belongingsReceived.map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-[#EFECE6] border border-line text-pine px-2 py-0.5 rounded-xs flex items-center gap-1.5"
                        >
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBelonging(idx)}
                            className="text-moss hover:text-terracotta font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tambah barang (e.g. Kalung, Selimut, Mainan)"
                        value={belongingInput}
                        onChange={(e) => setBelongingInput(e.target.value)}
                        className="border border-line p-1.5 rounded-xs text-xs flex-grow focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={handleAddBelonging}
                        className="px-3 py-1.5 bg-primary text-white rounded-xs text-xs"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Add-Ons & Summary Ledger */}
            <div className="space-y-6">
              {/* Add-On Services */}
              <div className="bg-white border border-line p-5 rounded-sm shadow-subtle">
                <h3 className="font-serif text-lg font-medium text-primary pb-3 mb-4 border-b border-line">
                  Layanan Tambahan Terkurasi
                </h3>
                <div className="space-y-3">
                  {ADD_ON_OPTIONS.map((opt) => {
                    const isSelected = Boolean(selectedAddOns[opt.type]);
                    return (
                      <div
                        key={opt.type}
                        onClick={() => toggleAddOn(opt.type)}
                        className={`p-3 rounded-xs border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-terracotta bg-[#FFFBF7]'
                            : 'border-line hover:border-moss bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-semibold text-xs text-pine block">
                              {opt.title}
                            </span>
                            <span className="text-[11px] text-moss block mt-0.5 leading-snug">
                              {opt.desc}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-xs font-mono font-bold text-terracotta block">
                              +{formatIDR(opt.price)}
                            </span>
                            <span className="text-[10px] text-moss">
                              {opt.perNight ? '/ malam' : '/ reservasi'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Breakdown / Checkout Ledger */}
              <div className="bg-[#FAF8F3] border-2 border-primary p-5 rounded-sm shadow-stamp">
                <h3 className="font-serif text-lg font-medium text-primary pb-2 mb-3 border-b border-primary/20">
                  Ringkasan Tagihan Reservasi
                </h3>

                <div className="space-y-2 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-moss">
                      Suite {activeRoom?.roomNumber} ({nights} malam)
                    </span>
                    <span className="font-mono text-pine">{formatIDR(financials.baseTotal)}</span>
                  </div>

                  {financials.detailedAddOns.map((addon) => (
                    <div key={addon.serviceType} className="flex justify-between text-moss">
                      <span className="truncate pr-2">{addon.title}</span>
                      <span className="font-mono text-pine flex-shrink-0">
                        {formatIDR(addon.subtotal)}
                      </span>
                    </div>
                  ))}

                  <div className="border-t border-line/80 pt-2 mt-2 flex justify-between items-baseline font-bold text-primary text-sm">
                    <span>Estimasi Biaya Bersih:</span>
                    <span className="font-mono text-base text-terracotta">
                      {formatIDR(financials.grandTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-primary text-white text-xs font-semibold tracking-wider uppercase rounded-xs shadow-stamp hover:bg-primary-hover active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? 'Memproses Pendaftaran...' : 'Konfirmasi Reservasi & Cetak Tiket'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
