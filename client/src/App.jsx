import React, { useState, useEffect } from 'react';
import HostelCatalog from './components/HostelCatalog';
import BookingForm from './components/BookingForm';
import AdminStayGrid from './components/AdminStayGrid';
import { Compass, ShieldCheck, HeartHandshake, Stethoscope, ChevronDown } from 'lucide-react';

export default function App() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeTab, setActiveTab] = useState('guest'); // 'guest' | 'admin'
  const [loading, setLoading] = useState(true);

  // Fetch rooms
  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/v1/rooms');
      const data = await res.json();
      if (data.success && data.data) {
        setRooms(data.data);
        if (!selectedRoom && data.data.length > 0) {
          setSelectedRoom(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/v1/bookings');
      const data = await res.json();
      if (data.success && data.data) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  useEffect(() => {
    Promise.all([fetchRooms(), fetchBookings()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    const formElement = document.getElementById('reservasi');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingSuccess = (newBooking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleUpdateBookingStatus = (updatedBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === updatedBooking._id ? updatedBooking : b))
    );
  };

  return (
    <div className="min-h-screen bg-canvas text-pine flex flex-col justify-between selection:bg-amber-light selection:text-primary">
      {/* Editorial Top Navigation */}
      <header className="border-b border-line bg-[#FAF8F3] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xs bg-primary flex items-center justify-center text-canvas font-serif font-bold text-lg shadow-stamp">
              Ψ
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-primary block leading-none">
                Sanatorium Botanika
              </span>
              <span className="text-[10px] uppercase tracking-widest text-moss block font-mono">
                Pet Hostel & Recovery Pavilion
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('guest')}
              className={`px-3 py-1.5 rounded-xs transition-all ${
                activeTab === 'guest'
                  ? 'bg-primary text-white font-medium shadow-stamp'
                  : 'text-moss hover:text-pine'
              }`}
            >
              Katalog & Reservasi
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-xs transition-all ${
                activeTab === 'admin'
                  ? 'bg-primary text-white font-medium shadow-stamp'
                  : 'text-moss hover:text-pine'
              }`}
            >
              Dasbor Operasional ({bookings.length})
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-grow w-full">
        {activeTab === 'guest' ? (
          <>
            {/* Hero Banner — Heritage Sanatorium & Botanical Retreat */}
            <div className="border border-line bg-white p-6 md:p-10 rounded-sm mb-12 shadow-subtle relative overflow-hidden">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-[#F8F5EE] border border-line px-2.5 py-1 rounded-xs text-[11px] font-medium text-terracotta mb-4">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Protokol Akustik Terisolasi & Pengawasan Paravet 24 Jam</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl text-primary font-medium leading-tight tracking-tight">
                  Penginapan Botanikal & Perawatan Hewan Berstandar Klinis.
                </h1>

                <p className="mt-4 text-moss text-sm sm:text-base leading-relaxed">
                  Ruang inap hening tanpa polusi suara kandang konvensional. Dikelola dengan
                  catatan intake nutrisi ketat, ventilasi udara terfiltrasi hepa, serta padang
                  rumput terbuka untuk kesejahteraan mental taring dan felin.
                </p>

                <div className="mt-8 flex flex-wrap gap-4 text-xs">
                  <a
                    href="#katalog"
                    className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xs shadow-stamp hover:bg-primary-hover active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <span>Jelajahi Suite Tersedia</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="#reservasi"
                    className="px-5 py-2.5 bg-[#F8F5EE] border border-line text-pine font-medium rounded-xs hover:border-primary transition-all"
                  >
                    Daftarkan Rekam Medis Hewan
                  </a>
                </div>
              </div>

              {/* Editorial Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-line mt-10 pt-6 text-xs text-moss">
                <div className="flex items-start gap-2.5">
                  <Stethoscope className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-pine block">Intake Medis Paravet</span>
                    <span>Pemeriksaan fisik saat kedatangan dan pemantauan nafsu makan berkala.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <HeartHandshake className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-pine block">Pemisahan Spesies Total</span>
                    <span>Pavilion felin terisolasi penuh dari getaran dan gonggongan kanin.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-pine block">Taman Sensorik Alami</span>
                    <span>Sesi jalan santai terpandu di tanah berumput alami non-beton.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Catalog Section */}
            <HostelCatalog
              rooms={rooms}
              selectedRoomId={selectedRoom?._id}
              onSelectRoom={handleSelectRoom}
            />

            {/* Booking & Medical Dossier Section */}
            <BookingForm
              selectedRoom={selectedRoom}
              rooms={rooms}
              onBookingSuccess={handleBookingSuccess}
            />
          </>
        ) : (
          /* Admin Monitoring View */
          <AdminStayGrid
            bookings={bookings}
            onUpdateStatus={handleUpdateBookingStatus}
          />
        )}
      </main>

      {/* Editorial Colophon / Footer */}
      <footer className="border-t border-line bg-[#FAF8F3] py-8 text-xs text-moss mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-serif font-bold text-primary text-sm block">
              Sanatorium Botanika Hewan Platform
            </span>
            <span className="text-[11px] text-moss">
              Architect / Author: Rizal Akbar Syah Fauzan Putra &bull; Target Repo: RizalSwikey/pet-hostel-platform
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>MERN Architecture &bull; Vercel Serverless Ready</span>
            <span className="font-mono text-terracotta">2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
