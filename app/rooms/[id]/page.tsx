'use client';

import React, { useState, use, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import {
  Wifi,
  Wind,
  Layers,
  Bike,
  Clock,
  Utensils,
  Sun,
  Shield,
  Star,
  MapPin,
  Maximize,
  Users,
  MessageSquare,
  Phone,
  Calendar,
  Info,
  ChevronLeft,
  Tv,
  Refrigerator,
  Compass,
  DollarSign
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ChatModal from '@/components/rooms/ChatModal';
import { useAuth } from '@/store/useAuth';
import { useRooms } from '@/store/useRooms';
import { useBookings } from '@/store/useBookings';
import { useToasts } from '@/store/useToasts';
import { branches } from '@/data/branches';
import { users } from '@/data/users';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';

// Import Room3DView dynamically to prevent SSR issues with three.js Canvas
const Room3DView = dynamic(() => import('@/components/rooms/Room3DView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-card/30 border border-border/40 rounded-2xl flex items-center justify-center animate-pulse shadow-sm">
      <p className="text-xs text-muted-foreground font-black tracking-widest uppercase">Đang tải mô hình 3D...</p>
    </div>
  )
});

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: roomId } = use(params);
  const { currentUser } = useAuth();
  const { rooms, reviews, addReview } = useRooms();
  const { addBooking } = useBookings();
  const { addToast } = useToasts();

  const room = rooms.find((r) => r.id === roomId);
  
  // Lấy chi nhánh và quản lý chi nhánh tương ứng
  const branch = room ? branches.find((b) => b.id === room.branchId) : null;
  // Fallback landlord cho chat modal
  const landlord = room ? users.find((u) => u.id === room.landlordId) : null;

  // States
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'photos' | '3d'>('photos');

  // Form đặt lịch/giữ chỗ
  const [bookingType, setBookingType] = useState<'viewing' | 'deposit'>('viewing');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNote, setBookingNote] = useState('');

  // Form viết review
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (!room || !branch || !landlord) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
          <Info size={48} className="text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground">Không tìm thấy phòng trọ</h2>
          <p className="text-xs text-muted-foreground mt-1">Phòng trọ này không tồn tại hoặc đã bị xóa.</p>
          <Link href="/rooms" className="mt-4">
            <Button size="sm">Quay lại danh sách phòng</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Danh sách đánh giá của phòng này
  const roomReviews = reviews.filter((r) => r.roomId === room.id);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' đ';
  };

  // Map tiện ích từ ID sang Icon & Label
  const amenityMap: Record<string, { icon: React.ReactNode; label: string }> = {
    wifi: { icon: <Wifi size={16} />, label: 'Wifi tốc độ cao' },
    'dieu-hoa': { icon: <Wind size={16} />, label: 'Điều hòa/Máy lạnh' },
    'gac-lung': { icon: <Layers size={16} />, label: 'Gác lửng đúc' },
    'xe-may': { icon: <Bike size={16} />, label: 'Chỗ để xe máy' },
    'gio-tu-do': { icon: <Clock size={16} />, label: 'Giờ giấc tự do' },
    bep: { icon: <Utensils size={16} />, label: 'Bếp nấu ăn riêng' },
    'may-giat': { icon: <Layers size={16} />, label: 'Máy giặt' },
    'tu-lanh': { icon: <Refrigerator size={16} />, label: 'Tủ lạnh' },
    'tu-quan-ao': { icon: <Tv size={16} />, label: 'Tủ quần áo' },
    'ban-cong': { icon: <Sun size={16} />, label: 'Ban công rộng' },
    'bao-ve': { icon: <Shield size={16} />, label: 'Bảo vệ an ninh 24/7' },
  };

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'tenant') {
      addToast('Vui lòng chọn vai trò Người Thuê để đặt lịch!', 'error');
      return;
    }
    if (!bookingDate || !bookingTime) {
      addToast('Vui lòng chọn ngày và giờ hẹn đầy đủ!', 'error');
      return;
    }

    const bookingId = `book-${Date.now()}`;
    addBooking({
      id: bookingId,
      roomId: room.id,
      tenantId: currentUser.id,
      landlordId: room.landlordId, // Quản lý chung
      bookingDate,
      bookingTime,
      type: bookingType,
      status: 'pending',
      price: bookingType === 'deposit' ? room.price : 0,
      note: bookingNote,
    });

    // Bắn pháo hoa ăn mừng thành công!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    setIsSuccessModalOpen(true);
  };

  const handleReviewSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'tenant') {
      addToast('Vui lòng đóng vai Người Thuê để viết đánh giá!', 'error');
      return;
    }
    if (!reviewComment.trim()) {
      addToast('Vui lòng viết bình luận đánh giá!', 'error');
      return;
    }

    addReview({
      id: `rev-${Date.now()}`,
      roomId: room.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      rating: reviewRating,
      comment: reviewComment.trim(),
      date: new Date().toISOString().split('T')[0],
    });

    addToast('Đã gửi đánh giá thành công!', 'success');
    setReviewComment('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 lg:py-10">
        {/* Nút quay lại */}
        <Link href="/rooms" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-muted-foreground hover:text-primary mb-6 transition-colors uppercase tracking-wider">
          <ChevronLeft size={15} className="text-primary" />
          Quay lại danh sách phòng
        </Link>

        {/* Tiêu đề chính */}
        <div className="flex flex-col gap-2.5 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default" className="w-fit text-[9px] py-0.5 px-2">
              {room.type === 'phong-tro' ? 'Phòng trọ' : room.type === 'chung-cu-mini' ? 'Chung cư mini' : 'Ở ghép / KTX'}
            </Badge>
            <Badge variant="outline" className="w-fit text-[9px] py-0.5 px-2 border-primary/20 text-primary bg-primary/5">
              Đánh giá: {room.rating} ★
            </Badge>
            <Badge variant="secondary" className="w-fit text-[9px] py-0.5 px-2 text-muted-foreground bg-muted/60">
              {branch.name}
            </Badge>
          </div>
          <h1 className="text-xl md:text-3xl font-black text-foreground leading-tight tracking-tight">
            {room.title}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <MapPin size={13} className="text-primary flex-shrink-0" />
            <span>{room.address}</span>
          </div>
        </div>

        {/* Lựa chọn chế độ xem hình ảnh / 3D */}
        <div className="flex border-b border-border/40 mb-6 gap-2">
          <button
            onClick={() => setViewMode('photos')}
            className={`px-4.5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              viewMode === 'photos'
                ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Ảnh chụp thực tế
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-4.5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              viewMode === '3d'
                ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Mô phỏng 3D tương tác
          </button>
        </div>

        {viewMode === 'photos' ? (
          /* BỐ CỤC HÌNH ẢNH (GALLERY) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4.5 mb-10">
            {/* Ảnh to bên trái */}
            <div className="lg:col-span-8 aspect-[16/10] bg-muted rounded-2xl overflow-hidden border border-border/80 relative shadow-sm">
              <img
                src={room.images[activeImgIndex]}
                alt={room.title}
                onClick={() => setIsLightboxOpen(true)}
                className="w-full h-full object-cover cursor-zoom-in hover:scale-[1.01] transition-transform duration-500"
              />
            </div>

            {/* Cột ảnh nhỏ bên phải */}
            <div className="lg:col-span-4 grid grid-cols-4 lg:grid-cols-2 gap-3.5 h-full">
              {room.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer shadow-sm ${
                    activeImgIndex === idx ? 'border-primary scale-[0.98] ring-2 ring-primary/20' : 'border-border/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* MÔ PHỎNG 3D THEO PHÒNG */
          <div className="mb-10 w-full animate-fade-in">
            <Room3DView room={room} />
          </div>
        )}

        {/* CHI TIẾT THÔNG TIN PHÒNG TRỌ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8.5 items-start">
          {/* CỘT TRÁI: CHI TIẾT (8 Cột) */}
          <div className="lg:col-span-8 flex flex-col gap-9">
            {/* Box Thông số cơ bản */}
            <div className="grid grid-cols-3 gap-4 glass-card p-5.5 rounded-2xl shadow-sm">
              <div className="flex flex-col items-center justify-center text-center p-1.5 border-r border-border/55">
                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider mb-1">Giá thuê</span>
                <span className="text-base md:text-lg font-black text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{formatPrice(room.price)}</span>
                <span className="text-[10px] text-muted-foreground font-semibold">/ tháng</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-1.5 border-r border-border/55">
                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider mb-1">Diện tích</span>
                <span className="text-base md:text-lg font-black text-foreground">{room.area} m²</span>
                <span className="text-[10px] text-muted-foreground font-semibold">Không gian</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-1.5">
                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider mb-1">Số người</span>
                <span className="text-base md:text-lg font-black text-foreground">Tối đa {room.maxTenants}</span>
                <span className="text-[10px] text-muted-foreground font-semibold">người ở</span>
              </div>
            </div>

            {/* Tiện ích phòng trọ */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base md:text-lg font-extrabold text-foreground tracking-tight">Tiện ích đi kèm</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {room.amenities.map((item) => {
                  const data = amenityMap[item] || { icon: <Info size={16} />, label: item };
                  return (
                    <div
                      key={item}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-border/80 bg-card shadow-sm text-xs font-bold text-foreground"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        {data.icon}
                      </div>
                      <span className="text-foreground/90">{data.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mô tả chi tiết */}
            <div className="flex flex-col gap-3">
              <h3 className="text-base md:text-lg font-extrabold text-foreground tracking-tight">Mô tả phòng</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-semibold">
                {room.description}
              </p>
            </div>

            {/* BẢN ĐỒ VỊ TRÍ MOCK */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base md:text-lg font-extrabold text-foreground tracking-tight">Bản đồ vị trí (Khu vực)</h3>
              <div className="h-68 bg-muted/20 border border-border/80 rounded-2xl overflow-hidden relative flex items-center justify-center">
                {/* Decorative Grid Lines */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center animate-ping" />
                  <MapPin className="text-primary -mt-6" size={28} />
                  <div className="bg-background/95 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-border/80 shadow-md mt-1.5 whitespace-nowrap text-foreground">
                    {room.district}, {room.city}
                  </div>
                </div>
                {/* Zoom controls decorative */}
                <div className="absolute right-4 bottom-4 flex flex-col gap-1 z-10">
                  <button className="w-8 h-8 rounded-lg bg-card border border-border/80 flex items-center justify-center font-bold text-foreground text-sm shadow-sm cursor-pointer hover:bg-muted">+</button>
                  <button className="w-8 h-8 rounded-lg bg-card border border-border/80 flex items-center justify-center font-bold text-foreground text-sm shadow-sm cursor-pointer hover:bg-muted">-</button>
                </div>
                <span className="absolute bottom-2 left-4 text-[10px] text-muted-foreground/80 font-bold">Bản đồ mô phỏng địa giới hành chính</span>
              </div>
            </div>

            {/* THÔNG TIN CHỦ TRỌ & CHAT */}
            <div className="p-6 border border-border/80 rounded-2xl bg-card shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <img
                  src={landlord.avatar}
                  alt={branch.managerName}
                  className="w-13.5 h-13.5 rounded-full object-cover border border-primary/25 shadow-sm"
                />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-black uppercase tracking-wider">Quản lý chi nhánh</span>
                  <span className="text-sm font-extrabold text-foreground mt-0.5">{branch.managerName}</span>
                  <span className="text-xs text-muted-foreground mt-0.5 font-semibold">Đại diện vận hành: {branch.name}</span>
                </div>
              </div>
              
              <div className="flex gap-2.5 w-full sm:w-auto">
                <Button
                  onClick={() => {
                    if (!currentUser) {
                      addToast('Vui lòng chọn vai trò Người Thuê để nhắn tin với ban quản lý!', 'error');
                      return;
                    }
                    setIsChatOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-extrabold rounded-xl"
                >
                  <MessageSquare size={15} />
                  Nhắn tin
                </Button>
                <a href={`tel:${branch.managerPhone}`} className="flex-1 sm:flex-none">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-extrabold rounded-xl"
                  >
                    <Phone size={15} />
                    {branch.managerPhone}
                  </Button>
                </a>
              </div>
            </div>

            {/* MỤC ĐÁNH GIÁ (REVIEWS) */}
            <div className="flex flex-col gap-6 border-t border-border/40 pt-8.5">
              <h3 className="text-base md:text-lg font-extrabold text-foreground tracking-tight">
                Đánh giá từ cư dân ({roomReviews.length})
              </h3>
              
              {/* Form gửi Đánh giá mới */}
              {currentUser?.role === 'tenant' && (
                <form onSubmit={handleReviewSubmit} className="p-5 bg-muted/10 rounded-2xl border border-border/80 flex flex-col gap-3.5">
                  <span className="text-xs font-bold text-foreground">Viết đánh giá của bạn:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Số sao:</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-amber-500 cursor-pointer hover:scale-110 active:scale-95 transition-all"
                        >
                          <Star size={18} className={reviewRating >= star ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Nhập nhận xét của bạn về chất lượng phòng, không gian sinh hoạt chi nhánh..."
                    rows={3}
                    className="w-full p-3 rounded-xl border border-border bg-background/50 text-xs md:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                  />
                  <Button type="submit" size="sm" className="w-fit self-end font-extrabold text-xs rounded-xl shadow-md glow-shadow-primary">
                    Gửi đánh giá
                  </Button>
                </form>
              )}

              {/* Danh sách review cũ */}
              {roomReviews.length === 0 ? (
                <p className="text-xs font-semibold text-muted-foreground text-center py-8">Chưa có đánh giá nào cho phòng này.</p>
              ) : (
                <div className="space-y-4">
                  {roomReviews.map((rev) => (
                    <div key={rev.id} className="p-4.5 rounded-2xl border border-border/80 bg-card flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.userAvatar}
                            alt={rev.userName}
                            className="w-8.5 h-8.5 rounded-full object-cover border border-border"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-foreground">{rev.userName}</span>
                            <span className="text-[10px] text-muted-foreground font-semibold">{rev.date}</span>
                          </div>
                        </div>
                        <div className="flex gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < rev.rating ? 'fill-amber-500' : 'text-muted/30'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs md:text-sm font-semibold text-muted-foreground pl-1 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: FORM ĐẶT LỊCH (4 Cột) */}
          <div className="lg:col-span-4 sticky top-20">
            <div className="p-5.5 border border-border/80 rounded-2xl bg-card shadow-lg flex flex-col gap-5.5 glass-card">
              <div>
                <h3 className="text-base font-black text-foreground tracking-tight">Đặt Hẹn & Giữ Chỗ</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-bold">
                  Chọn hình thức phù hợp để gửi yêu cầu tới ban quản lý HomieStay.
                </p>
              </div>

              {/* Chọn loại đặt lịch */}
              <div className="grid grid-cols-2 gap-1.5 bg-muted/35 p-1 rounded-xl border border-border/80">
                <button
                  type="button"
                  onClick={() => setBookingType('viewing')}
                  className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer border ${
                    bookingType === 'viewing'
                      ? 'bg-card text-primary shadow-sm border-border/60'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                  }`}
                >
                  Hẹn xem phòng
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType('deposit')}
                  className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer border ${
                    bookingType === 'deposit'
                      ? 'bg-card text-primary shadow-sm border-border/60'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                  }`}
                >
                  Giữ chỗ đặt cọc
                </button>
              </div>

              {/* Chi tiết form đặt lịch */}
              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Calendar size={12} className="text-primary" />
                    Ngày hẹn gặp
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="h-10.5 w-full px-3.5 text-xs font-bold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Clock size={12} className="text-primary" />
                    Khung giờ hẹn
                  </label>
                  <select
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="h-10.5 w-full px-3.5 text-xs font-bold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-sm"
                  >
                    <option value="">Chọn giờ xem phòng</option>
                    <option value="09:00 - 11:00">09:00 - 11:00 Sáng</option>
                    <option value="14:00 - 16:30">14:00 - 16:30 Chiều</option>
                    <option value="17:00 - 19:00">17:00 - 19:00 Tối</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Compass size={12} className="text-primary" />
                    Ghi chú lời nhắn
                  </label>
                  <textarea
                    value={bookingNote}
                    onChange={(e) => setBookingNote(e.target.value)}
                    placeholder="Mô tả cụ thể yêu cầu của bạn (số điện thoại liên hệ phụ, thời gian cụ thể dọn vào, v.v.)..."
                    rows={3.5}
                    className="w-full p-3.5 rounded-xl border border-border bg-background text-xs font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/25 text-foreground shadow-sm"
                  />
                </div>

                {bookingType === 'deposit' && (
                  <div className="p-3.5 bg-primary/10 border border-primary/25 rounded-xl flex flex-col gap-1 shadow-sm">
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-primary">
                      <DollarSign size={12} />
                      Thông tin cọc giữ phòng
                    </div>
                    <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
                      Đặt cọc giữ phòng tương đương với 1 tháng tiền nhà: <span className="font-extrabold text-primary">{room.price.toLocaleString('vi-VN')} đ</span>. Số tiền này sẽ được chuyển vào tài khoản hệ thống co-living bảo chứng.
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full font-extrabold text-xs h-11 rounded-xl shadow-md glow-shadow-primary mt-2">
                  {bookingType === 'deposit' ? 'Xác nhận cọc giữ phòng' : 'Gửi yêu cầu lịch hẹn'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL LIGHTBOX XEM ẢNH FULLSCREEN */}
      <Dialog isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} title="Xem chi tiết ảnh" size="xl">
        <div className="relative aspect-[16/10] w-full bg-black rounded-xl overflow-hidden">
          <img
            src={room.images[activeImgIndex]}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      </Dialog>

      {/* MODAL SUCCESS ĐẶT LỊCH THÀNH CÔNG */}
      <Dialog isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="Đăng Ký Thành Công!" size="md">
        <div className="flex flex-col items-center justify-center text-center p-4.5">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mb-4">
            <CheckCircleIcon size={30} />
          </div>
          <h4 className="text-base font-black text-foreground">
            Gửi yêu cầu {bookingType === 'deposit' ? 'cọc giữ phòng' : 'lịch hẹn xem phòng'} thành công!
          </h4>
          <p className="text-xs text-muted-foreground font-semibold mt-2.5 max-w-sm leading-relaxed">
            Yêu cầu của bạn đã được chuyển tới quản lý chi nhánh <span className="font-extrabold text-foreground">{branch.managerName}</span>. Bạn có thể kiểm tra trạng thái tại trang cá nhân.
          </p>
          <div className="flex gap-3 w-full mt-6.5">
            <Button
              onClick={() => {
                setIsSuccessModalOpen(false);
                router.push('/account?tab=bookings');
              }}
              className="flex-1 font-extrabold text-xs rounded-xl"
            >
              Xem lịch sử
            </Button>
            <Button
              onClick={() => setIsSuccessModalOpen(false)}
              variant="outline"
              className="flex-1 font-extrabold text-xs rounded-xl"
            >
              Đóng
            </Button>
          </div>
        </div>
      </Dialog>

      {/* CHAT MODAL NỔI */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        roomId={room.id}
        landlordId={room.landlordId}
      />

      {/* FOOTER */}
      <footer className="bg-card border-t border-border/40 py-6.5 text-center text-xs text-muted-foreground font-semibold mt-16">
        <div className="container mx-auto px-4">
          <span>HomieStay © 2026. Cổng Thông Tin & Quản Lý Căn Hộ HomieStay Co-living.</span>
        </div>
      </footer>
    </div>
  );
}

function CheckCircleIcon({ size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}
