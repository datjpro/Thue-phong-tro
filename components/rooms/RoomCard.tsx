'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Star, ChevronLeft, ChevronRight, MapPin, Maximize, Users, Scale } from 'lucide-react';
import { Room } from '../../data/rooms';
import { useAuth } from '../../store/useAuth';
import { useFavorites } from '../../store/useFavorites';
import { useCompare } from '../../store/useCompare';
import { useToasts } from '../../store/useToasts';
import { Badge } from '../ui/Badge';
import SafeImage from '../ui/SafeImage';
import { formatPriceMillion } from '@/lib/utils';
import { roomTypeNames, statusNames, statusVariants } from '@/lib/constants';

export default function RoomCard({ room }: { room: Room }) {
  const { currentUser } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleCompare, isComparing } = useCompare();
  const { addToast } = useToasts();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const favorited = isFavorite(room.id);
  const comparing = isComparing(room.id);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser || currentUser.role !== 'tenant') {
      addToast('Vui lòng đóng vai Người Thuê để lưu phòng yêu thích!', 'error');
      return;
    }
    toggleFavorite(room.id);
    addToast(favorited ? 'Đã xóa phòng khỏi danh sách yêu thích' : 'Đã thêm phòng vào danh sách yêu thích', 'success');
  }, [currentUser, favorited, room.id, toggleFavorite, addToast]);

  const handleCompareClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(room.id);
    addToast(comparing ? 'Đã bỏ so sánh phòng' : 'Đã thêm phòng vào so sánh (Tối đa 3 phòng)', 'info');
  }, [comparing, room.id, toggleCompare, addToast]);

  const nextImg = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % room.images.length);
  }, [room.images.length]);

  const prevImg = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
  }, [room.images.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex flex-col w-full h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-400 card-glow ${
        comparing ? 'ring-2 ring-primary border-transparent animate-border-glow' : ''
      }`}
    >
      {/* Slider ảnh */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <SafeImage
          src={room.images[currentImgIndex]}
          alt={room.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          loading="lazy"
          decoding="async"
          width={600}
          height={450}
        />

        {/* Gradient overlay bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {/* Nút lướt ảnh */}
        {room.images.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full bg-background/75 hover:bg-background backdrop-blur-md p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 cursor-pointer hover:scale-110 active:scale-95"
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={15} className="text-foreground" />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-background/75 hover:bg-background backdrop-blur-md p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 cursor-pointer hover:scale-110 active:scale-95"
              aria-label="Ảnh tiếp"
            >
              <ChevronRight size={15} className="text-foreground" />
            </button>
          </>
        )}

        {/* Dots chỉ số trang ảnh */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {room.images.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentImgIndex ? 'w-5 bg-primary shadow-sm shadow-primary/50' : 'w-1.5 bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Badge Loại phòng + Trạng thái */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
          <Badge variant="default" className="shadow-md backdrop-blur-md bg-primary/85 border border-primary/20 text-[9px] py-0.5 px-2">
            {roomTypeNames[room.type]}
          </Badge>
          <Badge variant={statusVariants[room.status]} className="shadow-md backdrop-blur-md text-[9px] py-0.5 px-2">
            {statusNames[room.status]}
          </Badge>
        </div>

        {/* Nút yêu thích */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 rounded-full bg-background/75 hover:bg-background backdrop-blur-md p-2 shadow-sm text-muted-foreground hover:text-rose-500 hover:scale-110 active:scale-90 transition-all duration-300 z-10 cursor-pointer border border-border/20"
          title="Yêu thích"
          aria-label={favorited ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
        >
          <Heart
            size={16}
            className={`transition-all duration-300 ${favorited ? 'fill-rose-500 text-rose-500 scale-110' : 'text-foreground'}`}
          />
        </button>

        {/* Nút chọn so sánh */}
        <button
          onClick={handleCompareClick}
          className={`absolute bottom-3 right-3 rounded-full backdrop-blur-md p-2 shadow-sm hover:scale-110 active:scale-90 transition-all duration-300 z-10 cursor-pointer border ${
            comparing
              ? 'bg-primary text-primary-foreground border-primary glow-shadow-primary scale-105'
              : 'bg-background/75 text-muted-foreground hover:text-primary border-border/20'
          }`}
          title="Chọn so sánh"
          aria-label={comparing ? 'Bỏ so sánh' : 'Thêm so sánh'}
        >
          <Scale size={15} />
        </button>
      </div>

      {/* Thông tin phòng */}
      <Link href={`/rooms/${room.id}`} className="flex-1 flex flex-col p-4">
        {/* Tiêu đề */}
        <h3 className="line-clamp-2 text-sm font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight mb-2 h-10">
          {room.title}
        </h3>

        {/* Địa chỉ */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-3 font-semibold">
          <MapPin size={12} className="text-primary flex-shrink-0" />
          <span className="truncate">{room.district}, {room.city}</span>
        </div>

        {/* Thông số phòng (Diện tích, tối đa người) */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/50 pb-3.5 mb-3.5">
          <div className="flex items-center gap-1 font-bold">
            <Maximize size={12} className="text-muted-foreground/80" />
            <span>{room.area} m²</span>
          </div>
          <div className="flex items-center gap-1 font-bold">
            <Users size={12} className="text-muted-foreground/80" />
            <span>Tối đa {room.maxTenants} người</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-amber-500">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            <span>{room.rating}</span>
          </div>
        </div>

        {/* Giá thuê */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Giá thuê</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-black text-gradient">{formatPriceMillion(room.price)}</span>
              <span className="text-[10px] font-bold text-muted-foreground">/ tháng</span>
            </div>
          </div>

          <span className="text-[11px] font-extrabold text-primary group-hover:underline flex items-center gap-0.5 transition-all group-hover:gap-1.5">
            Chi tiết
            <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
