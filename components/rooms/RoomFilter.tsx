'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFilters } from '../../store/useFilters';
import { branches } from '../../data/branches';
import { Search, MapPin, BadgeDollarSign, SlidersHorizontal, RotateCcw, Home, Sparkles } from 'lucide-react';
import { debounce } from '@/lib/utils';

export default function RoomFilter() {
  const {
    search,
    type,
    maxPrice,
    amenities,
    branchId,
    setFilter,
    resetFilters,
  } = useFilters();

  // P1: Local state for search to debounce
  const [localSearch, setLocalSearch] = useState(search);

  // Sync localSearch if external filter resets
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounced setFilter for search — 300ms
  const debouncedSetSearch = useMemo(
    () => debounce((...args: unknown[]) => setFilter({ search: args[0] as string }), 300),
    [setFilter]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    debouncedSetSearch(val);
  }, [debouncedSetSearch]);

  const handleAmenityChange = (amenityId: string) => {
    const isSelected = amenities.includes(amenityId);
    const updated = isSelected
      ? amenities.filter((id) => id !== amenityId)
      : [...amenities, amenityId];
    setFilter({ amenities: updated });
  };

  const formatPrice = (price: number) => {
    return (price / 1000000).toFixed(1).replace('.0', '') + ' triệu';
  };

  const amenitiesList = [
    { id: 'wifi', name: 'Wifi tốc độ cao' },
    { id: 'dieu-hoa', name: 'Máy lạnh/Điều hòa' },
    { id: 'gac-lung', name: 'Gác lửng' },
    { id: 'xe-may', name: 'Chỗ để xe máy' },
    { id: 'gio-tu-do', name: 'Giờ giấc tự do' },
    { id: 'bep', name: 'Bếp nấu ăn' },
    { id: 'may-giat', name: 'Máy giặt' },
    { id: 'tu-lanh', name: 'Tủ lạnh' },
    { id: 'tu-quan-ao', name: 'Tủ quần áo' },
    { id: 'ban-cong', name: 'Ban công thoáng' },
    { id: 'bao-ve', name: 'Bảo vệ an ninh' }
  ];

  return (
    <div className="w-full flex flex-col gap-5.5 glass-card p-5.5 rounded-2xl shadow-md">
      {/* Tiêu đề lọc */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-primary" />
          <h3 className="font-extrabold text-foreground text-xs uppercase tracking-wider">Bộ lọc phòng trống</h3>
        </div>
        <button
          onClick={() => { resetFilters(); setLocalSearch(''); }}
          className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors font-black uppercase tracking-wider cursor-pointer"
        >
          <RotateCcw size={11} />
          Đặt lại
        </button>
      </div>

      {/* Tìm kiếm từ khóa — P1: debounced */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Tìm kiếm phòng:</label>
        <div className="relative">
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            placeholder="Nhập số phòng, mô tả..."
            className="w-full h-10.5 pl-9.5 pr-3.5 rounded-xl border border-border bg-background/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all text-foreground"
          />
          <Search className="absolute left-3.5 top-3.5 text-muted-foreground/60" size={14} />
        </div>
      </div>

      {/* Chọn Chi Nhánh */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <MapPin size={11} className="text-primary" />
          Chi nhánh HomieStay:
        </label>
        <select
          value={branchId}
          onChange={(e) => setFilter({ branchId: e.target.value })}
          className="w-full h-10.5 px-3 rounded-xl border border-border bg-background/50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/25 text-foreground cursor-pointer"
        >
          <option value="all">Tất cả chi nhánh</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Loại phòng */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Home size={11} className="text-primary" />
          Loại hình phòng:
        </label>
        <select
          value={type}
          onChange={(e) => {
            const val = e.target.value as 'all' | 'phong-tro' | 'chung-cu-mini' | 'o-ghep';
            setFilter({ type: val });
          }}
          className="w-full h-10.5 px-3 rounded-xl border border-border bg-background/50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/25 text-foreground cursor-pointer"
        >
          <option value="all">Tất cả loại hình</option>
          <option value="phong-tro">Phòng đơn gác lửng</option>
          <option value="chung-cu-mini">Căn hộ Studio</option>
          <option value="o-ghep">KTX giường tầng</option>
        </select>
      </div>

      {/* Giá thuê tối đa */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <BadgeDollarSign size={11} className="text-primary" />
            Ngân sách tối đa
          </label>
          <span className="text-xs font-extrabold text-primary">{formatPrice(maxPrice)}</span>
        </div>
        <input
          type="range"
          min={1500000}
          max={8000000}
          step={200000}
          value={maxPrice}
          onChange={(e) => setFilter({ maxPrice: Number(e.target.value) })}
          className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[9px] text-muted-foreground/80 font-bold mt-0.5">
          <span>1.5 Tr</span>
          <span>5.0 Tr</span>
          <span>8.0 Tr</span>
        </div>

        {/* Nút chọn nhanh giá */}
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          {[
            { label: 'Dưới 2.5Tr', max: 2500000 },
            { label: 'Dưới 4.0Tr', max: 4000000 },
            { label: 'Dưới 6.0Tr', max: 6000000 },
            { label: 'Dưới 8.0Tr', max: 8000000 }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setFilter({ maxPrice: item.max })}
              className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                maxPrice === item.max
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-background/40 border-border/80 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tiện ích phòng trọ */}
      <div className="flex flex-col gap-2.5">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Sparkles size={11} className="text-primary" />
          Tiện ích bao gồm:
        </label>
        <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
          {amenitiesList.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer select-none py-0.5 hover:text-primary transition-colors"
            >
              <input
                type="checkbox"
                checked={amenities.includes(item.id)}
                onChange={() => handleAmenityChange(item.id)}
                className="w-4 h-4 rounded-md border-border/80 text-primary focus:ring-primary/20 accent-primary cursor-pointer transition-all"
              />
              <span className="text-xs font-semibold text-foreground/90">{item.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
