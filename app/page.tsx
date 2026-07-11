'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Heart, Menu, X, ChevronDown, Bed, Maximize2, CheckCircle2, Star, ArrowRight } from 'lucide-react';

// Custom outline house SVG icon (20x20)
const HouseIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="text-[--color-primary]"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const areas = [
  "Quận 1, TP.HCM",
  "Quận 3, TP.HCM",
  "Quận 10, TP.HCM",
  "Bình Thạnh, TP.HCM",
  "Gò Vấp, TP.HCM",
  "Cầu Giấy, Hà Nội",
  "Thanh Xuân, Hà Nội"
];

const types = [
  "Phòng trọ",
  "Chung cư mini",
  "Nhà nguyên căn",
  "Ở ghép"
];

const prices = [
  "Dưới 2 triệu",
  "2-4 triệu",
  "4-7 triệu",
  "Trên 7 triệu"
];

const mockListings = [
  {
    id: 1,
    price: "3.200.000đ/tháng",
    title: "Phòng trọ full nội thất gần ĐH Bách Khoa",
    location: "Q.10, TP.HCM",
    area: "20m²",
    bedrooms: "1 phòng ngủ",
    status: "Còn trống",
    featured: true,
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    price: "4.500.000đ/tháng",
    title: "Chung cư mini gác lửng, ban công thoáng mát",
    location: "Bình Thạnh, TP.HCM",
    area: "28m²",
    bedrooms: "1 phòng ngủ",
    status: "Còn trống",
    featured: true,
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    price: "1.800.000đ/tháng",
    title: "Phòng ở ghép nam/nữ đầy đủ tiện nghi quận 3",
    location: "Q.3, TP.HCM",
    area: "15m²",
    bedrooms: "1 phòng ngủ",
    status: "Còn trống",
    featured: false,
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    price: "7.000.000đ/tháng",
    title: "Căn hộ dịch vụ Studio hiện đại trung tâm Q.1",
    location: "Q.1, TP.HCM",
    area: "35m²",
    bedrooms: "Studio",
    status: "Còn trống",
    featured: true,
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    price: "5.500.000đ/tháng",
    title: "Nhà nguyên căn nhỏ xinh thích hợp hộ gia đình",
    location: "Gò Vấp, TP.HCM",
    area: "45m²",
    bedrooms: "2 phòng ngủ",
    status: "Còn trống",
    featured: false,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    price: "2.800.000đ/tháng",
    title: "Phòng trọ giá rẻ gần khu công nghệ cao",
    location: "Q.9, TP.HCM",
    area: "18m²",
    bedrooms: "1 phòng ngủ",
    status: "Còn trống",
    featured: false,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 7,
    price: "3.800.000đ/tháng",
    title: "Chung cư mini khép kín, an ninh 24/7",
    location: "Cầu Giấy, Hà Nội",
    area: "25m²",
    bedrooms: "1 phòng ngủ",
    status: "Còn trống",
    featured: false,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 8,
    price: "6.200.000đ/tháng",
    title: "Căn hộ dịch vụ cao cấp ban công rộng rãi",
    location: "Thanh Xuân, Hà Nội",
    area: "32m²",
    bedrooms: "1 phòng ngủ",
    status: "Còn trống",
    featured: true,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80"
  }
];

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<{ [key: number]: boolean }>({});

  // Dropdown states
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPrice, setSelectedPrice] = useState<string>('');

  const [areaOpen, setAreaOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  const searchContainerRef = useRef<HTMLFormElement>(null);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Click outside search dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setAreaOpen(false);
        setTypeOpen(false);
        setPriceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Tìm kiếm phòng trọ tại: ${selectedArea || 'Tất cả khu vực'}, Loại phòng: ${selectedType || 'Tất cả loại phòng'}, Mức giá: ${selectedPrice || 'Tất cả mức giá'}`);
  };

  return (
    <div 
      className="flex flex-col min-h-screen relative overflow-hidden bg-white text-[--color-ink]"
      suppressHydrationWarning
    >
      {/* NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-20 w-full px-5 sm:px-8 lg:px-12 py-4 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md border-b border-black/5 shadow-sm py-3.5'
            : 'bg-white/80 backdrop-blur-md border-b border-black/5 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer select-none">
            <HouseIcon />
            <span className="font-heading text-[22px] sm:text-[26px] font-bold text-[--color-ink] tracking-tight">
              Tro<span className="text-[--color-primary]">Viet</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium">
            <Link href="#" className="text-[--color-primary] hover:text-[--color-primary] transition-colors duration-200">
              Tìm phòng
            </Link>
            <Link href="#" className="text-[--color-ink] hover:text-[--color-primary] transition-colors duration-200">
              Đăng tin
            </Link>
            <Link href="#" className="text-[--color-ink] hover:text-[--color-primary] transition-colors duration-200">
              Bảng giá
            </Link>
            <Link href="#" className="text-[--color-ink] hover:text-[--color-primary] transition-colors duration-200">
              Hỗ trợ
            </Link>
          </nav>

          {/* Desktop controls */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="#" className="text-[15px] font-medium text-[--color-ink] hover:opacity-70 transition-opacity">
              Đăng nhập
            </Link>
            <button className="bg-[--color-primary] text-white rounded-full px-5 py-2.5 text-[14px] font-semibold hover:bg-[--color-primary-dark] transition-colors duration-200 shadow-sm cursor-pointer hover:shadow">
              Đăng tin miễn phí
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex flex-col justify-center items-center gap-[5px] w-6 h-6 focus:outline-none z-30"
            aria-label="Toggle Menu"
          >
            <span
              className={`w-6 h-[2px] bg-[--color-ink] rounded-full transition-all duration-300 origin-center ${
                isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
              }`}
            />
            <span
              className={`w-6 h-[2px] bg-[--color-ink] rounded-full transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-6 h-[2px] bg-[--color-ink] rounded-full transition-all duration-300 origin-center ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
              }`}
            />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed inset-0 bg-white z-19 flex flex-col justify-between px-8 pt-28 pb-10"
          >
            <div className="flex flex-col gap-6">
              <Link
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[24px] font-medium text-[--color-primary] transition-colors"
              >
                Tìm phòng
              </Link>
              <Link
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[24px] font-medium text-[--color-ink] hover:text-[--color-primary] transition-colors"
              >
                Đăng tin
              </Link>
              <Link
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[24px] font-medium text-[--color-ink] hover:text-[--color-primary] transition-colors"
              >
                Bảng giá
              </Link>
              <Link
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[24px] font-medium text-[--color-ink] hover:text-[--color-primary] transition-colors"
              >
                Hỗ trợ
              </Link>
              <div className="w-full h-px bg-black/5 my-2" />
              <Link
                href="#"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[20px] font-medium text-[--color-ink] hover:text-[--color-primary] transition-colors"
              >
                Đăng nhập
              </Link>
            </div>
            
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full bg-[--color-primary] text-white rounded-full py-4 font-semibold text-[16px] hover:bg-[--color-primary-dark] transition-colors duration-200 shadow-md cursor-pointer"
            >
              Đăng tin miễn phí
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative z-1 min-h-[92vh] flex items-center justify-center bg-black">
        {/* Full-bleed background image */}
        <div className="absolute inset-0 select-none pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-room.jpg"
            alt="TroViet Hero Background"
            className="w-full h-full object-cover object-center"
          />
          {/* Dark gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
        </div>

        {/* Content Container */}
        <div className="relative z-2 max-w-3xl mx-auto text-center px-5 sm:px-8 pt-32 pb-20 flex flex-col items-center">
          
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white rounded-full px-4 py-1.5 text-[13px] mb-6 select-none font-medium"
          >
            <span>🏠</span>
            <span>Hơn 12.000 phòng trọ đang cho thuê</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[36px] sm:text-[52px] lg:text-[60px] font-bold text-white leading-[1.15] mb-5 font-heading tracking-tight whitespace-pre-line"
          >
            {"Tìm phòng trọ ưng ý,\nchỉ trong vài phút"}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[16px] sm:text-[19px] text-white/85 max-w-xl mx-auto mb-10 leading-relaxed font-normal"
          >
            Hàng ngàn phòng trọ, chung cư mini, nhà nguyên căn được xác minh thực tế — cập nhật giá mỗi ngày.
          </motion.p>

          {/* Search bar centerpiece */}
          <motion.form
            ref={searchContainerRef}
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full bg-white rounded-2xl shadow-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-2 border border-black/5"
          >
            {/* Field 1 — Khu vực */}
            <div className="flex-1 relative">
              <button
                type="button"
                onClick={() => {
                  setAreaOpen(!areaOpen);
                  setTypeOpen(false);
                  setPriceOpen(false);
                }}
                className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-left text-[15px] text-[--color-ink] hover:bg-black/[0.03] transition-colors duration-150 cursor-pointer"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MapPin size={16} className="text-[--color-primary] shrink-0" />
                  <span className="truncate font-medium">
                    {selectedArea || "Chọn khu vực (Quận, Thành phố)"}
                  </span>
                </div>
                <ChevronDown size={16} className={`text-black/40 transition-transform duration-200 shrink-0 ${areaOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {areaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/5 rounded-xl shadow-xl overflow-hidden z-30 max-h-60 overflow-y-auto text-left"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedArea('');
                        setAreaOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-[14px] hover:bg-black/[0.03] transition-colors text-black/50 border-b border-black/5 flex items-center justify-between"
                    >
                      <span>Tất cả khu vực</span>
                    </button>
                    {areas.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setSelectedArea(item);
                          setAreaOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-[14px] hover:bg-black/[0.03] transition-colors text-[--color-ink] flex items-center justify-between font-medium"
                      >
                        <span>{item}</span>
                        {selectedArea === item && <span className="text-[--color-primary] text-[12px]">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden lg:block w-px h-8 bg-black/10 shrink-0" />

            {/* Field 2 — Loại phòng */}
            <div className="flex-1 relative">
              <button
                type="button"
                onClick={() => {
                  setTypeOpen(!typeOpen);
                  setAreaOpen(false);
                  setPriceOpen(false);
                }}
                className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-left text-[15px] text-[--color-ink] hover:bg-black/[0.03] transition-colors duration-150 cursor-pointer"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-[16px] leading-none shrink-0">🏠</span>
                  <span className="truncate font-medium">
                    {selectedType || "Loại phòng"}
                  </span>
                </div>
                <ChevronDown size={16} className={`text-black/40 transition-transform duration-200 shrink-0 ${typeOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {typeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/5 rounded-xl shadow-xl overflow-hidden z-30 text-left"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedType('');
                        setTypeOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-[14px] hover:bg-black/[0.03] transition-colors text-black/50 border-b border-black/5"
                    >
                      Tất cả loại phòng
                    </button>
                    {types.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setSelectedType(item);
                          setTypeOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-[14px] hover:bg-black/[0.03] transition-colors text-[--color-ink] flex items-center justify-between font-medium"
                      >
                        <span>{item}</span>
                        {selectedType === item && <span className="text-[--color-primary] text-[12px]">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden lg:block w-px h-8 bg-black/10 shrink-0" />

            {/* Field 3 — Mức giá */}
            <div className="flex-1 relative">
              <button
                type="button"
                onClick={() => {
                  setPriceOpen(!priceOpen);
                  setAreaOpen(false);
                  setTypeOpen(false);
                }}
                className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-left text-[15px] text-[--color-ink] hover:bg-black/[0.03] transition-colors duration-150 cursor-pointer"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-[16px] leading-none shrink-0 font-semibold text-[--color-primary]">$</span>
                  <span className="truncate font-medium">
                    {selectedPrice || "Mức giá"}
                  </span>
                </div>
                <ChevronDown size={16} className={`text-black/40 transition-transform duration-200 shrink-0 ${priceOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {priceOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/5 rounded-xl shadow-xl overflow-hidden z-30 text-left"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPrice('');
                        setPriceOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-[14px] hover:bg-black/[0.03] transition-colors text-black/50 border-b border-black/5"
                    >
                      Tất cả mức giá
                    </button>
                    {prices.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setSelectedPrice(item);
                          setPriceOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-[14px] hover:bg-black/[0.03] transition-colors text-[--color-ink] flex items-center justify-between font-medium"
                      >
                        <span>{item}</span>
                        {selectedPrice === item && <span className="text-[--color-primary] text-[12px]">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search button */}
            <button
              type="submit"
              className="bg-[--color-primary] text-white rounded-xl px-6 lg:px-8 py-3.5 lg:py-3 font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-[--color-primary-dark] transition-colors duration-200 cursor-pointer w-full lg:w-auto shrink-0 shadow-sm hover:shadow"
            >
              <Search size={16} />
              <span>Tìm phòng</span>
            </button>
          </motion.form>

          {/* Quick stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center items-center gap-x-3 sm:gap-x-4 gap-y-1 mt-8 text-white/80 text-[13px] sm:text-[14px] select-none font-medium"
          >
            <span>12.000+ tin đăng</span>
            <span className="text-white/40 text-[10px]">•</span>
            <span>500+ khu vực</span>
            <span className="text-white/40 text-[10px]">•</span>
            <span>98% người thuê hài lòng</span>
          </motion.div>
        </div>
      </section>

      {/* FEATURED LISTINGS SECTION */}
      <section className="bg-white py-16 sm:py-24 px-5 sm:px-8 lg:px-12 border-b border-black/5">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-[28px] sm:text-[34px] font-bold font-heading text-[--color-ink] tracking-tight">
                Phòng trọ nổi bật
              </h2>
              <p className="text-[15px] text-[--color-muted] mt-1 font-medium">
                Được xem nhiều nhất tuần này
              </p>
            </div>
            
            <Link
              href="#"
              className="hidden sm:inline-flex items-center gap-1.5 text-[--color-primary] font-semibold text-[15px] hover:opacity-70 transition-opacity"
            >
              <span>Xem tất cả</span>
              <ArrowRight size={16} className="mt-0.5" />
            </Link>
          </div>

          {/* Listing grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {mockListings.map((listing, index) => {
              const isFav = !!favorites[listing.id];
              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="group rounded-2xl overflow-hidden border border-black/5 hover:shadow-xl transition-all duration-300 cursor-pointer bg-white flex flex-col"
                >
                  {/* Card Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Heart icon button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(listing.id);
                      }}
                      className="absolute top-3 right-3 bg-white/95 rounded-full p-2 shadow-sm hover:scale-105 transition-transform hover:bg-white z-10 cursor-pointer"
                      aria-label="Add to favorites"
                    >
                      <Heart
                        size={17}
                        className={`transition-all duration-300 ${
                          isFav ? 'fill-rose-500 text-rose-500 scale-110' : 'text-black/50 hover:text-rose-500'
                        }`}
                      />
                    </button>

                    {/* Featured badge */}
                    {listing.featured && (
                      <span className="absolute top-3 left-3 bg-[--color-primary] text-white text-[11px] font-semibold rounded-full px-2.5 py-1 shadow-sm select-none z-10">
                        Nổi bật
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Price */}
                    <span className="text-[17px] font-bold text-[--color-primary] leading-none">
                      {listing.price}
                    </span>
                    
                    {/* Title */}
                    <h3 className="text-[15px] font-semibold text-[--color-ink] line-clamp-1 mt-2 group-hover:text-[--color-primary] transition-colors duration-200 font-heading">
                      {listing.title}
                    </h3>
                    
                    {/* Location */}
                    <div className="flex items-center gap-1 text-[13px] text-[--color-muted] mt-1.5 font-medium">
                      <MapPin size={12} className="text-black/35 shrink-0" />
                      <span className="truncate">{listing.location}</span>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-[13px] text-[--color-muted] mt-4 pt-3 border-t border-black/5 font-medium">
                      <div className="flex items-center gap-1">
                        <Maximize2 size={13} className="text-black/35" />
                        <span>{listing.area}</span>
                      </div>
                      <div className="w-px h-3 bg-black/10" />
                      <div className="flex items-center gap-1">
                        <Bed size={13} className="text-black/35" />
                        <span className="truncate">{listing.bedrooms}</span>
                      </div>
                      <div className="w-px h-3 bg-black/10" />
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-500" />
                        <span className="text-emerald-600 font-semibold">{listing.status}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile visible read all */}
          <div className="sm:hidden mt-8 text-center">
            <Link
              href="#"
              className="inline-flex items-center gap-1.5 text-[--color-primary] font-semibold text-[15px]"
            >
              <span>Xem tất cả phòng nổi bật</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-white py-8 px-5 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full rounded-3xl bg-[--color-ink] text-white flex flex-col lg:flex-row items-center justify-between gap-6 p-8 sm:p-12 relative overflow-hidden"
          >
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(255,122,0,0.15)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(255,122,0,0.08)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative z-10 text-center lg:text-left">
              <h2 className="text-[24px] sm:text-[30px] font-bold font-heading leading-tight tracking-tight">
                Bạn có phòng trống cần cho thuê?
              </h2>
              <p className="text-white/70 text-[15px] mt-2 font-normal max-w-xl">
                Đăng tin miễn phí, tiếp cận hàng ngàn người thuê mỗi ngày tại TroViet.
              </p>
            </div>
            
            <button className="relative z-10 bg-[--color-primary] text-white rounded-full px-7 py-3.5 font-semibold text-[15px] whitespace-nowrap hover:bg-[--color-primary-dark] transition-all duration-200 shadow-lg shadow-black/10 hover:shadow-black/20 hover:scale-102 cursor-pointer shrink-0">
              Đăng tin ngay
            </button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white pt-16 pb-8 px-5 sm:px-8 lg:px-12 border-t border-black/5 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand column */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <HouseIcon />
                <span className="font-heading text-[22px] font-bold text-[--color-ink] tracking-tight">
                  Tro<span className="text-[--color-primary]">Viet</span>
                </span>
              </div>
              <p className="text-[13px] text-[--color-muted] leading-relaxed">
                Nền tảng tìm kiếm phòng trọ và căn hộ cho thuê uy tín hàng đầu Việt Nam, hỗ trợ kết nối nhanh chóng và an tâm.
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-heading font-semibold text-[14px] text-[--color-ink] mb-4 uppercase tracking-wider">
                Khám phá
              </h4>
              <ul className="flex flex-col gap-2.5 text-[14px] text-[--color-muted] font-medium">
                <li><Link href="#" className="hover:text-[--color-primary] transition-colors">Tìm phòng trọ</Link></li>
                <li><Link href="#" className="hover:text-[--color-primary] transition-colors">Chung cư mini</Link></li>
                <li><Link href="#" className="hover:text-[--color-primary] transition-colors">Nhà nguyên căn</Link></li>
                <li><Link href="#" className="hover:text-[--color-primary] transition-colors">Tìm người ở ghép</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="font-heading font-semibold text-[14px] text-[--color-ink] mb-4 uppercase tracking-wider">
                Dành cho đối tác
              </h4>
              <ul className="flex flex-col gap-2.5 text-[14px] text-[--color-muted] font-medium">
                <li><Link href="#" className="hover:text-[--color-primary] transition-colors">Đăng tin miễn phí</Link></li>
                <li><Link href="#" className="hover:text-[--color-primary] transition-colors">Bảng giá dịch vụ</Link></li>
                <li><Link href="#" className="hover:text-[--color-primary] transition-colors">Quy chế đăng tin</Link></li>
                <li><Link href="#" className="hover:text-[--color-primary] transition-colors">Liên hệ báo giá</Link></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="font-heading font-semibold text-[14px] text-[--color-ink] mb-4 uppercase tracking-wider">
                Hỗ trợ khách hàng
              </h4>
              <ul className="flex flex-col gap-2.5 text-[14px] text-[--color-muted] font-medium">
                <li><Link href="#" className="hover:text-[--color-primary] transition-colors">Trung tâm trợ giúp</Link></li>
                <li><Link href="#" className="hover:text-[--color-primary] transition-colors">Chính sách bảo mật</Link></li>
                <li><Link href="#" className="hover:text-[--color-primary] transition-colors">Điều khoản dịch vụ</Link></li>
                <li><Link href="#" className="hover:text-[--color-primary] transition-colors">Giải quyết khiếu nại</Link></li>
              </ul>
            </div>
          </div>

          <div className="w-full h-px bg-black/5 mb-8" />

          {/* Bottom Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[--color-muted] font-medium">
            <span>© {new Date().getFullYear()} TroViet. Tất cả quyền được bảo lưu.</span>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-[--color-primary] transition-colors">Facebook</Link>
              <span>•</span>
              <Link href="#" className="hover:text-[--color-primary] transition-colors">Zalo</Link>
              <span>•</span>
              <Link href="#" className="hover:text-[--color-primary] transition-colors">Tiktok</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Simple client-side Link component to prevent nextjs routing errors for mock landing links
function Link({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href === '#' || href.startsWith('#')) {
      e.preventDefault();
    }
  };
  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
