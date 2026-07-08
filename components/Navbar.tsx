'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Sun, Moon, Home, User as UserIcon, LayoutDashboard, MessageSquare } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { useFavorites } from '../store/useFavorites';
import { useChats } from '../store/useChats';
import { users } from '../data/users';

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, loginAs, logout } = useAuth();
  const { favorites } = useFavorites();
  const { messages } = useChats();
  const [darkMode, setDarkMode] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Khởi tạo trạng thái darkmode từ document
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  };

  // Tính số tin nhắn chưa đọc giả lập
  const unreadMessagesCount = currentUser 
    ? messages.filter(m => m.receiverId === currentUser.id).length 
    : 0;

  return (
    <header className="sticky top-0 z-45 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9.5 h-9.5 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-md group-hover:scale-105 transition-all duration-300 glow-shadow-primary">
            H
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base tracking-tight text-foreground group-hover:text-primary transition-colors">HomieStay</span>
            <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest -mt-0.5">Thuê phòng tiện lợi</span>
          </div>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="/"
            className={`flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider transition-colors hover:text-primary relative py-2 ${
              pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Home size={14} />
            Trang Chủ
            {pathname === '/' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-primary rounded-full" />
            )}
          </Link>
          <Link
            href="/rooms"
            className={`flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider transition-colors hover:text-primary relative py-2 ${
              pathname.startsWith('/rooms') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Danh Sách Phòng
            {pathname.startsWith('/rooms') && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-primary rounded-full" />
            )}
          </Link>
          {currentUser?.role === 'landlord' && (
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider transition-colors hover:text-primary relative py-2 ${
                pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <LayoutDashboard size={14} />
              Chủ Trọ Dashboard
              {pathname === '/dashboard' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-primary rounded-full" />
              )}
            </Link>
          )}
          {currentUser?.role === 'tenant' && (
            <Link
              href="/account"
              className={`flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider transition-colors hover:text-primary relative py-2 ${
                pathname === '/account' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <UserIcon size={14} />
              Cá Nhân
              {pathname === '/account' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-primary rounded-full" />
              )}
            </Link>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Nút Yêu Thích (Tenant) */}
          {currentUser?.role === 'tenant' && (
            <Link
              href="/account?tab=favorites"
              className="relative p-2 text-muted-foreground hover:text-rose-500 rounded-xl hover:bg-muted/50 transition-all duration-300 cursor-pointer"
              title="Phòng yêu thích"
            >
              <Heart size={18} className={favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''} />
              {favorites.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-bold">
                  {favorites.length}
                </span>
              )}
            </Link>
          )}

          {/* Tin nhắn */}
          {currentUser && (
            <Link
              href={currentUser.role === 'tenant' ? '/account?tab=chat' : '/dashboard?tab=chat'}
              className="relative p-2 text-muted-foreground hover:text-primary rounded-xl hover:bg-muted/50 transition-all duration-300 cursor-pointer"
              title="Tin nhắn liên hệ"
            >
              <MessageSquare size={18} />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-primary text-[9px] text-primary-foreground flex items-center justify-center font-bold">
                  {unreadMessagesCount}
                </span>
              )}
            </Link>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/50 transition-all duration-300 cursor-pointer"
            title="Đổi giao diện Sáng/Tối"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Giả lập tài khoản dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-full border border-border/80 bg-card hover:bg-muted/50 transition-all duration-300 text-xs font-bold cursor-pointer"
            >
              {currentUser ? (
                <>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-primary/20"
                  />
                  <div className="hidden lg:flex flex-col items-start leading-none text-left">
                    <span className="text-xs font-extrabold text-foreground">{currentUser.name}</span>
                    <span className="text-[8px] font-black text-primary uppercase mt-0.5 tracking-wider">
                      {currentUser.role === 'landlord' ? 'Chủ nhà' : 'Người thuê'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                    <UserIcon size={14} />
                  </div>
                  <span className="text-xs font-extrabold">Đăng nhập</span>
                </>
              )}
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-3 w-60 rounded-2xl glass-card p-3 shadow-2xl z-50 animate-fade-in">
                <div className="px-2 py-1.5 border-b border-border/55 mb-2">
                  <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest">
                    Giả lập vai trò nhanh (Demo)
                  </span>
                </div>
                
                {/* Chọn vai Tenant */}
                <button
                  onClick={() => {
                    const tenant = users.find(u => u.role === 'tenant');
                    if (tenant) loginAs('tenant', tenant.id);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-all text-left cursor-pointer border ${
                    currentUser?.role === 'tenant'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'hover:bg-muted/50 text-foreground border-transparent'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="flex flex-col">
                    <span>Người Thuê Phòng</span>
                    <span className="text-[9px] text-muted-foreground font-semibold">Tìm phòng, đặt lịch</span>
                  </div>
                </button>

                {/* Chọn vai Landlord */}
                <button
                  onClick={() => {
                    const landlord = users.find(u => u.role === 'landlord');
                    if (landlord) loginAs('landlord', landlord.id);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 mt-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all text-left cursor-pointer border ${
                    currentUser?.role === 'landlord'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'hover:bg-muted/50 text-foreground border-transparent'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <div className="flex flex-col">
                    <span>Chủ Nhà Trọ</span>
                    <span className="text-[9px] text-muted-foreground font-semibold">Đăng phòng, quản lý</span>
                  </div>
                </button>

                {currentUser && (
                  <button
                    onClick={() => {
                      logout();
                      setShowRoleDropdown(false);
                    }}
                    className="w-full text-center mt-2.5 border-t border-border/55 pt-2.5 px-3 py-2 text-xs text-rose-500 font-extrabold hover:bg-rose-500/5 rounded-xl cursor-pointer transition-all"
                  >
                    Đăng xuất tài khoản
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
