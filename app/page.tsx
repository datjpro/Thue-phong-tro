'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Search, MapPin, Home, ArrowRight, ShieldCheck, Star, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { useFilters } from '@/store/useFilters';
import { useRooms } from '@/store/useRooms';
import RoomCard from '@/components/rooms/RoomCard';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';

// Dynamic import Room3DView để tránh lỗi SSR khi render Canvas
const Room3DView = dynamic(() => import('@/components/rooms/Room3DView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] bg-card/40 border border-border/60 rounded-2xl flex items-center justify-center animate-pulse shadow-sm">
      <p className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Đang tải mô hình 3D...</p>
    </div>
  )
});

export default function HomePage() {
  const router = useRouter();
  const { setFilter } = useFilters();
  const { rooms } = useRooms();

  // State cục bộ cho thanh tìm kiếm nhanh
  const [quickCity, setQuickCity] = useState<'all' | 'Hồ Chí Minh' | 'Hà Nội'>('all');
  const [quickType, setQuickType] = useState<'all' | 'phong-tro' | 'chung-cu-mini' | 'o-ghep'>('all');
  const [quickPrice, setQuickPrice] = useState<number>(8000000);

  // Lấy 4 phòng trọ có rating cao nhất để hiển thị nổi bật
  const featuredRooms = [...rooms]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  const handleSearch = () => {
    // Lưu các bộ lọc vào store chung
    setFilter({
      city: quickCity,
      type: quickType,
      maxPrice: quickPrice,
      search: '', // Reset từ khóa để tìm theo danh mục
      district: 'all'
    });
    // Chuyển hướng sang trang danh sách phòng
    router.push('/rooms');
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-background">
      <Navbar />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-10 pb-20 lg:py-24 border-b border-border/40 bg-gradient-to-b from-secondary/20 via-background to-background">
          {/* Glowing background circles */}
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[radial-gradient(circle,hsl(var(--primary)/0.06)_0%,transparent_70%)] animate-pulse-slow pointer-events-none" />
          <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-[radial-gradient(circle,hsl(var(--accent)/0.04)_0%,transparent_70%)] pointer-events-none" />

          <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Cột trái: Giới thiệu & Tìm kiếm nhanh */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary w-fit uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Nền tảng tìm kiếm phòng trọ thế hệ mới
              </div>
              
              <h1 className="text-4xl lg:text-[48px] font-black tracking-tight text-foreground leading-[1.12]">
                Tìm kiếm phòng trọ <br />
                <span className="text-gradient">Tiện nghi, Ấm cúng</span> <br />
                & Nhanh chóng nhất.
              </h1>
              
              <p className="text-xs md:text-sm text-muted-foreground font-semibold max-w-lg leading-relaxed">
                HomieStay cung cấp hàng ngàn lựa chọn phòng trọ truyền thống, chung cư mini, homestay dịch vụ đầy đủ tại TP.HCM và Hà Nội. Trải nghiệm xem cấu trúc phòng 3D trực quan trước khi ghé thăm trực tiếp.
              </p>

              {/* Bộ tìm kiếm nhanh (Quick Search Box) */}
              <div className="p-5 glass-card rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-end mt-2">
                {/* Thành phố */}
                <div className="flex flex-col gap-1.5 flex-1 w-full">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <MapPin size={11} className="text-primary" />
                    Thành phố
                  </span>
                  <select
                    value={quickCity}
                    onChange={(e) => setQuickCity(e.target.value as any)}
                    className="h-10.5 w-full px-3 text-xs font-bold rounded-xl border border-border/80 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-sm"
                  >
                    <option value="all">Tất cả thành phố</option>
                    <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                  </select>
                </div>

                {/* Loại phòng */}
                <div className="flex flex-col gap-1.5 flex-1 w-full">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Home size={11} className="text-primary" />
                    Loại hình
                  </span>
                  <select
                    value={quickType}
                    onChange={(e) => setQuickType(e.target.value as any)}
                    className="h-10.5 w-full px-3 text-xs font-bold rounded-xl border border-border/80 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-sm"
                  >
                    <option value="all">Tất cả loại hình</option>
                    <option value="phong-tro">Phòng trọ</option>
                    <option value="chung-cu-mini">Chung cư mini</option>
                    <option value="o-ghep">Ở ghép / KTX</option>
                  </select>
                </div>

                {/* Khoảng giá */}
                <div className="flex flex-col gap-1.5 flex-1 w-full">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <span className="text-primary font-black">$</span>
                    Giá tối đa
                  </span>
                  <select
                    value={quickPrice}
                    onChange={(e) => setQuickPrice(Number(e.target.value))}
                    className="h-10.5 w-full px-3 text-xs font-bold rounded-xl border border-border/80 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-sm"
                  >
                    <option value={2500000}>Dưới 2.5 triệu</option>
                    <option value={4000000}>Dưới 4 triệu</option>
                    <option value={6000000}>Dưới 6 triệu</option>
                    <option value={8000000}>Dưới 8 triệu</option>
                  </select>
                </div>

                {/* Nút Tìm Kiếm */}
                <Button
                  onClick={handleSearch}
                  className="h-10.5 w-full md:w-auto px-6 font-extrabold flex items-center gap-2 text-xs md:text-sm glow-shadow-primary"
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
        <section className="py-10 bg-card border-b border-border/40 relative z-10">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: '1,500+', label: 'Phòng trọ sẵn sàng' },
              { num: '350+', label: 'Chủ nhà trọ uy tín' },
              { num: '12,000+', label: 'Người thuê hài lòng' },
              { num: '99.2%', label: 'Tỉ lệ ghép phòng thành công' }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col gap-1 p-4 rounded-2xl hover:bg-muted/30 transition-all duration-300 border border-transparent hover:border-border/40">
                <span className="text-2xl md:text-4xl font-black text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">{stat.num}</span>
                <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* DANH SÁCH PHÒNG NỔI BẬT */}
        <section className="py-16 lg:py-20 container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                Phòng Trọ Nổi Bật Dành Cho Bạn
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1.5 font-semibold">
                Được đánh giá cao về chất lượng phòng, an ninh và dịch vụ hỗ trợ từ chủ nhà.
              </p>
            </div>
            <Link href="/rooms">
              <Button variant="outline" size="sm" className="font-extrabold flex items-center gap-1 text-xs">
                Xem tất cả phòng
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

        {/* KHU VỰC NỔI BẬT (HOT LOCATIONS) */}
        <section className="py-16 lg:py-20 bg-muted/20 border-t border-b border-border/40 relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Khu Vực Tiêu Biểu</h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-2 font-semibold">
                Những địa điểm có nhiều trường đại học lớn và văn phòng sầm uất tại hai đầu cầu đất nước.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: 'Bình Thạnh, HCM',
                  img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
                  count: 124,
                  city: 'Hồ Chí Minh' as const,
                  district: 'Bình Thạnh'
                },
                {
                  name: 'Quận 7, HCM',
                  img: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=400&q=80',
                  count: 98,
                  city: 'Hồ Chí Minh' as const,
                  district: 'Quận 7'
                },
                {
                  name: 'Cầu Giấy, HN',
                  img: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=400&q=80',
                  count: 156,
                  city: 'Hà Nội' as const,
                  district: 'Cầu Giấy'
                },
                {
                  name: 'Đống Đa, HN',
                  img: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=400&q=80',
                  count: 110,
                  city: 'Hà Nội' as const,
                  district: 'Đống Đa'
                }
              ].map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setFilter({ city: loc.city, district: loc.district, search: '', type: 'all' });
                    router.push('/rooms');
                  }}
                  className="group relative h-68 rounded-2xl overflow-hidden shadow-sm border border-border/80 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
                >
                  <img
                    src={loc.img}
                    alt={loc.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                  <div className="absolute bottom-5 left-5 text-white flex flex-col">
                    <span className="text-base font-black tracking-tight group-hover:text-primary transition-colors">{loc.name}</span>
                    <span className="text-[10px] font-bold text-primary-foreground opacity-90 mt-1 uppercase tracking-wider">
                      {loc.count} phòng trống
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TẠI SAO CHỌN CHÚNG TÔI */}
        <section className="py-16 lg:py-20 container mx-auto px-4 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Ưu Điểm Của HomieStay</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-2 font-semibold">
              Mang lại trải nghiệm thuê phòng trọ hiện đại, minh bạch và an tâm tuyệt đối.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck size={26} className="text-primary" />,
                title: 'Chủ nhà uy tín, xác minh rõ ràng',
                desc: 'Tất cả các chủ nhà và thông tin phòng trọ đều được chúng tôi kiểm tra, xác minh giấy tờ pháp lý kỹ lưỡng trước khi hiển thị công khai.'
              },
              {
                icon: <Sparkles size={26} className="text-primary" />,
                title: 'Trải nghiệm 3D độc quyền',
                desc: 'Xem trước cấu trúc phòng, đổi màu sơn và nội thất giả lập với mô hình 3D thực tế trước khi mất thời gian đến xem phòng trực tiếp.'
              },
              {
                icon: <CheckCircle2 size={26} className="text-primary" />,
                title: 'Đăng ký xem phòng nhanh chóng',
                desc: 'Liên hệ chat trực tiếp với chủ trọ hoặc đặt lịch hẹn xem phòng tự động ngay trên hệ thống chỉ với vài thao tác nhấn chuột đơn giản.'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-4.5 p-6.5 rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <h4 className="text-base font-black text-foreground">{item.title}</h4>
                <p className="text-xs md:text-sm text-muted-foreground font-semibold leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-card border-t border-border/50 py-10 text-xs text-muted-foreground font-semibold relative z-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-black text-sm shadow-sm">
              H
            </div>
            <div>
              <span className="font-extrabold text-foreground text-sm block leading-none">HomieStay</span>
              <span className="text-[9px] text-muted-foreground mt-1 block">© 2026. Demo Web Thuê Phòng Trọ Client-Side.</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-wider">
            <span className="hover:text-primary cursor-pointer transition-colors">Điều khoản dịch vụ</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Chính sách bảo mật</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Liên hệ hỗ trợ</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
