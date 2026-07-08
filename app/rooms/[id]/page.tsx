'use client';

import React, { useState, use, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Refrigerator
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ChatModal from '@/components/rooms/ChatModal';
import { useAuth } from '@/store/useAuth';
import { useRooms } from '@/store/useRooms';
import { useBookings } from '@/store/useBookings';
import { useToasts } from '@/store/useToasts';
import { users } from '@/data/users';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: roomId } = use(params);
  const { currentUser } = useAuth();
  const { rooms, reviews, addReview } = useRooms();
  const { addBooking } = useBookings();
  const { addToast } = useToasts();

  const room = rooms.find((r) => r.id === roomId);
  const landlord = room ? users.find((u) => u.id === room.landlordId) : null;

  // States
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Form đặt lịch/giữ chỗ
  const [bookingType, setBookingType] = useState<'viewing' | 'deposit'>('viewing');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNote, setBookingNote] = useState('');

  // Form viết review
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (!room || !landlord) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20 text-center">
          <Info size={48} className="text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground">Không tìm thấy phòng trọ</h2>
          <p className="text-sm text-muted-foreground mt-1">Phòng trọ này không tồn tại hoặc đã bị xóa.</p>
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
      addToast('Vui lòng đăng nhập tài khoản Người Thuê để đặt lịch!', 'error');
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
      landlordId: room.landlordId,
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
      addToast('Vui lòng đăng nhập vai Người Thuê để viết đánh giá!', 'error');
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
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Nút quay lại */}
        <Link href="/rooms" className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ChevronLeft size={16} />
          Quay lại danh sách phòng
        </Link>

        {/* Tiêu đề chính */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default" className="w-fit text-[11px] font-bold">
              {room.type === 'phong-tro' ? 'Phòng trọ' : room.type === 'chung-cu-mini' ? 'Chung cư mini' : 'Ở ghép / KTX'}
            </Badge>
            <Badge variant="outline" className="w-fit text-[11px] font-bold border-emerald-500/20 text-emerald-600 bg-emerald-500/5">
              Rating: {room.rating} ★
            </Badge>
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold text-foreground leading-tight">
            {room.title}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <MapPin size={14} className="text-primary" />
            <span>{room.address}</span>
          </div>
        </div>

        {/* BỐ CỤC HÌNH ẢNH (GALLERY) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
          {/* Ảnh to bên trái */}
          <div className="lg:col-span-8 aspect-[16/10] bg-muted rounded-2xl overflow-hidden border border-border relative">
            <img
              src={room.images[activeImgIndex]}
              alt={room.title}
              onClick={() => setIsLightboxOpen(true)}
              className="w-full h-full object-cover cursor-zoom-in hover:scale-[1.01] transition-transform duration-300"
            />
          </div>

          {/* Cột ảnh nhỏ bên phải */}
          <div className="lg:col-span-4 grid grid-cols-4 lg:grid-cols-2 gap-3 h-full">
            {room.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImgIndex(idx)}
                className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  activeImgIndex === idx ? 'border-primary scale-[0.98]' : 'border-border opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* CHI TIẾT THÔNG TIN PHÒNG TRỌ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI: CHI TIẾT (8 Cột) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Box Thông số cơ bản */}
            <div className="grid grid-cols-3 gap-4 bg-muted/10 p-5 rounded-2xl border border-border/60">
              <div className="flex flex-col items-center justify-center text-center p-2 border-r border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider mb-1">Giá thuê</span>
                <span className="text-sm md:text-base font-extrabold text-primary">{formatPrice(room.price)}</span>
                <span className="text-[10px] text-muted-foreground">/ tháng</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-2 border-r border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider mb-1">Diện tích</span>
                <span className="text-sm md:text-base font-extrabold text-foreground">{room.area} m²</span>
                <span className="text-[10px] text-muted-foreground">Không gian sử dụng</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-2">
                <span className="text-[10px] text-muted-foreground uppercase font-extrabold tracking-wider mb-1">Số người</span>
                <span className="text-sm md:text-base font-extrabold text-foreground">Tối đa {room.maxTenants}</span>
                <span className="text-[10px] text-muted-foreground">người sinh sống</span>
              </div>
            </div>

            {/* Tiện ích phòng trọ */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-foreground">Tiện ích đi kèm</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {room.amenities.map((item) => {
                  const data = amenityMap[item] || { icon: <Info size={16} />, label: item };
                  return (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card shadow-sm text-xs md:text-sm font-semibold text-foreground"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        {data.icon}
                      </div>
                      <span>{data.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mô tả chi tiết */}
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold text-foreground">Mô tả phòng</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-medium">
                {room.description}
              </p>
            </div>

            {/* BẢN ĐỒ VỊ TRÍ MOCK */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-foreground">Bản đồ vị trí (Khu vực)</h3>
              <div className="h-64 bg-muted/20 border border-border rounded-2xl overflow-hidden relative flex items-center justify-center">
                {/* Decorative Grid Lines to make it look like a map */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:20px_20px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center animate-ping" />
                  <MapPin className="text-primary -mt-6" size={28} />
                  <div className="bg-background text-[10px] md:text-xs font-bold px-2 py-1 rounded-md border border-border shadow-md mt-1 whitespace-nowrap text-foreground">
                    {room.district}, {room.city}
                  </div>
                </div>
                {/* Zoom controls decorative */}
                <div className="absolute right-4 bottom-4 flex flex-col gap-1 z-10">
                  <button className="w-8 h-8 rounded-md bg-card border border-border flex items-center justify-center font-bold text-foreground text-sm shadow-sm cursor-pointer hover:bg-muted">+</button>
                  <button className="w-8 h-8 rounded-md bg-card border border-border flex items-center justify-center font-bold text-foreground text-sm shadow-sm cursor-pointer hover:bg-muted">-</button>
                </div>
                <span className="absolute bottom-2 left-4 text-[10px] text-muted-foreground font-semibold">Bản đồ mô phỏng địa giới hành chính</span>
              </div>
            </div>

            {/* THÔNG TIN CHỦ TRỌ & CHAT */}
            <div className="p-5 border border-border rounded-2xl bg-card shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={landlord.avatar}
                  alt={landlord.name}
                  className="w-14 h-14 rounded-full object-cover border border-primary/20"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-foreground">{landlord.name}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Chủ trọ uy tín • {landlord.yearsActive} năm kinh nghiệm</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Đang quản lý {landlord.roomsCount} phòng trọ</span>
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => {
                    if (!currentUser) {
                      addToast('Vui lòng chọn vai trò Người Thuê để nhắn tin với chủ nhà!', 'error');
                      return;
                    }
                    setIsChatOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold"
                >
                  <MessageSquare size={16} />
                  Nhắn tin
                </Button>
                <a href={`tel:${landlord.phone}`} className="flex-1 sm:flex-none">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold"
                  >
                    <Phone size={16} />
                    {landlord.phone}
                  </Button>
                </a>
              </div>
            </div>

            {/* MỤC ĐÁNH GIÁ (REVIEWS) */}
            <div className="flex flex-col gap-6 border-t border-border pt-8">
              <h3 className="text-lg font-bold text-foreground">
                Đánh giá từ khách thuê ({roomReviews.length})
              </h3>
              
              {/* Form gửi Đánh giá mới */}
              {currentUser?.role === 'tenant' && (
                <form onSubmit={handleReviewSubmit} className="p-4 bg-muted/10 rounded-xl border border-border/80 flex flex-col gap-3">
                  <span className="text-xs font-bold text-foreground">Viết đánh giá của bạn:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Số sao:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-amber-500 cursor-pointer"
                        >
                          <Star size={18} className={reviewRating >= star ? 'fill-amber-500' : ''} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Nhập nhận xét của bạn về chất lượng phòng, chủ nhà..."
                    rows={3}
                    className="w-full p-2.5 rounded-lg border border-border bg-background text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                  <Button type="submit" size="sm" className="w-fit self-end font-bold text-xs">
                    Gửi đánh giá
                  </Button>
                </form>
              )}

              {/* Danh sách review cũ */}
              {roomReviews.length === 0 ? (
                <p className="text-xs font-semibold text-muted-foreground text-center py-6">Chưa có đánh giá nào cho phòng này.</p>
              ) : (
                <div className="space-y-4">
                  {roomReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl border border-border bg-card flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.userAvatar}
                            alt={rev.userName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{rev.userName}</span>
                            <span className="text-[10px] text-muted-foreground">{rev.date}</span>
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
                      <p className="text-xs md:text-sm font-medium text-muted-foreground pl-1 leading-relaxed">
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
            <div className="p-5 border border-border rounded-2xl bg-card shadow-lg flex flex-col gap-5">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Hẹn Xem & Đặt Giữ Chỗ</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-semibold">
                  Chọn hình thức phù hợp để chủ nhà liên hệ trực tiếp hỗ trợ.
                </p>
              </div>

              {/* Chọn loại đặt lịch */}
              <div className="grid grid-cols-2 gap-2 bg-muted/20 p-1 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setBookingType('viewing')}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    bookingType === 'viewing'
                      ? 'bg-card text-primary shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Xem phòng trọ
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType('deposit')}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    bookingType === 'deposit'
                      ? 'bg-card text-primary shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Đặt cọc giữ chỗ
                </button>
              </div>

              {/* Form đặt lịch */}
              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} className="text-primary" />
                    Chọn ngày hẹn:
                  </span>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    className="h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Chọn giờ hẹn:</span>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    required
                    className="h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="">Chọn khung giờ</option>
                    <option value="09:00">09:00 sáng</option>
                    <option value="10:30">10:30 sáng</option>
                    <option value="14:00">14:00 chiều</option>
                    <option value="15:30">15:30 chiều</option>
                    <option value="17:00">17:00 chiều</option>
                    <option value="18:30">18:30 tối</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ghi chú gửi chủ nhà:</span>
                  <textarea
                    value={bookingNote}
                    onChange={(e) => setBookingNote(e.target.value)}
                    placeholder="Em muốn hỏi thêm về giờ giấc, chỗ đỗ xe..."
                    rows={2}
                    className="p-2.5 rounded-lg border border-border bg-background text-xs focus:outline-none text-foreground"
                  />
                </div>

                {/* Bảng giá xem phòng / đặt giữ chỗ */}
                <div className="border-t border-border/80 pt-3 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-muted-foreground">Phí đặt lịch xem:</span>
                    <span className="text-emerald-500 font-extrabold">Miễn phí</span>
                  </div>
                  {bookingType === 'deposit' && (
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted-foreground">Tiền cọc giữ phòng (1 tháng):</span>
                      <span className="text-primary font-extrabold">{formatPrice(room.price)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border/60 pt-2 font-bold text-sm">
                    <span className="text-foreground">Tổng cộng thanh toán:</span>
                    <span className="text-primary font-extrabold">
                      {bookingType === 'deposit' ? formatPrice(room.price) : '0 đ'}
                    </span>
                  </div>
                </div>

                {/* Nút gửi */}
                <Button type="submit" className="w-full font-bold">
                  {bookingType === 'deposit' ? 'Xác nhận cọc giữ phòng' : 'Gửi yêu cầu đặt lịch hẹn'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL LIGHTBOX XEM ẢNH FULLSCREEN */}
      <Dialog isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} title="Xem chi tiết ảnh" size="xl">
        <div className="relative aspect-[16/10] w-full bg-black rounded-lg overflow-hidden">
          <img
            src={room.images[activeImgIndex]}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      </Dialog>

      {/* MODAL SUCCESS ĐẶT LỊCH THÀNH CÔNG */}
      <Dialog isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="Chúc Mừng Đăng Ký Thành Công!" size="md">
        <div className="flex flex-col items-center justify-center text-center p-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mb-4">
            <CheckCircleIcon size={32} />
          </div>
          <h4 className="text-base font-extrabold text-foreground">
            Gửi yêu cầu {bookingType === 'deposit' ? 'đặt cọc giữ phòng' : 'đặt lịch hẹn xem phòng'} thành công!
          </h4>
          <p className="text-xs text-muted-foreground font-semibold mt-2 max-w-sm leading-relaxed">
            Yêu cầu của bạn đã được chuyển tới chủ trọ <span className="font-extrabold text-foreground">{landlord.name}</span>. Bạn có thể kiểm tra trạng thái và nhận tin nhắn phản hồi tại trang Cá nhân.
          </p>
          <div className="flex gap-3 w-full mt-6">
            <Button
              onClick={() => {
                setIsSuccessModalOpen(false);
                router.push('/account?tab=bookings');
              }}
              className="flex-1 font-bold text-xs"
            >
              Xem lịch sử đặt phòng
            </Button>
            <Button
              onClick={() => setIsSuccessModalOpen(false)}
              variant="outline"
              className="flex-1 font-bold text-xs"
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
      <footer className="bg-card border-t border-border py-6 text-center text-xs text-muted-foreground font-semibold mt-12">
        <div className="container mx-auto px-4">
          <span>HomieStay © 2026. Demo Web Thuê Phòng Trọ Client-Side.</span>
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
