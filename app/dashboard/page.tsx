'use client';
 
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/store/useAuth';
import { useRooms } from '@/store/useRooms';
import { useBookings } from '@/store/useBookings';
import { useChats } from '@/store/useChats';
import { useToasts } from '@/store/useToasts';
import { users } from '@/data/users';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Building,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  Trash2,
  Edit,
  Check,
  X as XIcon,
  MessageSquare,
  Star,
  Layers,
  MapPin,
  Maximize,
  Users as UsersIcon,
  Info,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Room } from '@/data/rooms';

export default function LandlordDashboardPage() {
  const { currentUser, loginAs } = useAuth();
  const { rooms, addRoom, deleteRoom } = useRooms();
  const { bookings, updateBookingStatus } = useBookings();
  const { messages, sendMessage } = useChats();
  const { addToast } = useToasts();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'rooms' | 'bookings' | 'chat'>('dashboard');
  const [mounted, setMounted] = useState(false);

  // States cho modal thêm phòng mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomType, setNewRoomType] = useState<'phong-tro' | 'chung-cu-mini' | 'o-ghep'>('phong-tro');
  const [newRoomCity, setNewRoomCity] = useState<'Hồ Chí Minh' | 'Hà Nội'>('Hồ Chí Minh');
  const [newRoomDistrict, setNewRoomDistrict] = useState('');
  const [newRoomAddress, setNewRoomAddress] = useState('');
  const [newRoomPrice, setNewRoomPrice] = useState(3000000);
  const [newRoomArea, setNewRoomArea] = useState(25);
  const [newRoomMaxTenants, setNewRoomMaxTenants] = useState(3);
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomAmenities, setNewRoomAmenities] = useState<string[]>([]);
  const [newRoomImageUrls, setNewRoomImageUrls] = useState<string>('');

  // States cho landlord chat
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cuộn xuống cuối tin nhắn
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChatUserId, selectedChatRoomId, activeTab]);

  // Bảo vệ trang (chỉ cho phép landlord)
  if (!currentUser || currentUser.role !== 'landlord') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 shadow-sm">
            <Info size={24} />
          </div>
          <h2 className="text-xl font-black text-foreground tracking-tight">Truy cập bị từ chối</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-2 max-w-xs font-semibold leading-relaxed">
            Bạn cần đăng nhập tài khoản với vai trò **Chủ Nhà (Landlord)** để truy cập trang dashboard quản lý này.
          </p>
          <Button
            onClick={() => {
              const landlord = users.find((u) => u.role === 'landlord');
              if (landlord) loginAs('landlord', landlord.id);
            }}
            className="mt-6 font-extrabold text-xs rounded-xl shadow-md glow-shadow-primary"
          >
            Đăng nhập vai Chủ Nhà nhanh
          </Button>
        </div>
      </div>
    );
  }

  // Lọc dữ liệu thuộc về chủ trọ này
  const myRooms = rooms.filter((r) => r.landlordId === currentUser.id);
  const myBookings = bookings.filter((b) => b.landlordId === currentUser.id);

  // Tính toán thống kê
  const pendingBookingsCount = myBookings.filter((b) => b.status === 'pending').length;
  const rentedRoomsCount = myRooms.filter((r) => r.status === 'rented').length;
  const reservedRoomsCount = myRooms.filter((r) => r.status === 'reserved').length;
  const availableRoomsCount = myRooms.filter((r) => r.status === 'available').length;
  
  const occupancyRate = myRooms.length > 0 
    ? Math.round(((rentedRoomsCount + reservedRoomsCount) / myRooms.length) * 100) 
    : 0;

  // Tính doanh thu hàng tháng ước tính (chỉ lấy các phòng rented)
  const estimatedRevenue = myRooms
    .filter((r) => r.status === 'rented')
    .reduce((sum, r) => sum + r.price, 0);

  // Dữ liệu biểu đồ doanh thu giả lập
  const revenueChartData = [
    { name: 'T2', DoanhThu: Math.round(estimatedRevenue * 0.75 / 1000000) },
    { name: 'T3', DoanhThu: Math.round(estimatedRevenue * 0.8 / 1000000) },
    { name: 'T4', DoanhThu: Math.round(estimatedRevenue * 0.85 / 1000000) },
    { name: 'T5', DoanhThu: Math.round(estimatedRevenue * 0.9 / 1000000) },
    { name: 'T6', DoanhThu: Math.round(estimatedRevenue * 0.95 / 1000000) },
    { name: 'T7 (HT)', DoanhThu: Math.round(estimatedRevenue / 1000000) },
  ];

  // Dữ liệu biểu đồ Pie trạng thái phòng
  const pieChartData = [
    { name: 'Trống', value: availableRoomsCount, color: '#10b981' }, // Emerald
    { name: 'Giữ cọc', value: reservedRoomsCount, color: '#f59e0b' }, // Amber
    { name: 'Đã thuê', value: rentedRoomsCount, color: '#ef4444' }, // Red
  ];

  // Các chức năng xử lý
  const handleApproveBooking = (bookingId: string, roomId: string) => {
    updateBookingStatus(bookingId, 'approved');
    
    // Tự động chuyển trạng thái phòng nếu cọc giữ chỗ
    const bookingDetail = bookings.find(b => b.id === bookingId);
    if (bookingDetail?.type === 'deposit') {
      const roomToUpdate = rooms.find(r => r.id === roomId);
      if (roomToUpdate) {
        roomToUpdate.status = 'reserved';
      }
    }
    
    // Thêm feedback thông báo
    addToast('Đã phê duyệt yêu cầu đặt hẹn thành công!', 'success');
  };

  const handleRejectBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'rejected');
    addToast('Đã từ chối yêu cầu', 'info');
  };

  const handleDeleteRoom = (roomId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa phòng trọ này?')) {
      deleteRoom(roomId);
      addToast('Đã xóa phòng trọ', 'info');
    }
  };

  // Quản lý Chat phía Landlord
  // Gom các tin nhắn chat liên quan đến chủ nhà này thành các cuộc hội thoại
  // Lọc ra các tenant liên hệ
  const chatThreads = useMemo(() => {
    const threadsMap = new Map<string, { tenant: any; room: Room; lastMsg: string; time: string }>();
    
    // Lọc các tin nhắn nhận/gửi của chủ nhà
    const landlordMsgs = messages.filter(m => m.senderId === currentUser.id || m.receiverId === currentUser.id);
    
    landlordMsgs.forEach(msg => {
      const isSender = msg.senderId === currentUser.id;
      const tenantId = isSender ? msg.receiverId : msg.senderId;
      const tenant = users.find(u => u.id === tenantId);
      const room = rooms.find(r => r.id === msg.roomId);
      
      if (tenant && room) {
        const threadKey = `${tenantId}-${msg.roomId}`;
        threadsMap.set(threadKey, {
          tenant,
          room,
          lastMsg: msg.text,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });

    return Array.from(threadsMap.entries()).map(([key, data]) => ({
      key,
      tenantId: key.split('-')[0],
      roomId: key.split('-')[1],
      ...data
    }));
  }, [messages, currentUser.id, rooms]);

  // Cuộc trò chuyện đang chọn
  const activeChatMessages = useMemo(() => {
    if (!selectedChatUserId || !selectedChatRoomId) return [];
    return messages.filter(
      (m) =>
        m.roomId === selectedChatRoomId &&
        ((m.senderId === currentUser.id && m.receiverId === selectedChatUserId) ||
          (m.senderId === selectedChatUserId && m.receiverId === currentUser.id))
    );
  }, [messages, selectedChatUserId, selectedChatRoomId, currentUser.id]);

  const handleSendLandlordMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !selectedChatUserId || !selectedChatRoomId) return;

    sendMessage(currentUser.id, selectedChatUserId, selectedChatRoomId, chatInputText.trim());
    setChatInputText('');
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomTitle || !newRoomDistrict || !newRoomAddress) {
      addToast('Vui lòng nhập đầy đủ các thông tin bắt buộc!', 'error');
      return;
    }

    // Tách các link ảnh
    let imagesArr = ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'];
    if (newRoomImageUrls.trim()) {
      imagesArr = newRoomImageUrls.split('\n').filter(url => url.trim() !== '');
    }

    const newId = `room-${Date.now()}`;
    addRoom({
      id: newId,
      title: newRoomTitle.trim(),
      type: newRoomType,
      city: newRoomCity,
      district: newRoomDistrict.trim(),
      address: newRoomAddress.trim(),
      price: newRoomPrice,
      area: newRoomArea,
      maxTenants: newRoomMaxTenants,
      description: newRoomDesc.trim(),
      amenities: newRoomAmenities,
      images: imagesArr,
      status: 'available',
      rating: 5.0,
      createdAt: new Date().toISOString(),
      landlordId: currentUser.id,
    });

    addToast('Đăng phòng trọ mới thành công!', 'success');
    
    // Reset Form & Đóng Modal
    setNewRoomTitle('');
    setNewRoomDistrict('');
    setNewRoomAddress('');
    setNewRoomPrice(3000000);
    setNewRoomArea(25);
    setNewRoomMaxTenants(3);
    setNewRoomDesc('');
    setNewRoomAmenities([]);
    setNewRoomImageUrls('');
    setIsAddModalOpen(false);
  };

  const handleAmenityCheck = (amenityId: string) => {
    const checked = newRoomAmenities.includes(amenityId);
    if (checked) {
      setNewRoomAmenities(newRoomAmenities.filter(id => id !== amenityId));
    } else {
      setNewRoomAmenities([...newRoomAmenities, amenityId]);
    }
  };

  const amenitiesList = [
    { id: 'wifi', name: 'Wifi tốc độ cao' },
    { id: 'dieu-hoa', name: 'Máy lạnh/Điều hòa' },
    { id: 'gac-lung', name: 'Gác lửng' },
    { id: 'xe-may', name: 'Chỗ để xe máy' },
    { id: 'gio-tu-do', name: 'Giờ giấc tự do' },
    { id: 'bep', name: 'Bếp nấu ăn' },
    { id: 'may-giat', name: 'Máy giặt' },
    { id: 'tu-lanh', name: 'Tủ lạnh' },
    { id: 'tu-quan-ao', name: 'Tủ quần áo' },
    { id: 'ban-cong', name: 'Ban công thoáng' },
    { id: 'bao-ve', name: 'Bảo vệ an ninh' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 lg:py-10">
        {/* Tiêu đề & Vai trò */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-5 border-b border-border/40">
          <div>
            <h1 className="text-xl md:text-3xl font-black text-foreground tracking-tight">Kênh Quản Lý Chủ Trọ</h1>
            <p className="text-xs text-muted-foreground font-semibold mt-1">
              Xin chào, <span className="text-primary font-bold">{currentUser.name}</span>. Bạn đang quản lý {myRooms.length} tin đăng phòng trọ.
            </p>
          </div>
          
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="flex items-center gap-1.5 font-extrabold text-xs rounded-xl shadow-md glow-shadow-primary w-full sm:w-auto"
          >
            <Plus size={16} />
            Đăng phòng trọ mới
          </Button>
        </div>

        {/* Tab điều khiển chính */}
        <div className="flex border-b border-border/55 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
          {[
            { id: 'dashboard', label: 'Tổng quan báo cáo', icon: <TrendingUp size={15} /> },
            { id: 'rooms', label: `Quản lý tin đăng (${myRooms.length})`, icon: <Building size={15} /> },
            { id: 'bookings', label: `Duyệt lịch hẹn (${myBookings.length})`, icon: <Clock size={15} /> },
            { id: 'chat', label: `Hội thoại chat (${chatThreads.length})`, icon: <MessageSquare size={15} /> },
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

        {/* TAB 1: BÁO CÁO TỔNG QUAN */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-8.5 animate-fade-in">
            {/* Hàng Widget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Tổng số phòng trọ', value: myRooms.length, sub: 'Đang quản lý', icon: <Building className="text-primary" /> },
                { title: 'Tỉ lệ lấp đầy', value: `${occupancyRate}%`, sub: `${rentedRoomsCount} phòng đang thuê`, icon: <Layers className="text-amber-500" /> },
                { title: 'Ước tính doanh thu', value: estimatedRevenue.toLocaleString('vi-VN') + ' đ', sub: 'Ước tính thực tế hàng tháng', icon: <DollarSign className="text-emerald-500 animate-pulse" /> },
                { title: 'Yêu cầu chờ duyệt', value: pendingBookingsCount, sub: 'Khách hàng đang đợi', icon: <Clock className="text-rose-500 animate-pulse" /> }
              ].map((w, idx) => (
                <div key={idx} className="glass-card p-5.5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{w.title}</span>
                    <span className="text-lg md:text-xl font-black text-foreground">{w.value}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">{w.sub}</span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {w.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Khối Biểu đồ */}
            {mounted && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Biểu đồ Doanh thu (BarChart) */}
                <div className="lg:col-span-2 glass-card p-5.5 rounded-2xl shadow-sm flex flex-col gap-4">
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Doanh thu 6 tháng qua (triệu VNĐ)</h3>
                  <div className="h-64 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                        <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="DoanhThu" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Biểu đồ cơ cấu phòng (PieChart) */}
                <div className="glass-card p-5.5 rounded-2xl shadow-sm flex flex-col gap-4">
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Trạng thái lấp đầy</h3>
                  <div className="h-60 relative flex items-center justify-center mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieChartData.filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xl md:text-2xl font-black text-foreground">{occupancyRate}%</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">Đã lấp đầy</span>
                    </div>
                  </div>
                  {/* Chú giải */}
                  <div className="flex justify-around text-[10px] font-black uppercase tracking-wider mt-1.5">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Trống</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Giữ cọc</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Đã thuê</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: QUẢN LÝ TIN ĐĂNG (ROOMS) */}
        {activeTab === 'rooms' && (
          <div className="glass-card rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <div className="p-4.5 border-b border-border/55 bg-muted/15 flex justify-between items-center">
              <span className="text-xs font-black text-foreground uppercase tracking-wider">Danh sách tin đăng sở hữu</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tổng số: {myRooms.length} tin</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">
                    <th className="p-4">Hình ảnh / Tiêu đề</th>
                    <th className="p-4">Loại phòng</th>
                    <th className="p-4">Giá thuê / tháng</th>
                    <th className="p-4">Diện tích</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs font-semibold">
                  {myRooms.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground/80 font-bold">
                        Bạn chưa đăng thông tin phòng trọ nào. Nhấn "Đăng phòng trọ mới" ở trên để bắt đầu.
                      </td>
                    </tr>
                  ) : (
                    myRooms.map((room) => (
                      <tr key={room.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 max-w-sm">
                          <div className="flex items-center gap-3">
                            <img
                              src={room.images[0]}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg border border-border"
                            />
                            <div className="flex flex-col truncate">
                              <span className="font-extrabold text-foreground truncate">{room.title}</span>
                              <span className="text-[10px] text-muted-foreground truncate block mt-0.5">{room.district}, {room.city}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold">
                          {room.type === 'phong-tro' ? 'Phòng trọ' : room.type === 'chung-cu-mini' ? 'Chung cư mini' : 'Ở ghép KTX'}
                        </td>
                        <td className="p-4 font-extrabold text-primary">
                          {room.price.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-4 font-bold">{room.area} m²</td>
                        <td className="p-4">
                          <Badge
                            variant={
                              room.status === 'available'
                                ? 'success'
                                : room.status === 'reserved'
                                ? 'warning'
                                : 'danger'
                            }
                            className="text-[9px]"
                          >
                            {room.status === 'available' ? 'Còn trống' : room.status === 'reserved' ? 'Giữ chỗ' : 'Đã thuê'}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all cursor-pointer hover:scale-105 active:scale-95 border border-rose-500/20"
                              title="Xóa phòng"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PHÊ DUYỆT YÊU CẦU ĐẶT LỊCH (BOOKINGS) */}
        {activeTab === 'bookings' && (
          <div className="glass-card rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <div className="p-4.5 border-b border-border/55 bg-muted/15">
              <span className="text-xs font-black text-foreground uppercase tracking-wider">Yêu cầu đặt cọc & lịch hẹn từ khách hàng</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">
                    <th className="p-4">Khách thuê</th>
                    <th className="p-4">Phòng yêu cầu</th>
                    <th className="p-4">Thời gian hẹn</th>
                    <th className="p-4">Hình thức</th>
                    <th className="p-4">Ghi chú</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-center">Xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs font-semibold">
                  {myBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs text-muted-foreground/80 font-bold">
                        Chưa nhận được yêu cầu hẹn lịch hay đặt cọc nào từ khách thuê.
                      </td>
                    </tr>
                  ) : (
                    myBookings.map((book) => {
                      const tenant = users.find((u) => u.id === book.tenantId);
                      const targetRoom = rooms.find((r) => r.id === book.roomId);
                      return (
                        <tr key={book.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-4">
                            {tenant ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={tenant.avatar}
                                  alt=""
                                  className="w-7.5 h-7.5 rounded-full object-cover border border-border"
                                />
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-foreground leading-none">{tenant.name}</span>
                                  <span className="text-[9px] text-muted-foreground mt-0.5">{tenant.phone}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Khách không xác định</span>
                            )}
                          </td>
                          <td className="p-4 max-w-xs">
                            {targetRoom ? (
                              <Link href={`/rooms/${targetRoom.id}`} className="hover:text-primary font-bold line-clamp-1">
                                {targetRoom.title}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">Phòng đã bị xóa</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="block font-bold">{book.bookingDate}</span>
                            <span className="text-[9px] text-muted-foreground block mt-0.5">{book.bookingTime}</span>
                          </td>
                          <td className="p-4">
                            <Badge variant={book.type === 'deposit' ? 'default' : 'secondary'} className="text-[9px]">
                              {book.type === 'deposit' ? 'Giữ chỗ đặt cọc' : 'Lịch hẹn xem'}
                            </Badge>
                          </td>
                          <td className="p-4 text-xs font-medium text-muted-foreground max-w-xs truncate" title={book.note}>
                            {book.note || 'Không ghi chú'}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                book.status === 'approved'
                                  ? 'success'
                                  : book.status === 'rejected'
                                  ? 'danger'
                                  : 'warning'
                              }
                              className="text-[9px] py-0.5 px-2"
                            >
                              {book.status === 'approved' ? 'Đã duyệt' : book.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                            </Badge>
                          </td>
                          <td className="p-4 text-center">
                            {book.status === 'pending' ? (
                              <div className="flex justify-center gap-1.5">
                                <button
                                  onClick={() => handleApproveBooking(book.id, book.roomId)}
                                  className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                  title="Phê duyệt"
                                >
                                  <Check size={13} />
                                </button>
                                <button
                                  onClick={() => handleRejectBooking(book.id)}
                                  className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                  title="Từ chối"
                                >
                                  <XIcon size={13} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">Hoàn tất</span>
                            )}
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

        {/* TAB 4: HỘI THOẠI CHAT (LANDLORD CHAT) */}
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
                  chatThreads.map((thread: any) => (
                    <button
                      key={thread.key}
                      onClick={() => {
                        setSelectedChatUserId(thread.tenantId);
                        setSelectedChatRoomId(thread.roomId);
                      }}
                      className={`w-full text-left p-3.5 flex gap-3 transition-colors cursor-pointer border-l-3 ${
                        selectedChatUserId === thread.tenantId && selectedChatRoomId === thread.roomId
                          ? 'bg-primary/5 border-l-primary'
                          : 'hover:bg-muted/10 border-l-transparent'
                      }`}
                    >
                      <img
                        src={thread.tenant.avatar}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-border"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground truncate">{thread.tenant.name}</span>
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
              {selectedChatUserId && selectedChatRoomId ? (
                <>
                  {/* Header Chat */}
                  {(() => {
                    const activeThread = chatThreads.find(
                      (t: any) => t.tenantId === selectedChatUserId && t.roomId === selectedChatRoomId
                    );
                    return activeThread ? (
                      <div className="p-3 border-b border-border/55 bg-muted/10 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={activeThread.tenant.avatar}
                            alt=""
                            className="w-8.5 h-8.5 rounded-full object-cover border border-border"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{activeThread.tenant.name}</span>
                            <span className="text-[9px] text-muted-foreground font-semibold">Khách thuê • Hỏi phòng: {activeThread.room.title}</span>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Nội dung tin nhắn chat */}
                  <div className="flex-grow overflow-y-auto p-4 space-y-3 flex flex-col">
                    {activeChatMessages.map((msg: any) => {
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
                  <form onSubmit={handleSendLandlordMessage} className="p-3 border-t border-border/55 bg-card flex gap-2">
                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder="Nhập nội dung phản hồi nhanh..."
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
                  <p className="text-xs font-bold text-foreground">Chọn cuộc hội thoại</p>
                  <p className="text-[10px] text-muted-foreground max-w-xs mt-1">
                    Chọn một tin nhắn hỏi thăm ở danh sách bên trái để phản hồi hỗ trợ khách hàng.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL THÊM PHÒNG TRỌ MỚI */}
      <Dialog isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Đăng Tin Phòng Trọ Mới" size="xl">
        <form onSubmit={handleCreateRoom} className="flex flex-col gap-4 p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tiêu đề tin đăng (Bắt buộc)"
              required
              placeholder="Ví dụ: Phòng trọ khép kín full nội thất gần ĐH Ngoại Thương..."
              value={newRoomTitle}
              onChange={(e) => setNewRoomTitle(e.target.value)}
            />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Loại hình</label>
              <select
                value={newRoomType}
                onChange={(e) => setNewRoomType(e.target.value as any)}
                className="h-11 w-full px-3.5 text-xs font-semibold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-inner"
              >
                <option value="phong-tro">Phòng trọ truyền thống</option>
                <option value="chung-cu-mini">Chung cư mini khép kín</option>
                <option value="o-ghep">Ở ghép / KTX giường tầng</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Thành phố</label>
              <select
                value={newRoomCity}
                onChange={(e) => setNewRoomCity(e.target.value as any)}
                className="h-11 w-full px-3.5 text-xs font-semibold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-inner"
              >
                <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
              </select>
            </div>

            <Input
              label="Quận / Huyện (Bắt buộc)"
              required
              placeholder="Ví dụ: Bình Thạnh, Cầu Giấy..."
              value={newRoomDistrict}
              onChange={(e) => setNewRoomDistrict(e.target.value)}
            />

            <Input
              label="Địa chỉ chi tiết (Bắt buộc)"
              required
              placeholder="Ví dụ: Số 12 Ngõ 99 Nguyễn Chí Thanh..."
              value={newRoomAddress}
              onChange={(e) => setNewRoomAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Giá thuê / tháng (VNĐ)"
              type="number"
              min={100000}
              required
              placeholder="3000000"
              value={newRoomPrice}
              onChange={(e) => setNewRoomPrice(Number(e.target.value))}
            />

            <Input
              label="Diện tích (m²)"
              type="number"
              min={5}
              required
              placeholder="25"
              value={newRoomArea}
              onChange={(e) => setNewRoomArea(Number(e.target.value))}
            />

            <Input
              label="Số người ở tối đa"
              type="number"
              min={1}
              required
              placeholder="3"
              value={newRoomMaxTenants}
              onChange={(e) => setNewRoomMaxTenants(Number(e.target.value))}
            />
          </div>

          {/* Tiện ích check */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Tiện ích kèm theo</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl border border-border/80 bg-muted/10">
              {amenitiesList.map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newRoomAmenities.includes(item.id)}
                    onChange={() => handleAmenityCheck(item.id)}
                    className="w-4 h-4 rounded border-border/80 text-primary accent-primary cursor-pointer focus:ring-primary/20"
                  />
                  {item.name}
                </label>
              ))}
            </div>
          </div>

          {/* Link hình ảnh */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Đường dẫn hình ảnh (Một link mỗi dòng)</span>
              <span className="text-[9px] text-muted-foreground font-semibold lowercase">Bỏ trống để dùng ảnh mặc định</span>
            </label>
            <textarea
              placeholder="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af...&#10;https://images.unsplash.com/photo-1598928506311-c55ded91a20c..."
              rows={3}
              value={newRoomImageUrls}
              onChange={(e) => setNewRoomImageUrls(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/25 text-foreground shadow-inner"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Mô tả phòng chi tiết</label>
            <textarea
              placeholder="Mô tả cụ thể về giao thông đi lại, nội thất bàn giao, chi phí điện nước phát sinh..."
              rows={4}
              value={newRoomDesc}
              onChange={(e) => setNewRoomDesc(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/25 text-foreground shadow-inner"
            />
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="px-6 font-extrabold text-xs rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="px-6 font-extrabold text-xs rounded-xl shadow-md glow-shadow-primary"
            >
              Đăng tin ngay
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
