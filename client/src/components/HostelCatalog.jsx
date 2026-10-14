import React, { useState, useMemo } from 'react';
import { ShieldCheck, Video, Wind, Trees, Sparkles, Filter, ChevronRight, Check } from 'lucide-react';

export default function HostelCatalog({ rooms = [], onSelectRoom, selectedRoomId }) {
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedFeature, setSelectedFeature] = useState('all');

  // Extract unique features from rooms
  const allFeatures = useMemo(() => {
    const set = new Set();
    rooms.forEach(r => (r.features || []).forEach(f => set.add(f)));
    return Array.from(set);
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (speciesFilter !== 'all' && !room.allowedSpecies.includes(speciesFilter)) {
        return false;
      }
      if (tierFilter !== 'all' && room.tier.toLowerCase() !== tierFilter.toLowerCase()) {
        return false;
      }
      if (selectedFeature !== 'all' && !(room.features || []).includes(selectedFeature)) {
        return false;
      }
      return true;
    });
  }, [rooms, speciesFilter, tierFilter, selectedFeature]);

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section id="katalog" className="py-8">
      {/* Editorial Header */}
      <div className="border-b border-line pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest text-terracotta uppercase">
            Pavilion & Suite Catalog
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary font-medium mt-1">
            Katalog Kamar & Pavilion
          </h2>
          <p className="text-moss text-sm mt-1 max-w-xl">
            Setiap suite dirancang dengan akustik kedap suara, sirkulasi udara hepa-grade,
            serta zona terpisah antara taring dan felin.
          </p>
        </div>
        <div className="text-xs text-moss flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>{filteredRooms.length} unit tersedia untuk reservasi</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#F8F5EE] border border-line p-4 rounded-sm mb-8 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 text-primary font-medium">
          <Filter className="w-3.5 h-3.5 text-terracotta" />
          <span>Filter:</span>
        </div>

        {/* Species Filter */}
        <div className="flex items-center gap-1 bg-white border border-line rounded-sm p-1">
          <button
            onClick={() => setSpeciesFilter('all')}
            className={`px-3 py-1 rounded-xs transition-colors ${
              speciesFilter === 'all'
                ? 'bg-primary text-white font-medium'
                : 'text-moss hover:text-pine'
            }`}
          >
            Semua Hewan
          </button>
          <button
            onClick={() => setSpeciesFilter('dog')}
            className={`px-3 py-1 rounded-xs transition-colors ${
              speciesFilter === 'dog'
                ? 'bg-primary text-white font-medium'
                : 'text-moss hover:text-pine'
            }`}
          >
            Anjing
          </button>
          <button
            onClick={() => setSpeciesFilter('cat')}
            className={`px-3 py-1 rounded-xs transition-colors ${
              speciesFilter === 'cat'
                ? 'bg-primary text-white font-medium'
                : 'text-moss hover:text-pine'
            }`}
          >
            Kucing
          </button>
        </div>

        {/* Tier Filter */}
        <div className="flex items-center gap-1 bg-white border border-line rounded-sm p-1">
          <button
            onClick={() => setTierFilter('all')}
            className={`px-2.5 py-1 rounded-xs transition-colors ${
              tierFilter === 'all'
                ? 'bg-primary text-white font-medium'
                : 'text-moss hover:text-pine'
            }`}
          >
            Semua Tier
          </button>
          <button
            onClick={() => setTierFilter('Standard')}
            className={`px-2.5 py-1 rounded-xs transition-colors ${
              tierFilter === 'Standard'
                ? 'bg-primary text-white font-medium'
                : 'text-moss hover:text-pine'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setTierFilter('Deluxe Suite')}
            className={`px-2.5 py-1 rounded-xs transition-colors ${
              tierFilter === 'Deluxe Suite'
                ? 'bg-primary text-white font-medium'
                : 'text-moss hover:text-pine'
            }`}
          >
            Deluxe Suite
          </button>
          <button
            onClick={() => setTierFilter('Cat Condo')}
            className={`px-2.5 py-1 rounded-xs transition-colors ${
              tierFilter === 'Cat Condo'
                ? 'bg-primary text-white font-medium'
                : 'text-moss hover:text-pine'
            }`}
          >
            Cat Condo
          </button>
        </div>

        {/* Feature Dropdown */}
        {allFeatures.length > 0 && (
          <select
            value={selectedFeature}
            onChange={(e) => setSelectedFeature(e.target.value)}
            className="bg-white border border-line text-pine px-3 py-1.5 rounded-sm focus:outline-none focus:border-primary"
          >
            <option value="all">Fasilitas Khusus (Semua)</option>
            {allFeatures.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        )}

        {(speciesFilter !== 'all' || tierFilter !== 'all' || selectedFeature !== 'all') && (
          <button
            onClick={() => {
              setSpeciesFilter('all');
              setTierFilter('all');
              setSelectedFeature('all');
            }}
            className="text-terracotta underline ml-auto text-xs"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Grid of Rooms */}
      {filteredRooms.length === 0 ? (
        <div className="border border-dashed border-line p-12 text-center rounded-sm bg-white">
          <p className="text-moss font-serif text-lg">Tidak ada unit yang cocok dengan kriteria filter.</p>
          <button
            onClick={() => {
              setSpeciesFilter('all');
              setTierFilter('all');
              setSelectedFeature('all');
            }}
            className="mt-3 text-xs bg-primary text-white px-4 py-2 rounded-xs"
          >
            Reset Kriteria
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const isSelected = selectedRoomId === room._id;
            return (
              <div
                key={room._id}
                className={`bg-white border rounded-sm transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'border-terracotta ring-1 ring-terracotta shadow-stamp-terracotta'
                    : 'border-line hover:border-primary shadow-subtle hover:shadow-stamp'
                }`}
              >
                <div className="p-5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-line pb-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-[#EFECE6] text-primary px-2 py-0.5 rounded-xs">
                          {room.roomNumber}
                        </span>
                        <span className="text-xs uppercase tracking-wider text-moss font-medium">
                          {room.tier}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl text-primary font-medium mt-1">
                        {room.tier === 'Cat Condo'
                          ? `Feline Botanical Suite ${room.roomNumber}`
                          : room.tier === 'Deluxe Suite'
                          ? `Canine Royal Suite ${room.roomNumber}`
                          : `Private Standard Run ${room.roomNumber}`}
                      </h3>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-moss">Mulai</div>
                      <div className="text-sm font-bold text-terracotta font-mono">
                        {formatIDR(room.pricing.baseRatePerNight)}
                      </div>
                      <div className="text-[10px] text-moss">/ malam</div>
                    </div>
                  </div>

                  {/* Room Specs */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-moss mb-4 bg-[#FAF8F3] p-2.5 rounded-xs border border-line/60">
                    <div>
                      <span className="block text-[10px] uppercase text-pine/60">Kapasitas:</span>
                      <span className="font-medium text-pine">
                        Maks {room.capacity.maxPets} ekor (≤ {room.capacity.maxWeightTotalKg} kg)
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-pine/60">Kategori:</span>
                      <span className="font-medium text-pine capitalize">
                        {room.allowedSpecies.join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Feature Tags */}
                  <div className="space-y-1.5 mb-5">
                    <span className="text-[10px] uppercase tracking-wider text-moss font-semibold block">
                      Spesifikasi Lingkungan:
                    </span>
                    <ul className="space-y-1">
                      {(room.features || []).map((feat, idx) => (
                        <li key={idx} className="text-xs text-pine flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-primary flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-4 bg-[#FAF8F3] border-t border-line mt-auto">
                  <button
                    onClick={() => onSelectRoom(room)}
                    className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xs transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-terracotta text-white shadow-stamp-terracotta'
                        : 'bg-primary text-white hover:bg-primary-hover shadow-stamp'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <span>Suite Terpilih Untuk Pemesanan</span>
                        <Check className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Pilih Suite Ini</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
