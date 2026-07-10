'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import Navbar from '@/components/Navbar';
import RoomFilter from '@/components/rooms/RoomFilter';
import RoomCard from '@/components/rooms/RoomCard';
import CompareModal from '@/components/rooms/CompareModal';
import { useRooms } from '@/store/useRooms';
import { useFilters } from '@/store/useFilters';
import { useCompare } from '@/store/useCompare';
import { SlidersHorizontal, Scale, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RoomCardSkeletonGrid } from '@/components/ui/Skeleton';

export default function RoomsPage() {
  const { rooms } = useRooms();
  const { compareIds, clearCompare } = useCompare();
  const {
    search,
    type,
    maxPrice,
    amenities,
    sortBy,
    branchId,
    setFilter,
    resetFilters
  } = useFilters();

  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // Giả lập số lượng hiển thị (Load More)
  const [visibleCount, setVisibleCount] = useState(8);
  const [isFiltering, setIsFiltering] = useState(false);

  // Bộ lọc dữ liệu phía Client
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        // 1. Lọc theo từ khóa tìm kiếm
        if (search.trim()) {
          const query = search.toLowerCase();
          const matchTitle = room.title.toLowerCase().includes(query);
          const matchDesc = room.description.toLowerCase().includes(query);
          const matchAddr = room.address.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchAddr) return false;
        }

        // 2. Lọc theo chi nhánh
        if (branchId !== 'all' && room.branchId !== branchId) return false;

        // 3. Lọc theo loại phòng
        if (type !== 'all' && room.type !== type) return false;

        // 4. Lọc theo khoảng giá
        if (room.price > maxPrice) return false;

        // 5. Lọc theo tiện ích (phòng phải có ĐỦ tất cả tiện ích được check)
        if (amenities.length > 0) {
          const hasAllAmenities = amenities.every((amenity) =>
            room.amenities.includes(amenity)
          );
          if (!hasAllAmenities) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sắp xếp
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'price-asc') {
          return a.price - b.price;
        }
        if (sortBy === 'price-desc') {
          return b.price - a.price;
        }
        if (sortBy === 'rating-desc') {
          return b.rating - a.rating;
        }
        return 0;
      });
  }, [rooms, search, type, maxPrice, amenities, sortBy, branchId]);

  // P4: Skeleton loading khi filter thay đổi
  useEffect(() => {
    setIsFiltering(true);
    const t = setTimeout(() => setIsFiltering(false), 180);
    return () => clearTimeout(t);
  }, [search, type, maxPrice, amenities, sortBy, branchId]);

  // Reset số lượng hiển thị khi thay đổi bộ lọc
  React.useEffect(() => {
    setVisibleCount(8);
  }, [search, type, maxPrice, amenities, sortBy, branchId]);

  const displayedRooms = filteredRooms.slice(0, visibleCount);

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 lg:py-10">
        {/* Đường dẫn & Sắp xếp đầu trang */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-border/40 pb-5">
          <div>
            <h1 className="text-xl md:text-3xl font-black text-foreground tracking-tight">Tìm Phòng Cư Trú</h1>
            <p className="text-xs text-muted-foreground font-semibold mt-1">
              Hệ thống tìm thấy <span className="text-primary font-extrabold">{filteredRooms.length}</span> phòng trống phù hợp.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Nút lọc cho mobile */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex-1 h-10.5 px-4 border border-border rounded-xl bg-card text-xs font-bold text-foreground flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <SlidersHorizontal size={14} className="text-primary" />
              Bộ lọc
            </button>

            {/* Sắp xếp */}
            <div className="flex items-center gap-2 flex-1 md:flex-none">
              <span className="hidden md:inline-flex text-[10px] font-black text-muted-foreground uppercase tracking-wider items-center gap-1">
                <ArrowUpDown size={11} className="text-primary" />
                Sắp xếp
              </span>
              <select
                value={sortBy}
                onChange={(e) => setFilter({ sortBy: e.target.value as any })}
                className="h-10.5 w-full md:w-48 px-3.5 text-xs font-bold rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-sm"
              >
                <option value="newest">Phòng mới đăng</option>
                <option value="price-asc">Giá từ thấp đến cao</option>
                <option value="price-desc">Giá từ cao đến thấp</option>
                <option value="rating-desc">Đánh giá tốt nhất</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI: BỘ LỌC (DESKTOP) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-20">
            <RoomFilter />
          </aside>

          {/* BỘ LỌC MOBILE (COLLAPSIBLE) */}
          {showMobileFilters && (
            <div className="lg:hidden w-full mb-6">
              <RoomFilter />
            </div>
          )}

          {/* CỘT PHẢI: LƯỚI CARD PHÒNG */}
          <div className="lg:col-span-9 flex flex-col gap-8">
            {/* P4: Skeleton loading khi đang filter */}
            {isFiltering ? (
              <RoomCardSkeletonGrid count={Math.min(visibleCount, 6)} />
            ) : filteredRooms.length === 0 ? (
              /* EMPTY STATE */
              <div className="flex flex-col items-center justify-center text-center py-16 px-4 glass-card border border-border rounded-2xl shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 glow-shadow-primary animate-pulse">
                  <SlidersHorizontal size={22} />
                </div>
                <h3 className="text-base font-extrabold text-foreground">Không tìm thấy phòng phù hợp</h3>
                <p className="text-xs md:text-sm text-muted-foreground max-w-sm mt-2 font-semibold leading-relaxed">
                  Chúng tôi không tìm thấy phòng trống nào khớp với các bộ lọc bạn đã chọn. Hãy thử chọn chi nhánh khác hoặc bớt một số tiện ích đi nhé.
                </p>
                <div className="flex gap-3 mt-6">
                  <Button onClick={resetFilters} variant="outline" size="sm" className="font-extrabold text-xs">
                    Xóa bộ lọc
                  </Button>
                  <Button
                    onClick={() => setFilter({ search: '', branchId: 'all', type: 'all', maxPrice: 8000000, amenities: [] })}
                    size="sm"
                    className="font-extrabold text-xs glow-shadow-primary"
                  >
                    Xem tất cả phòng
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Lưới thẻ phòng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6.5">
                  {displayedRooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>

                {/* Tải thêm phòng */}
                {visibleCount < filteredRooms.length && (
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={() => setVisibleCount((prev) => prev + 6)}
                      variant="outline"
                      className="px-8 font-extrabold text-xs rounded-xl"
                    >
                      Xem thêm phòng trống
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* THANH FLOATING BÁO SO SÁNH */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg bg-card/90 backdrop-blur-xl border border-primary/60 p-3 rounded-full shadow-2xl flex items-center justify-between gap-4 animate-bounce-short">
          <div className="flex items-center gap-2.5 pl-3">
            <Scale className="text-primary animate-pulse" size={16} />
            <span className="text-xs font-bold text-foreground">
              Đang chọn <span className="text-primary font-black">{compareIds.length}</span> phòng để so sánh
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="p-2 text-muted-foreground hover:text-rose-500 rounded-full hover:bg-muted/65 transition-colors cursor-pointer"
              title="Xóa lựa chọn"
            >
              <Trash2 size={15} />
            </button>
            <Button
              onClick={() => setIsCompareOpen(true)}
              size="sm"
              className="rounded-full text-xs font-extrabold px-4.5 h-8.5 glow-shadow-primary"
            >
              So Sánh
            </Button>
          </div>
        </div>
      )}

      {/* MODAL SO SÁNH PHÒNG */}
      <CompareModal isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} />
    </div>
  );
}
