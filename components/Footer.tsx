'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-card border-t border-border/40 pt-14 pb-8 text-xs text-muted-foreground font-semibold overflow-hidden">
      {/* Decorative gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-primary/8 blur-2xl rounded-full" />

      <div className="container mx-auto px-4">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-black text-base shadow-md glow-shadow-primary">
                H
              </div>
              <div>
                <span className="font-black text-foreground text-sm block leading-none">
                  HomieStay
                </span>
                <span className="text-[9px] text-muted-foreground mt-1 block font-bold">
                  Hệ thống căn hộ dịch vụ co-living
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed max-w-xs font-medium mt-1">
              Nền tảng quản lý phòng trọ thông minh tích hợp thanh toán online,
              báo cáo sự cố 24/7 và mô phỏng 3D tùy biến phòng.
            </p>
          </div>

          {/* Quick links */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
              Khám phá
            </span>
            <div className="flex flex-col gap-2">
              {[
                { href: '/', label: 'Trang chủ' },
                { href: '/rooms', label: 'Tìm phòng trọ' },
                { href: '/account', label: 'Cổng cư dân' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-semibold w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
              Hỗ trợ cư dân
            </span>
            <div className="flex flex-col gap-2">
              {[
                'Điều khoản cư dân',
                'Chính sách bảo mật',
                'Báo cáo khẩn cấp',
                'Liên hệ ban quản lý',
              ].map((text) => (
                <span
                  key={text}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer font-semibold w-fit"
                >
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
              Liên hệ
            </span>
            <div className="flex flex-col gap-2 text-[11px] text-muted-foreground font-medium">
              <span>📍 Quận 7, TP.HCM & Cầu Giấy, Hà Nội</span>
              <span>📞 Hotline: 1900 8686 99</span>
              <span>✉️ support@homiestay.vn</span>
            </div>
            {/* Social icons placeholder */}
            <div className="flex gap-2.5 mt-2">
              {['Fb', 'Ig', 'Yt'].map((s) => (
                <div
                  key={s}
                  className="w-8 h-8 rounded-lg bg-muted/40 hover:bg-primary/10 hover:text-primary flex items-center justify-center text-[10px] font-black text-muted-foreground transition-all cursor-pointer border border-border/40"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/40 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-[10px] text-muted-foreground/70 font-medium">
            © 2026 HomieStay Co-living. Cổng Thông Tin & Quản Lý Căn Hộ Dịch Vụ.
          </span>
          <div className="flex items-center gap-4 text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/60">
            <span className="hover:text-primary cursor-pointer transition-colors">Sitemap</span>
            <span className="hover:text-primary cursor-pointer transition-colors">FAQ</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Careers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
