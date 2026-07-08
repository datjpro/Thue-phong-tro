'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/store/useAuth';
import { useRooms } from '@/store/useRooms';
import { useBookings } from '@/store/useBookings';
import { useFavorites } from '@/store/useFavorites';
import { useChats } from '@/store/useChats';
import { users } from '@/data/users';
import RoomCard from '@/components/rooms/RoomCard';

import {
  Heart,
  Calendar,
  MessageSquare,
  Star,
  Info,
  Clock,
  Sparkles,
  MapPin,
  Building,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Room } from '@/data/rooms';

export default function TenantAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, loginAs } = useAuth();
  const { rooms, reviews } = useRooms();
  const { bookings } = useBookings();
  const { favorites } = useFavorites();
  const { messages, sendMessage } = useChats();

  // Đọc tab hoạt động từ query URL
  const queryTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'favorites' | 'bookings' | 'chat' | 'reviews'>('favorites');

  // States cho chat
  const [selectedLandlordId, setSelectedLandlordId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (queryTab === 'favorites' || queryTab === 'bookings' || queryTab === 'chat' || queryTab === 'reviews') {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  // Cuộn xuống cuối khi chat được mở
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedLandlordId, selectedRoomId]);

  // Bảo vệ trang (chỉ cho phép tenant)
  if (!currentUser || currentUser.role !== 'tenant') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
            <Info size={28} />
          </div>
          <h2 className="text-xl font-bold text-foreground">Truy cập bị từ chối</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
            Bạn cần đăng nhập tài khoản với vai trò **Người Thuê (Tenant)** để truy cập trang cá nhân này.
          </p>
          <Button
            onClick={() => {
              const tenant = users.find((u) => u.role === 'tenant');
              if (tenant) loginAs('tenant', tenant.id);
            }}
            className="mt-5 font-bold"
          >
            Đăng nhập vai Người Thuê nhanh
          </Button>
        </div>
      </div>
    );
  }

  // 1. Danh sách phòng yêu thích
  const favoriteRooms = rooms.filter((r) => favorites.includes(r.id));

  // 2. Lịch sử đặt phòng
  const myBookings = bookings.filter((b) => b.tenantId === currentUser.id);

  // 3. Đánh giá đã viết
  const myReviews = reviews.filter((r) => r.userId === currentUser.id);

  // 4. Danh sách các tin nhắn hội thoại (Gom nhóm theo landlord + roomId)
  const chatThreads = useMemo(() => {
    const threadsMap = new Map<string, { landlord: any; room: Room; lastMsg: string; time: string }>();
    
    // Lọc tin nhắn của tenant này
    const tenantMsgs = messages.filter(m => m.senderId === currentUser.id || m.receiverId === currentUser.id);
    
    tenantMsgs.forEach(msg => {
      const isSender = msg.senderId === currentUser.id;
      const landlordId = isSender ? msg.receiverId : msg.senderId;
      const landlord = users.find(u => u.id === landlordId);
      const room = rooms.find(r => r.id === msg.roomId);
      
      if (landlord && room) {
        const threadKey = `${landlordId}-${msg.roomId}`;
        threadsMap.set(threadKey, {
          landlord,
          room,
          lastMsg: msg.text,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });

    return Array.from(threadsMap.entries()).map(([key, data]) => ({
      key,
      landlordId: key.split('-')[0],
      roomId: key.split('-')[1],
      ...data
    }));
  }, [messages, currentUser.id, rooms]);

  // Cuộc trò chuyện đang chọn
  const activeChatMessages = useMemo(() => {
    if (!selectedLandlordId || !selectedRoomId) return [];
    return messages.filter(
      (m) =>
        m.roomId === selectedRoomId &&
        ((m.senderId === currentUser.id && m.receiverId === selectedLandlordId) ||
          (m.senderId === selectedLandlordId && m.receiverId === currentUser.id))
    );
  }, [messages, selectedLandlordId, selectedRoomId, currentUser.id]);

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !selectedLandlordId || !selectedRoomId) return;

    sendMessage(currentUser.id, selectedLandlordId, selectedRoomId, chatInputText.trim());
    setChatInputText('');

    // Giả lập landlord reply tự động sau 1.5s
    setTimeout(() => {
      const landlordReplies = [
        'Chào em, anh nhận được tin nhắn rồi. Hôm nào em qua xem phòng trọ được nhỉ?',
        'Chào em, phòng đó vẫn còn trống nhé. Em qua xem phòng thì gọi trước anh 15 phút nhé.',
        'Ok em, tiền cọc giữ phòng anh đã nhận được rồi nhé. Cảm ơn em.',
        'Chào em, phòng trọ đã có đủ giường đệm máy lạnh rồi, em dọn vali qua là ở thôi.'
      ];
      const randomReply = landlordReplies[Math.floor(Math.random() * landlordReplies.length)];
      sendMessage(selectedLandlordId, currentUser.id, selectedRoomId, randomReply);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/5">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Banner thông tin cá nhân */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt=""
              className="w-16 h-16 rounded-full object-cover border-2 border-primary"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-black text-foreground">{currentUser.name}</h1>
              <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 mt-0.5">
                <UserIcon size={12} className="text-primary" />
                Khách thuê trọ • {currentUser.email}
              </p>
            </div>
          </div>
          
          <div className="flex gap-6 text-center text-xs font-semibold">
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-primary">{favoriteRooms.length}</span>
              <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-extrabold">Đã lưu</span>
            </div>
            <div className="flex flex-col border-l border-r border-border px-6">
              <span className="text-lg font-extrabold text-primary">{myBookings.length}</span>
              <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-extrabold">Lịch hẹn</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-primary">{myReviews.length}</span>
              <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-extrabold">Đánh giá</span>
            </div>
          </div>
        </div>

        {/* Thanh chuyển Tabs */}
        <div className="flex border-b border-border mb-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          {[
            { id: 'favorites', label: `Phòng đã lưu (${favoriteRooms.length})`, icon: <Heart size={16} /> },
            { id: 'bookings', label: `Lịch hẹn & Cọc giữ chỗ (${myBookings.length})`, icon: <Calendar size={16} /> },
            { id: 'chat', label: `Hội thoại chat (${chatThreads.length})`, icon: <MessageSquare size={16} /> },
            { id: 'reviews', label: `Đánh giá đã viết (${myReviews.length})`, icon: <Star size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* NỘI DUNG TABS */}

        {/* TAB 1: DANH SÁCH YÊU THÍCH */}
        {activeTab === 'favorites' && (
          <div className="animate-fade-in">
            {favoriteRooms.length === 0 ? (
              <div className="bg-card border border-border p-12 rounded-2xl text-center shadow-sm max-w-lg mx-auto">
                <Heart size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="text-base font-extrabold text-foreground">Chưa lưu phòng trọ nào</h3>
                <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs mx-auto">
                  Bạn có thể lưu các phòng trọ quan tâm bằng cách bấm vào biểu tượng tim ngoài trang danh sách phòng.
                </p>
                <Link href="/rooms" className="mt-4 inline-block">
                  <Button size="sm" className="font-bold">Khám phá phòng trọ</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {favoriteRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LỊCH HẸN & CỌC GIỮ PHÒNG */}
        {activeTab === 'bookings' && (
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-border bg-muted/10">
              <span className="text-sm font-bold text-foreground">Lịch sử giao dịch & Lịch xem phòng</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 font-bold text-muted-foreground">
                    <th className="p-4">Phòng trọ</th>
                    <th className="p-4">Thời gian hẹn</th>
                    <th className="p-4">Loại yêu cầu</th>
                    <th className="p-4">Chi phí / Cọc</th>
                    <th className="p-4">Chủ trọ</th>
                    <th className="p-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {myBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground font-semibold">
                        Bạn chưa gửi yêu cầu đặt lịch hẹn hay đặt giữ chỗ nào.
                      </td>
                    </tr>
                  ) : (
                    myBookings.map((book) => {
                      const room = rooms.find((r) => r.id === book.roomId);
                      const landlord = users.find((u) => u.id === book.landlordId);
                      return (
                        <tr key={book.id} className="hover:bg-muted/10 font-medium">
                          <td className="p-4 max-w-xs truncate">
                            {room ? (
                              <Link href={`/rooms/${room.id}`} className="hover:text-primary transition-colors">
                                <span className="font-extrabold text-foreground block truncate">{room.title}</span>
                                <span className="text-[10px] text-muted-foreground">{room.district}, {room.city}</span>
                              </Link>
                            ) : (
                              'Phòng trọ đã bị xóa'
                            )}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-foreground block">{book.bookingDate}</span>
                            <span className="text-[10px] text-muted-foreground">{book.bookingTime}</span>
                          </td>
                          <td className="p-4">
                            <Badge variant={book.type === 'deposit' ? 'default' : 'secondary'}>
                              {book.type === 'deposit' ? 'Cọc giữ phòng' : 'Xem phòng trực tiếp'}
                            </Badge>
                          </td>
                          <td className="p-4 font-bold text-primary">
                            {book.price > 0 ? `${book.price.toLocaleString('vi-VN')} đ` : '0 đ (Miễn phí)'}
                          </td>
                          <td className="p-4">
                            {landlord ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={landlord.avatar}
                                  alt=""
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <div className="flex flex-col">
                                  <span className="font-semibold text-foreground leading-none">{landlord.name}</span>
                                  <span className="text-[9px] text-muted-foreground mt-0.5">{landlord.phone}</span>
                                </div>
                              </div>
                            ) : (
                              'Chủ trọ'
                            )}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                book.status === 'approved' || book.status === 'completed'
                                  ? 'success'
                                  : book.status === 'pending'
                                  ? 'warning'
                                  : 'danger'
                              }
                            >
                              {book.status === 'pending'
                                ? 'Chờ chủ nhà duyệt'
                                : book.status === 'approved'
                                ? 'Đã duyệt thành công'
                                : book.status === 'completed'
                                ? 'Đã dọn vào ở'
                                : 'Đã từ chối'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: HỘI THOẠI CHAT */}
        {activeTab === 'chat' && (
          <div className="bg-card border border-border rounded-2xl shadow-lg h-[520px] flex overflow-hidden animate-fade-in">
            {/* Cột trái: Luồng chat (Chat list) */}
            <div className="w-1/3 border-r border-border flex flex-col h-full bg-muted/5">
              <div className="p-4 border-b border-border bg-card">
                <h3 className="font-extrabold text-sm text-foreground">Hội thoại chủ trọ</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto divide-y divide-border/60">
                {chatThreads.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground font-semibold">
                    Chưa có cuộc trò chuyện nào.
                  </div>
                ) : (
                  chatThreads.map((thread) => (
                    <button
                      key={thread.key}
                      onClick={() => {
                        setSelectedLandlordId(thread.landlordId);
                        setSelectedRoomId(thread.roomId);
                      }}
                      className={`w-full text-left p-3.5 flex gap-3 transition-colors cursor-pointer ${
                        selectedLandlordId === thread.landlordId && selectedRoomId === thread.roomId
                          ? 'bg-primary/5 border-l-4 border-primary'
                          : 'hover:bg-muted/10'
                      }`}
                    >
                      <img
                        src={thread.landlord.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-border"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground truncate">{thread.landlord.name}</span>
                          <span className="text-[9px] text-muted-foreground">{thread.time}</span>
                        </div>
                        <span className="text-[10px] text-primary truncate mt-0.5 font-bold">Phòng: {thread.room.title}</span>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-medium">{thread.lastMsg}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Cột phải: Hội thoại chi tiết */}
            <div className="flex-1 flex flex-col h-full bg-card">
              {selectedLandlordId && selectedRoomId ? (
                <>
                  {/* Header Chat */}
                  {(() => {
                    const activeThread = chatThreads.find(
                      (t) => t.landlordId === selectedLandlordId && t.roomId === selectedRoomId
                    );
                    return activeThread ? (
                      <div className="p-3 border-b border-border bg-muted/10 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={activeThread.landlord.avatar}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-border"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{activeThread.landlord.name}</span>
                            <span className="text-[9px] text-muted-foreground">Chủ trọ • Phòng: {activeThread.room.title}</span>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Nội dung tin nhắn chat */}
                  <div className="flex-grow overflow-y-auto p-4 space-y-3 flex flex-col">
                    {activeChatMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-3 py-2 text-xs md:text-sm font-medium shadow-sm leading-relaxed ${
                              isMe
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-card text-foreground border border-border rounded-tl-none'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <span
                              className={`text-[9px] mt-1 block text-right font-medium ${
                                isMe ? 'text-primary-foreground/75' : 'text-muted-foreground'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Thanh gửi tin nhắn */}
                  <form onSubmit={handleSendChatMessage} className="p-3 border-t border-border bg-card flex gap-2">
                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder="Nhập nội dung nhắn tin..."
                      className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-xs md:text-sm focus:outline-none"
                    />
                    <Button type="submit" size="sm" className="px-5 font-bold text-xs">
                      Gửi tin nhắn
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <MessageSquare size={36} className="text-muted-foreground/30 mb-2" />
                  <p className="text-sm font-semibold">Chọn một hội thoại ở cột bên trái để bắt đầu chat.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ĐÁNH GIÁ ĐÃ VIẾT */}
        {activeTab === 'reviews' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {myReviews.length === 0 ? (
              <div className="bg-card border border-border p-8 rounded-xl text-center shadow-sm">
                <p className="text-sm font-semibold text-muted-foreground">Bạn chưa viết đánh giá nào.</p>
              </div>
            ) : (
              myReviews.map((rev) => {
                const targetRoom = rooms.find((r) => r.id === rev.roomId);
                return (
                  <div key={rev.id} className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Building size={16} className="text-primary" />
                        {targetRoom ? (
                          <Link href={`/rooms/${targetRoom.id}`} className="text-xs font-bold text-foreground hover:underline">
                            Phòng: {targetRoom.title}
                          </Link>
                        ) : (
                          <span className="text-xs font-bold">Phòng đã bị xóa</span>
                        )}
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
                    
                    <div className="pl-1">
                      <p className="text-xs md:text-sm font-medium text-muted-foreground italic">"{rev.comment}"</p>
                      <span className="text-[9px] text-muted-foreground mt-2 block font-semibold">
                        Đăng ngày: {rev.date}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-card border-t border-border py-6 text-center text-xs text-muted-foreground font-semibold mt-12">
        <span>HomieStay © 2026. Demo Web Thuê Phòng Trọ Client-Side.</span>
      </footer>
    </div>
  );
}
