'use client';

import React from 'react';
import { useCompare } from '../../store/useCompare';
import { useRooms } from '../../store/useRooms';
import { useToasts } from '../../store/useToasts';
import { X, Check, Scale } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/Button';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CompareModal({ isOpen, onClose }: CompareModalProps) {
  const { compareIds, toggleCompare, clearCompare } = useCompare();
  const { rooms } = useRooms();
  const { addToast } = useToasts();

  if (!isOpen) return null;

  // Lấy danh sách các phòng được chọn
  const compareRooms = rooms.filter(r => compareIds.includes(r.id));

  const formatPrice = (price: number) => {
    return (price / 1000000).toFixed(1).replace('.0', '') + ' triệu/tháng';
  };

  const amenitiesList = [
    { id: 'wifi', name: 'Wifi tốc độ cao' },
    { id: 'dieu-hoa', name: 'Máy lạnh' },
    { id: 'gac-lung', name: 'Gác lửng' },
    { id: 'xe-may', name: 'Chỗ để xe' },
    { id: 'gio-tu-do', name: 'Giờ giấc tự do' },
    { id: 'bep', name: 'Bếp nấu ăn' },
    { id: 'may-giat', name: 'Máy giặt' },
    { id: 'tu-lanh', name: 'Tủ lạnh' },
    { id: 'tu-quan-ao', name: 'Tủ quần áo' },
    { id: 'ban-cong', name: 'Ban công' },
    { id: 'bao-ve', name: 'Bảo vệ an ninh' }
  ];

  const typeNames = {
    'phong-tro': 'Phòng trọ',
    'chung-cu-mini': 'Chung cư mini',
    'o-ghep': 'Ở ghép / KTX'
  };

  const handleRemove = (roomId: string) => {
    toggleCompare(roomId);
    addToast('Đã xóa phòng khỏi bảng so sánh', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl bg-card rounded-2xl p-6 shadow-2xl border border-border z-10 max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Scale className="text-primary" size={22} />
            <h2 className="text-lg font-bold text-foreground">So sánh chi tiết phòng trọ ({compareRooms.length}/3)</h2>
          </div>
          <div className="flex items-center gap-3">
            {compareRooms.length > 0 && (
              <button
                onClick={clearCompare}
                className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
              >
                Xóa tất cả
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {compareRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Scale size={48} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">Chưa có phòng nào được chọn để so sánh.</p>
            <p className="text-xs text-muted-foreground/80 mt-1">
              Hãy quay lại danh sách phòng và nhấn vào biểu tượng so sánh ở góc từng thẻ phòng.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-3 font-extrabold text-muted-foreground w-1/4">Thông số</th>
                  {compareRooms.map((room) => (
                    <th key={room.id} className="p-3 w-1/4 min-w-[200px]">
                      <div className="flex flex-col gap-2 relative">
                        <button
                          onClick={() => handleRemove(room.id)}
                          className="absolute -top-1 -right-1 p-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer"
                          title="Xóa khỏi so sánh"
                        >
                          <X size={12} />
                        </button>
                        <img
                          src={room.images[0]}
                          alt={room.title}
                          className="w-full aspect-[4/3] object-cover rounded-lg border border-border"
                        />
                        <h4 className="font-bold text-foreground line-clamp-2 leading-tight h-10 mt-1">
                          {room.title}
                        </h4>
                      </div>
                    </th>
                  ))}
                  {/* Fill empty columns if less than 3 rooms selected */}
                  {Array.from({ length: 3 - compareRooms.length }).map((_, idx) => (
                    <th key={`empty-col-${idx}`} className="p-3 w-1/4 min-w-[200px] border border-transparent">
                      <div className="border border-dashed border-border/60 rounded-lg aspect-[4/3] flex flex-col items-center justify-center text-center p-4 bg-muted/10 text-muted-foreground/40">
                        <Scale size={24} className="mb-2" />
                        <span className="text-xs font-semibold">Trống</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody className="divide-y divide-border/60">
                {/* Loại phòng */}
                <tr>
                  <td className="p-3 font-bold text-muted-foreground">Loại hình</td>
                  {compareRooms.map((room) => (
                    <td key={room.id} className="p-3 font-semibold text-foreground">
                      {typeNames[room.type]}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareRooms.length }).map((_, i) => (
                    <td key={i} className="p-3" />
                  ))}
                </tr>

                {/* Giá thuê */}
                <tr>
                  <td className="p-3 font-bold text-muted-foreground">Giá thuê</td>
                  {compareRooms.map((room) => (
                    <td key={room.id} className="p-3 font-extrabold text-primary text-base">
                      {formatPrice(room.price)}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareRooms.length }).map((_, i) => (
                    <td key={i} className="p-3" />
                  ))}
                </tr>

                {/* Diện tích */}
                <tr>
                  <td className="p-3 font-bold text-muted-foreground">Diện tích</td>
                  {compareRooms.map((room) => (
                    <td key={room.id} className="p-3 font-semibold text-foreground">
                      {room.area} m²
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareRooms.length }).map((_, i) => (
                    <td key={i} className="p-3" />
                  ))}
                </tr>

                {/* Số người tối đa */}
                <tr>
                  <td className="p-3 font-bold text-muted-foreground">Số người tối đa</td>
                  {compareRooms.map((room) => (
                    <td key={room.id} className="p-3 text-foreground">
                      {room.maxTenants} người
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareRooms.length }).map((_, i) => (
                    <td key={i} className="p-3" />
                  ))}
                </tr>

                {/* Địa chỉ */}
                <tr>
                  <td className="p-3 font-bold text-muted-foreground">Khu vực</td>
                  {compareRooms.map((room) => (
                    <td key={room.id} className="p-3 text-foreground text-xs">
                      <span className="font-semibold">{room.district}, {room.city}</span>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5" title={room.address}>
                        {room.address}
                      </p>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareRooms.length }).map((_, i) => (
                    <td key={i} className="p-3" />
                  ))}
                </tr>

                {/* Đánh giá */}
                <tr>
                  <td className="p-3 font-bold text-muted-foreground">Đánh giá</td>
                  {compareRooms.map((room) => (
                    <td key={room.id} className="p-3 text-foreground">
                      <div className="flex items-center gap-1 font-bold text-amber-500">
                        <Check className="text-amber-500" size={14} />
                        <span>{room.rating} / 5.0</span>
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareRooms.length }).map((_, i) => (
                    <td key={i} className="p-3" />
                  ))}
                </tr>

                {/* Danh sách Tiện ích chi tiết */}
                <tr className="bg-muted/10">
                  <td className="p-3 font-bold text-muted-foreground text-xs uppercase tracking-wider" colSpan={4}>
                    Tiện ích chi tiết
                  </td>
                </tr>

                {amenitiesList.map((amenity) => (
                  <tr key={amenity.id} className="hover:bg-muted/10">
                    <td className="p-3 text-muted-foreground font-medium pl-6">{amenity.name}</td>
                    {compareRooms.map((room) => {
                      const hasAmenity = room.amenities.includes(amenity.id);
                      return (
                        <td key={room.id} className="p-3">
                          {hasAmenity ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                              <Check size={14} className="stroke-[3]" />
                            </div>
                          ) : (
                            <span className="text-muted-foreground/30 font-semibold">—</span>
                          )}
                        </td>
                      );
                    })}
                    {Array.from({ length: 3 - compareRooms.length }).map((_, i) => (
                      <td key={i} className="p-3" />
                    ))}
                  </tr>
                ))}

                {/* Hành động */}
                <tr>
                  <td className="p-3 font-bold text-muted-foreground">Chi tiết</td>
                  {compareRooms.map((room) => (
                    <td key={room.id} className="p-3">
                      <Link href={`/rooms/${room.id}`} onClick={onClose}>
                        <Button size="sm" className="w-full text-xs font-bold">
                          Xem chi tiết
                        </Button>
                      </Link>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareRooms.length }).map((_, i) => (
                    <td key={i} className="p-3" />
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
