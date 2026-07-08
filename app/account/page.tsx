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
  User as UserIcon,
  Send
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
  }, [messages, selectedLandlordId, selectedRoomId, activeTab]);

  // Bảo vệ trang (chỉ cho phép tenant)
  if (!currentUser || currentUser.role !== 'tenant') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 shadow-sm">
            <Info size={24} />
          </div>
          <h2 className="text-xl font-black text-foreground tracking-tight">Truy cập bị từ chối</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-2 max-w-xs font-semibold leading-relaxed">
            Bạn cần đăng nhập tài khoản với vai trò **Người Thuê (Tenant)** để truy cập trang cá nhân này.
          </p>
          <Button
            onClick={() => {
              const tenant = users.find((u) => u.role === 'tenant');
              if (tenant) loginAs('tenant', tenant.id);
            }}
            className="mt-6 font-extrabold text-xs rounded-xl shadow-md glow-shadow-primary"
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
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 lg:py-10">
        {/* Banner thông tin cá nhân */}
        <div className="glass-card p-6 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt=""
              className="w-15 h-15 rounded-full object-cover border-2 border-primary shadow-sm"
            />
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">{currentUser.name}</h1>
              <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 mt-0.5">
                <UserIcon size={12} className="text-primary" />
                Khách thuê trọ • {currentUser.email}
              </p>
            </div>
          </div>
          
          <div className="flex gap-7 text-center text-xs font-semibold">
            <div className="flex flex-col">
              <span className="text-lg font-black text-primary">{favoriteRooms.length}</span>
              <span className="text-muted-foreground uppercase text-[9px] tracking-widest font-black mt-0.5">Đã lưu</span>
            </div>
            <div className="flex flex-col border-l border-r border-border/55 px-7">
              <span className="text-lg font-black text-primary">{myBookings.length}</span>
              <span className="text-muted-foreground uppercase text-[9px] tracking-widest font-black mt-0.5">Lịch hẹn</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-primary">{myReviews.length}</span>
              <span className="text-muted-foreground uppercase text-[9px] tracking-widest font-black mt-0.5">Đánh giá</span>
            </div>
          </div>
        </div>

        {/* Thanh chuyển Tabs */}
        <div className="flex border-b border-border/55 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
          {[
            { id: 'favorites', label: `Đã lưu (${favoriteRooms.length})`, icon: <Heart size={15} /> },
            { id: 'bookings', label: `Lịch hẹn & Cọc (${myBookings.length})`, icon: <Calendar size={15} /> },
            { id: 'chat', label: `Hội thoại chat (${chatThreads.length})`, icon: <MessageSquare size={15} /> },
            { id: 'reviews', label: `Đánh giá của tôi (${myReviews.length})`, icon: <Star size={15} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4.5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
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
              <div className="glass-card p-12 rounded-2xl text-center shadow-sm max-w-md mx-auto mt-6">
                <Heart size={38} className="text-muted-foreground/35 mx-auto mb-3" />
                <h3 className="text-sm font-extrabold text-foreground">Chưa lưu phòng trọ nào</h3>
                <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs mx-auto leading-relaxed">
                  Bạn có thể lưu các phòng trọ quan tâm bằng cách bấm vào biểu tượng trái tim ngoài trang danh sách phòng.
                </p>
                <Link href="/rooms" className="mt-5 inline-block">
                  <Button size="sm" className="font-extrabold text-xs rounded-xl shadow-md glow-shadow-primary">Khám phá phòng trọ</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6.5">
                {favoriteRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LỊCH HẸN & CỌC GIỮ PHÒNG */}
        {activeTab === 'bookings' && (
          <div className="glass-card rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <div className="p-4.5 border-b border-border/55 bg-muted/15">
              <span className="text-xs font-black text-foreground uppercase tracking-wider">Lịch hẹn xem phòng & Cọc giữ chỗ</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">
                    <th className="p-4">Phòng trọ</th>
                    <th className="p-4">Thời gian hẹn</th>
                    <th className="p-4">Loại yêu cầu</th>
                    <th className="p-4">Giá trị cọc</th>
                    <th className="p-4">Ghi chú</th>
                    <th className="p-4 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs font-semibold">
                  {myBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground/80">
                        Chưa có lịch hẹn xem phòng hoặc đặt cọc nào.
                      </td>
                    </tr>
                  ) : (
                    myBookings.map((b) => {
                      const room = rooms.find((r) => r.id === b.roomId);
                      const landlord = users.find((u) => u.id === b.landlordId);
                      
                      const statusVariant = 
                        b.status === 'approved' ? 'success' :
                        b.status === 'rejected' ? 'danger' : 'warning';
                      
                      const statusName = 
                        b.status === 'approved' ? 'Đã duyệt' :
                        b.status === 'rejected' ? 'Từ chối' : 'Đang duyệt';

                      return (
                        <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4">
                            {room ? (
                              <Link href={`/rooms/${room.id}`} className="hover:text-primary font-bold line-clamp-1">
                                {room.title}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">Phòng không khả dụng</span>
                            )}
                            <span className="text-[10px] text-muted-foreground block mt-0.5">Chủ trọ: {landlord?.name}</span>
                          </td>
                          <td className="p-4">
                            <span className="block font-bold">{b.bookingDate}</span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">{b.bookingTime}</span>
                          </td>
                          <td className="p-4">
                            <Badge variant={b.type === 'deposit' ? 'default' : 'secondary'} className="text-[9px]">
                              {b.type === 'deposit' ? 'Cọc giữ chỗ' : 'Hẹn xem'}
                            </Badge>
                          </td>
                          <td className="p-4 font-bold text-foreground">
                            {b.price > 0 ? `${(b.price / 1000000).toFixed(1)} triệu` : 'Miễn phí'}
                          </td>
                          <td className="p-4 text-xs font-medium text-muted-foreground max-w-xs truncate" title={b.note}>
                            {b.note || 'Không có ghi chú'}
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant={statusVariant} className="text-[9px] py-0.5 px-2">
                              {statusName}
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
          <div className="glass-card rounded-2xl shadow-lg h-[540px] flex overflow-hidden animate-fade-in">
            {/* Cột trái: Luồng chat */}
            <div className="w-1/3 border-r border-border/55 flex flex-col h-full bg-muted/10">
              <div className="p-4 border-b border-border/55 bg-card">
                <h3 className="font-black text-xs text-foreground uppercase tracking-wider">Hội thoại liên hệ</h3>
              </div>
              
              <div className="flex-grow overflow-y-auto divide-y divide-border/45">
                {chatThreads.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground/80 font-bold">
                    Chưa có hội thoại nào.
                  </div>
                ) : (
                  chatThreads.map((thread) => (
                    <button
                      key={thread.key}
                      onClick={() => {
                        setSelectedLandlordId(thread.landlordId);
                        setSelectedRoomId(thread.roomId);
                      }}
                      className={`w-full text-left p-3.5 flex gap-3 transition-colors cursor-pointer border-l-3 ${
                        selectedLandlordId === thread.landlordId && selectedRoomId === thread.roomId
                          ? 'bg-primary/5 border-l-primary'
                          : 'hover:bg-muted/10 border-l-transparent'
                      }`}
                    >
                      <img
                        src={thread.landlord.avatar}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-border"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground truncate">{thread.landlord.name}</span>
                          <span className="text-[9px] text-muted-foreground">{thread.time}</span>
                        </div>
                        <span className="text-[9px] text-primary truncate mt-0.5 font-bold">Phòng: {thread.room.title}</span>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-medium">{thread.lastMsg}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Cột phải: Chat chi tiết */}
            <div className="flex-grow flex flex-col h-full bg-card">
              {selectedLandlordId && selectedRoomId ? (
                <>
                  {/* Header Chat */}
                  {(() => {
                    const activeThread = chatThreads.find(
                      (t) => t.landlordId === selectedLandlordId && t.roomId === selectedRoomId
                    );
                    return activeThread ? (
                      <div className="p-3 border-b border-border/55 bg-muted/10 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={activeThread.landlord.avatar}
                            alt=""
                            className="w-8.5 h-8.5 rounded-full object-cover border border-border"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{activeThread.landlord.name}</span>
                            <span className="text-[9px] text-muted-foreground font-semibold">Chủ phòng • {activeThread.room.title}</span>
                          </div>
                        </div>
                        <Link href={`/rooms/${activeThread.room.id}`}>
                          <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold rounded-lg">Xem phòng</Button>
                        </Link>
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
                            className={`max-w-[70%] rounded-2xl px-3 py-2 text-xs md:text-sm font-semibold shadow-sm leading-relaxed ${
                              isMe
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-muted text-foreground rounded-tl-none border border-border/60'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <span
                              className={`text-[8px] mt-1 block text-right font-bold ${
                                isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
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

                  {/* Nhập tin nhắn chat */}
                  <form onSubmit={handleSendChatMessage} className="p-3 border-t border-border/55 bg-card flex gap-2">
                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder="Nhập nội dung phản hồi..."
                      className="flex-grow h-10 px-3.5 rounded-xl border border-border bg-background text-xs md:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                    />
                    <Button type="submit" size="sm" className="h-10 w-10 p-0 flex items-center justify-center rounded-xl shadow-md glow-shadow-primary">
                      <Send size={15} />
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-muted/5">
                  <MessageSquare size={38} className="text-muted-foreground/30 mb-2" />
                  <p className="text-xs font-bold text-foreground">Chọn hội thoại liên hệ</p>
                  <p className="text-[10px] text-muted-foreground max-w-xs mt-1">
                    Chọn một hội thoại ở cột bên trái để trao đổi thông tin hoặc đặt câu hỏi với chủ phòng.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ĐÁNH GIÁ ĐÃ VIẾT */}
        {activeTab === 'reviews' && (
          <div className="space-y-4 animate-fade-in">
            {myReviews.length === 0 ? (
              <div className="glass-card p-12 rounded-2xl text-center shadow-sm max-w-md mx-auto mt-6">
                <Star size={38} className="text-muted-foreground/35 mx-auto mb-3" />
                <h3 className="text-sm font-extrabold text-foreground">Chưa có đánh giá nào</h3>
                <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs mx-auto leading-relaxed">
                  Bạn có thể viết đánh giá cho các phòng trọ sau khi xem thực tế để chia sẻ trải nghiệm cho người dùng khác.
                </p>
              </div>
            ) : (
              myReviews.map((rev) => {
                const room = rooms.find((r) => r.id === rev.roomId);
                return (
                  <div key={rev.id} className="p-5 rounded-2xl border border-border/80 bg-card shadow-sm flex flex-col gap-2.5">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        {room ? (
                          <Link href={`/rooms/${room.id}`} className="text-xs font-black text-foreground hover:text-primary leading-tight block">
                            {room.title}
                          </Link>
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground">Phòng trọ không khả dụng</span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 block">{rev.date}</span>
                      </div>
                      <div className="flex gap-0.5 text-amber-500 flex-shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < rev.rating ? 'fill-amber-500' : 'text-muted/30'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-muted-foreground leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
