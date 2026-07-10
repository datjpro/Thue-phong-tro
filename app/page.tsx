'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Search, MapPin, Home, ArrowRight, ShieldCheck, Star, Sparkles, CheckCircle2, ChevronRight, HelpCircle, ShieldAlert } from 'lucide-react';
import { useFilters } from '@/store/useFilters';
import { useRooms } from '@/store/useRooms';
import { branches } from '@/data/branches';
import RoomCard from '@/components/rooms/RoomCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import SafeImage from '@/components/ui/SafeImage';

// Dynamic import Room3DView để tránh lỗi SSR khi render Canvas
const Room3DView = dynamic(() => import('@/components/rooms/Room3DView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] bg-card/30 border border-border/40 rounded-2xl flex items-center justify-center animate-pulse shadow-sm">
      <p className="text-xs text-muted-foreground font-black tracking-widest uppercase">Đang khởi tạo mô hình 3D...</p>
    </div>
  )
});

export default function HomePage() {
  const router = useRouter();
  const { setFilter } = useFilters();
  const { rooms } = useRooms();

  // State cục bộ cho thanh tìm kiếm nhanh
  const [quickBranch, setQuickBranch] = useState<string>('all');
  const [quickType, setQuickType] = useState<'all' | 'phong-tro' | 'chung-cu-mini' | 'o-ghep'>('all');
  const [quickPrice, setQuickPrice] = useState<number>(8000000);

  // P3: useMemo — chỉ sort lại khi rooms thay đổi
  const featuredRooms = useMemo(
    () => [...rooms].sort((a, b) => b.rating - a.rating).slice(0, 4),
    [rooms]
  );

  const handleSearch = () => {
    // Lưu các bộ lọc vào store chung
    setFilter({
      branchId: quickBranch,
      type: quickType,
      maxPrice: quickPrice,
      search: '', // Reset từ khóa tìm kiếm
      city: 'all',
      district: 'all'
    });
    // Chuyển hướng sang trang danh sách phòng
    router.push('/rooms');
  };

  // Đếm số phòng trống của mỗi chi nhánh
  const getAvailableCount = (branchId: string) => {
    return rooms.filter(r => r.branchId === branchId && r.status === 'available').length;
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-background">
      {/* Aurora gradient background */}
      <div className="fixed inset-0 bg-aurora opacity-60 pointer-events-none z-0" />
      <div className="fixed top-[-10%] left-[-10%] w-[550px] h-[550px] bg-[radial-gradient(circle,hsl(var(--primary)/0.07)_0%,transparent_70%)] animate-pulse-slow pointer-events-none z-0" />
      <div className="fixed top-[40%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,hsl(var(--accent)/0.06)_0%,transparent_70%)] pointer-events-none z-0" />
      
      <Navbar />

      <main className="flex-grow relative z-10">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-24 lg:py-28 border-b border-border/40">
          <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Cột trái: Giới thiệu & Tìm kiếm nhanh */}
            <div className="lg:col-span-6 flex flex-col gap-6.5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary w-fit uppercase tracking-wider animate-glow-pulse">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Hệ thống co-living công nghệ số 1
              </div>
              
              <h1 className="text-4xl lg:text-[50px] font-black tracking-tight text-foreground leading-[1.12]">
                Không gian sống <br />
                <span className="text-gradient font-black">Thời Thượng, Tiện Nghi</span> <br />
                Bứt phá trải nghiệm.
              </h1>
              
              <p className="text-xs md:text-sm text-muted-foreground font-semibold max-w-lg leading-relaxed">
                HomieStay vận hành chuỗi căn hộ dịch vụ và phòng trọ thông minh tại các quận trung tâm. Hỗ trợ thanh toán tiền trọ tự động, báo cáo sự cố kỹ thuật 24/7 trực tuyến và tùy biến phòng 3D độc bản.
              </p>

              {/* Bộ tìm kiếm nhanh (Quick Search Box) */}
              <div className="p-5.5 glass-card rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-end mt-2">
                {/* Chọn chi nhánh */}
                <div className="flex flex-col gap-1.5 flex-1 w-full">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <MapPin size={11} className="text-primary" />
                    Chi nhánh
                  </span>
                  <select
                    value={quickBranch}
                    onChange={(e) => setQuickBranch(e.target.value)}
                    className="h-11 w-full px-3 text-xs font-bold rounded-xl border border-border/80 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-sm"
                  >
                    <option value="all">Tất cả chi nhánh</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Loại hình */}
                <div className="flex flex-col gap-1.5 flex-1 w-full">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Home size={11} className="text-primary" />
                    Loại hình
                  </span>
                  <select
                    value={quickType}
                    onChange={(e) => setQuickType(e.target.value as any)}
                    className="h-11 w-full px-3 text-xs font-bold rounded-xl border border-border/80 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-sm"
                  >
                    <option value="all">Tất cả loại hình</option>
                    <option value="phong-tro">Phòng đơn gác lửng</option>
                    <option value="chung-cu-mini">Căn hộ Studio</option>
                    <option value="o-ghep">KTX Trọn Gói</option>
                  </select>
                </div>

                {/* Khoảng giá */}
                <div className="flex flex-col gap-1.5 flex-1 w-full">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <span className="text-primary font-black">$</span>
                    Ngân sách tối đa
                  </span>
                  <select
                    value={quickPrice}
                    onChange={(e) => setQuickPrice(Number(e.target.value))}
                    className="h-11 w-full px-3 text-xs font-bold rounded-xl border border-border/80 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-sm"
                  >
                    <option value={2500000}>Dưới 2.5 triệu</option>
                    <option value={4000000}>Dưới 4.0 triệu</option>
                    <option value={6000000}>Dưới 6.0 triệu</option>
                    <option value={8000000}>Dưới 8.0 triệu</option>
                  </select>
                </div>

                {/* Nút Tìm Kiếm */}
                <Button
                  onClick={handleSearch}
                  className="h-11 w-full md:w-auto px-6.5 font-black flex items-center justify-center gap-2 glow-shadow-primary shrink-0"
                >
                  <Search size={15} />
                  Tìm Kiếm
                </Button>
              </div>
            </div>

            {/* Cột phải: 3D Room Customizer */}
            <div className="lg:col-span-6 w-full flex flex-col gap-2 mt-4 lg:mt-0 animate-float">
              <Room3DView />
            </div>
          </div>
        </section>

        {/* THỐNG KÊ HỆ THỐNG */}
        <section className="py-12 bg-card border-b border-border/40 relative z-10">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center stagger-auto">
            {[
              { num: '4', suffix: ' Chi Nhánh', label: 'Tại Hồ Chí Minh & Hà Nội' },
              { num: '98.5%', suffix: '', label: 'Cư dân hài lòng' },
              { num: '24/7', suffix: ' Smart', label: 'Báo sự cố trực tuyến' },
              { num: 'Online', suffix: ' Pay', label: 'Xem & đóng tiền phòng dễ dàng' }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col gap-1 p-4 rounded-2xl hover:bg-muted/40 transition-all duration-300 border border-transparent hover:border-border/40 hover:-translate-y-1">
                <span className="text-xl md:text-3xl font-black text-gradient tracking-tight">{stat.num}<span className="text-base md:text-xl">{stat.suffix}</span></span>
                <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CÁC CHI NHÁNH CHÍNH */}
        <section className="py-16 lg:py-20 bg-muted/15 border-b border-border/40 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-xl mx-auto mb-14">
              <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Hệ Thống Chi Nhánh HomieStay</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-2 font-semibold">
                Chuỗi căn hộ dịch vụ cao cấp tọa lạc tại các vị trí đắc địa, giao thông kết nối thuận tiện.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
              {branches.map((branch) => {
                const count = getAvailableCount(branch.id);
                return (
                  <div
                    key={branch.id}
                    onClick={() => {
                      setFilter({ branchId: branch.id, type: 'all', maxPrice: 8000000, search: '', city: 'all', district: 'all' });
                      router.push('/rooms');
                    }}
                    className="group relative h-72 rounded-2xl overflow-hidden shadow-md border border-border/60 cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-xl hover:border-primary/40 bg-card card-tilt"
                  >
                    {/* BUG6: SafeImage thay cho img — có fallback khi ảnh hỏng */}
                    <SafeImage
                      src={branch.image}
                      alt={branch.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
                    
                    <div className="absolute bottom-5 left-5 right-5 text-white flex flex-col">
                      <span className="text-xs font-black text-accent uppercase tracking-wider mb-0.5">Chi nhánh</span>
                      <span className="text-base font-black tracking-tight group-hover:text-accent transition-colors leading-snug">{branch.name}</span>
                      <p className="text-[10px] text-gray-300 font-semibold truncate mt-1.5">{branch.address}</p>
                      
                      <div className="mt-3.5 flex items-center justify-between border-t border-white/10 pt-2.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                          {count > 0 ? `${count} phòng đang trống` : 'Hết phòng trống'}
                        </span>
                        <span className="text-[10px] font-bold text-white group-hover:text-accent flex items-center gap-0.5">
                          Khám phá <ChevronRight size={10} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PHÒNG NỔI BẬT DÀNH CHO CƯ DÂN */}
        <section className="py-16 lg:py-20 container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                Không Gian Sống Tiêu Biểu
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1.5 font-semibold">
                Phòng trọ dịch vụ cao cấp sở hữu điểm đánh giá tuyệt đối từ cư dân đang sinh sống.
              </p>
            </div>
            <Link href="/rooms">
              <Button variant="outline" size="sm" className="font-extrabold flex items-center gap-1 text-xs">
                Xem tất cả phòng trống
                <ChevronRight size={14} />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </section>

        {/* TÍNH NĂNG ĐỘC BẢN DÀNH CHO CƯ DÂN */}
        <section className="py-16 lg:py-20 bg-card border-t border-border/40 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-xl mx-auto mb-14">
              <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Đặc Quyền Cư Dân HomieStay</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-2 font-semibold">
                Mang đến phong cách sống thông minh, quản lý không gian sống của bạn chỉ với 1 Click.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-auto">
              {[
                {
                  icon: <ShieldCheck className="text-primary" size={26} />,
                  title: 'Thanh toán tiền phòng Online',
                  desc: 'Theo dõi chi tiết điện, nước tiêu thụ hàng tháng trực quan. Đóng tiền trọ nhanh bằng chuyển khoản qua ngân hàng chỉ trong 10 giây.'
                },
                {
                  icon: <HelpCircle className="text-primary" size={26} />,
                  title: 'Báo cáo sự cố 24/7 trực tuyến',
                  desc: 'Gặp sự cố về thiết bị, máy lạnh, điện nước? Chỉ cần gửi báo cáo sửa chữa trực tuyến và theo dõi tiến độ khắc phục từ ban quản lý.'
                },
                {
                  icon: <Sparkles className="text-primary" size={26} />,
                  title: 'Mô hình tùy biến phòng 3D',
                  desc: 'Trực quan hóa cấu trúc phòng trọ trực tuyến. Thử phối lại màu tường, màu chăn drap giường, gỗ nội thất trước khi thuê.'
                }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-4.5 p-7 rounded-2xl border border-border/80 bg-background/60 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-400 hover:border-primary/30 glass-card-hover">
                  <div className="w-11.5 h-11.5 rounded-xl bg-primary/10 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h4 className="text-base font-black text-foreground">{item.title}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground font-semibold leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* BUG8: Dùng Footer component thống nhất */}
      <Footer />
    </div>
  );
}
