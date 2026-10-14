import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, ShieldAlert, CheckCircle, Clock, Search, Filter, Phone, Eye, UserCheck } from 'lucide-react';

export default function AdminStayGrid({ bookings = [], onUpdateStatus }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDossier, setActiveDossier] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus !== 'all' && b.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const codeMatch = (b.bookingCode || '').toLowerCase().includes(q);
      const petMatch = (b.petIds || []).some((p) => (p.name || '').toLowerCase().includes(q));
      const roomMatch = b.roomId?.roomNumber?.toLowerCase().includes(q);
      return codeMatch || petMatch || roomMatch;
    }
    return true;
  });

  const activeCount = bookings.filter((b) => b.status === 'checked_in').length;
  const upcomingCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  const handleStatusChange = async (bookingId, newStatus) => {
    setLoadingId(bookingId);
    try {
      const body = { status: newStatus };
      if (newStatus === 'checked_in') {
        body.actualCheckIn = new Date().toISOString();
      } else if (newStatus === 'completed') {
        body.actualCheckOut = new Date().toISOString();
      }

      const res = await fetch(`/api/v1/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success && onUpdateStatus) {
        onUpdateStatus(data.data);
      }
    } catch (err) {
      console.error('Failed to update stay status:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <section id="admin" className="py-8">
      {/* Editorial Header */}
      <div className="border-b border-line pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest text-terracotta uppercase">
            Operations & Stay Monitoring
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary font-medium mt-1">
            Dasbor Pemantauan Check-In & Check-Out
          </h2>
          <p className="text-moss text-sm mt-1 max-w-xl">
            Sistem pengawasan intake langsung, verifikasi barang bawaan medis, dan pembaruan log
            kehadiran tamu sanatorium.
          </p>
        </div>

        {/* Real-time Status Badges */}
        <div className="flex gap-3 text-xs">
          <div className="bg-white border border-line px-3 py-2 rounded-xs shadow-subtle">
            <span className="text-moss block text-[10px] uppercase font-semibold">Tamu Menginap</span>
            <span className="font-mono text-lg font-bold text-emerald-800">{activeCount} Suite</span>
          </div>
          <div className="bg-white border border-line px-3 py-2 rounded-xs shadow-subtle">
            <span className="text-moss block text-[10px] uppercase font-semibold">Akan Tiba</span>
            <span className="font-mono text-lg font-bold text-amber-700">{upcomingCount} Tamu</span>
          </div>
          <div className="bg-white border border-line px-3 py-2 rounded-xs shadow-subtle">
            <span className="text-moss block text-[10px] uppercase font-semibold">Selesai Boarding</span>
            <span className="font-mono text-lg font-bold text-pine">{completedCount} Selesai</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#F8F5EE] border border-line p-3 rounded-sm mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xs transition-colors ${
              filterStatus === 'all'
                ? 'bg-primary text-white font-medium'
                : 'text-moss hover:text-pine'
            }`}
          >
            Semua Status ({bookings.length})
          </button>
          <button
            onClick={() => setFilterStatus('checked_in')}
            className={`px-3 py-1.5 rounded-xs transition-colors ${
              filterStatus === 'checked_in'
                ? 'bg-emerald-800 text-white font-medium'
                : 'text-moss hover:text-pine'
            }`}
          >
            Aktif Menginap ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('confirmed')}
            className={`px-3 py-1.5 rounded-xs transition-colors ${
              filterStatus === 'confirmed'
                ? 'bg-primary text-white font-medium'
                : 'text-moss hover:text-pine'
            }`}
          >
            Terkonfirmasi ({upcomingCount})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-xs transition-colors ${
              filterStatus === 'completed'
                ? 'bg-primary text-white font-medium'
                : 'text-moss hover:text-pine'
            }`}
          >
            Selesai ({completedCount})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-moss absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Cari kode / nama hewan / suite..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 border border-line rounded-xs text-xs bg-white w-64 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Table / Grid */}
      <div className="bg-white border border-line rounded-sm overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F3] border-b border-line text-moss uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Kode & Kamar</th>
                <th className="py-3 px-4 font-semibold">Tamu Pasien / Hewan</th>
                <th className="py-3 px-4 font-semibold">Jadwal Menginap</th>
                <th className="py-3 px-4 font-semibold">Protokol Intake</th>
                <th className="py-3 px-4 font-semibold">Layanan Terpilih</th>
                <th className="py-3 px-4 font-semibold">Status & Aksi Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-moss font-serif text-sm">
                    Tidak ada reservasi yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const pet = (b.petIds && b.petIds[0]) || { name: 'Tamu', breed: 'Campuran' };
                  const room = b.roomId || { roomNumber: 'N/A', tier: 'Suite' };
                  const isCheckedIn = b.status === 'checked_in';
                  const isConfirmed = b.status === 'confirmed';
                  const isCompleted = b.status === 'completed';

                  return (
                    <tr key={b._id} className="hover:bg-[#FCFAF6] transition-colors">
                      {/* Code & Room */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-primary block">
                          {b.bookingCode}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] font-semibold bg-[#EFECE6] text-primary px-1.5 py-0.2 rounded-xs">
                            {room.roomNumber}
                          </span>
                          <span className="text-[11px] text-moss">{room.tier}</span>
                        </div>
                      </td>

                      {/* Guest Pet */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-pine text-sm">{pet.name}</div>
                        <div className="text-[11px] text-moss">
                          {pet.species === 'cat' ? 'Kucing' : 'Anjing'} • {pet.breed}{' '}
                          {pet.weightKg ? `(${pet.weightKg} kg)` : ''}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4">
                        <div className="text-pine font-medium">
                          {new Date(b.dates.checkIn).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          -{' '}
                          {new Date(b.dates.checkOut).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                        <div className="text-[10px] text-moss mt-0.5">
                          {b.financials?.nights || 1} Malam • {formatIDR(b.financials?.grandTotal)}
                        </div>
                      </td>

                      {/* Intake Check */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px]">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                b.intakeChecklist?.ownFoodProvided
                                  ? 'bg-emerald-600'
                                  : 'bg-stone-300'
                              }`}
                            ></span>
                            <span className="text-moss">
                              Pakan:{' '}
                              {b.intakeChecklist?.ownFoodProvided ? 'Bawa Sendiri' : 'Disediakan'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                b.intakeChecklist?.medicationsHandedOver
                                  ? 'bg-amber-600'
                                  : 'bg-stone-300'
                              }`}
                            ></span>
                            <span className="text-moss">
                              Obat: {b.intakeChecklist?.medicationsHandedOver ? 'Ada' : 'Tidak Ada'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Add-ons */}
                      <td className="py-3.5 px-4">
                        {b.addOnServices && b.addOnServices.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {b.addOnServices.map((srv, idx) => (
                              <span
                                key={idx}
                                className="bg-[#FAF8F3] border border-line text-[10px] px-1.5 py-0.5 rounded-xs text-pine"
                              >
                                {srv.serviceType.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-moss text-[11px]">Standar</span>
                        )}
                      </td>

                      {/* Status & Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {isConfirmed && (
                            <button
                              onClick={() => handleStatusChange(b._id, 'checked_in')}
                              disabled={loadingId === b._id}
                              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xs text-[11px] font-medium flex items-center gap-1 shadow-sm transition-all"
                            >
                              <LogIn className="w-3 h-3" />
                              <span>Check-In</span>
                            </button>
                          )}

                          {isCheckedIn && (
                            <button
                              onClick={() => handleStatusChange(b._id, 'completed')}
                              disabled={loadingId === b._id}
                              className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-white rounded-xs text-[11px] font-medium flex items-center gap-1 shadow-sm transition-all"
                            >
                              <LogOut className="w-3 h-3" />
                              <span>Check-Out</span>
                            </button>
                          )}

                          {isCompleted && (
                            <span className="text-moss text-[11px] font-medium flex items-center gap-1 bg-[#F5F2EB] px-2 py-0.5 rounded-xs">
                              <CheckCircle className="w-3 h-3 text-emerald-700" />
                              <span>Selesai</span>
                            </span>
                          )}

                          <button
                            onClick={() => setActiveDossier(b)}
                            className="p-1 text-moss hover:text-primary hover:bg-line/50 rounded-xs"
                            title="Lihat Berkas Rekam Medis"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dossier Detail Modal */}
      {activeDossier && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-primary max-w-lg w-full p-6 rounded-sm shadow-stamp">
            <div className="flex justify-between items-start border-b border-line pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta">
                  Medical & Care Dossier
                </span>
                <h3 className="font-serif text-xl font-medium text-primary">
                  {activeDossier.bookingCode} — {activeDossier.roomId?.roomNumber}
                </h3>
              </div>
              <button
                onClick={() => setActiveDossier(null)}
                className="text-moss hover:text-primary font-bold text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-[#FAF8F3] p-3 rounded-xs border border-line">
                <span className="text-[10px] uppercase font-semibold text-moss block">Tamu Hewan:</span>
                <span className="font-bold text-pine text-sm">
                  {activeDossier.petIds?.[0]?.name} ({activeDossier.petIds?.[0]?.breed})
                </span>
                <span className="block text-moss mt-0.5">
                  Bobot: {activeDossier.petIds?.[0]?.weightKg || '-'} kg
                </span>
              </div>

              <div>
                <span className="font-semibold text-primary block mb-1">Barang Bawaan Terdaftar:</span>
                <ul className="list-disc list-inside text-moss space-y-0.5">
                  {(activeDossier.intakeChecklist?.belongingsReceived || []).length > 0 ? (
                    activeDossier.intakeChecklist.belongingsReceived.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))
                  ) : (
                    <li>Tidak ada barang bawaan terdaftar.</li>
                  )}
                </ul>
              </div>

              <div className="border-t border-line pt-3">
                <span className="font-semibold text-primary block mb-1">
                  Kontak Darurat Paravet:
                </span>
                <div className="flex items-center gap-2 text-moss">
                  <Phone className="w-3.5 h-3.5 text-terracotta" />
                  <span>RS Hewan Terdaftar: +62-21-555-0199 (Siaga 24 Jam)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-line text-right">
              <button
                onClick={() => setActiveDossier(null)}
                className="px-4 py-1.5 bg-primary text-white text-xs rounded-xs"
              >
                Tutup Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
