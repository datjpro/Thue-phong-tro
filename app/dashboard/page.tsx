'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/store/useAuth';
import { useRooms } from '@/store/useRooms';
import { useBookings } from '@/store/useBookings';
import { useChats } from '@/store/useChats';
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
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { useToasts } from '@/store/useToasts';
import { Room } from '@/data/rooms';

export default function LandlordDashboard() {
  const { currentUser, loginAs } = useAuth();
  const { rooms, addRoom, updateRoom, deleteRoom, reviews } = useRooms();
  const { bookings, updateBookingStatus } = useBookings();
  const { messages, sendMessage } = useChats();
  const { addToast } = useToasts();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'bookings' | 'reviews' | 'chat'>('overview');
  const [mounted, setMounted] = useState(false);

  // States cho modal thêm phòng mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomType, setNewRoomType] = useState<'phong-tro' | 'chung-cu-mini' | 'o-ghep'>('phong-tro');
  const [newRoomPrice, setNewRoomPrice] = useState('');
  const [newRoomArea, setNewRoomArea] = useState('');
  const [newRoomMaxTenants, setNewRoomMaxTenants] = useState('2');
  const [newRoomCity, setNewRoomCity] = useState<'Hồ Chí Minh' | 'Hà Nội'>('Hồ Chí Minh');
  const [newRoomDistrict, setNewRoomDistrict] = useState('');
  const [newRoomAddress, setNewRoomAddress] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomAmenities, setNewRoomAmenities] = useState<string[]>([]);

  // States cho chat dashboard
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);
  const [chatInputText, setChatInputText] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bảo vệ màn hình (chỉ cho phép landlord truy cập)
  if (!currentUser || currentUser.role !== 'landlord') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
            <Info size={28} />
          </div>
          <h2 className="text-xl font-bold text-foreground">Truy cập bị từ chối</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
            Bạn cần đăng nhập tài khoản với vai trò **Chủ Nhà Trọ (Landlord)** để truy cập trang quản trị này.
          </p>
          <Button
            onClick={() => {
              const landlord = users.find((u) => u.role === 'landlord');
              if (landlord) loginAs('landlord', landlord.id);
            }}
            className="mt-5 font-bold"
          >
            Đăng nhập vai Chủ Nhà Trọ nhanh
          </Button>
        </div>
      </div>
    );
  }

  // Lọc dữ liệu của riêng landlord này
  const myRooms = rooms.filter((r) => r.landlordId === currentUser.id);
  const myBookings = bookings.filter((b) => b.landlordId === currentUser.id);
  
  // Lấy các đánh giá của các phòng thuộc landlord này
  const myRoomIds = myRooms.map((r) => r.id);
  const myReviews = reviews.filter((rev) => myRoomIds.includes(rev.roomId));

  // Tỉ lệ lấp đầy
  const rentedRoomsCount = myRooms.filter((r) => r.status === 'rented').length;
  const occupancyRate = myRooms.length > 0 ? Math.round((rentedRoomsCount / myRooms.length) * 100) : 0;

  // Doanh thu ước tính (tổng tiền các phòng đã cho thuê)
  const estimatedRevenue = myRooms
    .filter((r) => r.status === 'rented' || r.status === 'reserved')
    .reduce((sum, r) => sum + r.price, 0);

  // Số lượng yêu cầu đang chờ duyệt
  const pendingBookingsCount = myBookings.filter((b) => b.status === 'pending').length;

  // Mock dữ liệu biểu đồ doanh thu theo tháng (triệu VNĐ)
  const revenueChartData = [
    { name: 'T2', DoanhThu: estimatedRevenue / 1000000 * 0.8 },
    { name: 'T3', DoanhThu: estimatedRevenue / 1000000 * 0.85 },
    { name: 'T4', DoanhThu: estimatedRevenue / 1000000 * 0.9 },
    { name: 'T5', DoanhThu: estimatedRevenue / 1000000 * 0.95 },
    { name: 'T6', DoanhThu: estimatedRevenue / 1000000 },
    { name: 'T7', DoanhThu: estimatedRevenue / 1000000 }
  ];

  // Dữ liệu biểu đồ tròn cơ cấu phòng
  const pieChartData = [
    { name: 'Còn trống', value: myRooms.filter(r => r.status === 'available').length, color: '#10b981' },
    { name: 'Đang giữ cọc', value: myRooms.filter(r => r.status === 'reserved').length, color: '#f59e0b' },
    { name: 'Đã cho thuê', value: myRooms.filter(r => r.status === 'rented').length, color: '#ef4444' }
  ];

  // Xử lý thêm phòng mới
  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomTitle || !newRoomPrice || !newRoomArea || !newRoomDistrict || !newRoomAddress) {
      addToast('Vui lòng điền đầy đủ thông tin phòng trọ!', 'error');
      return;
    }

    const price = Number(newRoomPrice);
    const area = Number(newRoomArea);
    const maxTenants = Number(newRoomMaxTenants);

    const createdRoom: Room = {
      id: `room-${Date.now()}`,
      title: newRoomTitle,
      type: newRoomType,
      price,
      area,
      maxTenants,
      address: newRoomAddress,
      district: newRoomDistrict,
      city: newRoomCity,
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80'
      ],
      amenities: newRoomAmenities,
      description: newRoomDesc || 'Phòng trọ dịch vụ cao cấp, đầy đủ tiện nghi, giờ giấc tự quản tự do.',
      status: 'available',
      rating: 5.0,
      landlordId: currentUser.id,
      createdAt: new Date().toISOString().split('T')[0]
    };

    addRoom(createdRoom);
    addToast('Đã thêm phòng trọ mới thành công!', 'success');
    
    // Reset form
    setNewRoomTitle('');
    setNewRoomPrice('');
    setNewRoomArea('');
    setNewRoomDistrict('');
    setNewRoomAddress('');
    setNewRoomDesc('');
    setNewRoomAmenities([]);
    setIsAddModalOpen(false);
  };

  const handleToggleAmenity = (amenityId: string) => {
    setNewRoomAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleApproveBooking = (bookingId: string, type: 'viewing' | 'deposit', roomId: string) => {
    // Duyệt yêu cầu đặt lịch
    updateBookingStatus(bookingId, 'approved');
    
    // Nếu là đặt cọc giữ chỗ thành công thì cập nhật trạng thái phòng trọ thành "reserved" (đã giữ chỗ)
    if (type === 'deposit') {
      updateRoom(roomId, { status: 'reserved' });
    }
    addToast('Đã phê duyệt yêu cầu thành công!', 'success');
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

  const handleSendDashboardMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !selectedChatUserId || !selectedChatRoomId) return;

    sendMessage(currentUser.id, selectedChatUserId, selectedChatRoomId, chatInputText.trim());
    setChatInputText('');
  };

  const amenitiesList = [
    { id: 'wifi', name: 'Wifi' },
    { id: 'dieu-hoa', name: 'Máy lạnh' },
    { id: 'gac-lung', name: 'Gác lửng' },
    { id: 'xe-may', name: 'Chỗ đỗ xe' },
    { id: 'gio-tu-do', name: 'Giờ tự do' },
    { id: 'bep', name: 'Nhà bếp' },
    { id: 'may-giat', name: 'Máy giặt' },
    { id: 'tu-lanh', name: 'Tủ lạnh' },
    { id: 'tu-quan-ao', name: 'Tủ áo' },
    { id: 'ban-cong', name: 'Ban công' },
    { id: 'bao-ve', name: 'Bảo vệ' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-muted/5">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Banner tiêu đề */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt=""
              className="w-14 h-14 rounded-full object-cover border-2 border-primary"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-black text-foreground">Chào anh, {currentUser.name}!</h1>
              <p className="text-xs text-muted-foreground font-semibold">
                Chào mừng tới trang quản trị chủ trọ. Quản lý trạng thái phòng và tương tác khách hàng.
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="w-full md:w-auto font-bold flex items-center justify-center gap-1.5"
          >
            <Plus size={16} />
            Đăng phòng trọ mới
          </Button>
        </div>

        {/* Cấu trúc thanh Tabs điều khiển */}
        <div className="flex border-b border-border mb-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          {[
            { id: 'overview', label: 'Thống kê tổng quan', icon: <TrendingUp size={16} /> },
            { id: 'rooms', label: `Quản lý phòng trọ (${myRooms.length})`, icon: <Building size={16} /> },
            { id: 'bookings', label: `Yêu cầu lịch hẹn (${myBookings.length})`, icon: <Clock size={16} /> },
            { id: 'reviews', label: `Đánh giá nhận được (${myReviews.length})`, icon: <Star size={16} /> },
            { id: 'chat', label: 'Tin nhắn khách thuê', icon: <MessageSquare size={16} /> }
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

        {/* NỘI DUNG CHUYỂN TABS */}
        
        {/* TẦN 1: TỔNG QUAN (OVERVIEW) */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            {/* Hàng widget số liệu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Tổng số phòng trọ', value: myRooms.length, sub: 'Đang sở hữu', icon: <Building className="text-blue-500" /> },
                { title: 'Tỉ lệ lấp đầy', value: `${occupancyRate}%`, sub: `${rentedRoomsCount} phòng đang thuê`, icon: <Layers className="text-emerald-500" /> },
                { title: 'Doanh thu hàng tháng', value: estimatedRevenue.toLocaleString('vi-VN') + ' đ', sub: 'Ước tính thực tế', icon: <DollarSign className="text-amber-500" /> },
                { title: 'Yêu cầu chờ duyệt', value: pendingBookingsCount, sub: 'Cần phản hồi gấp', icon: <Clock className="text-rose-500" /> }
              ].map((w, idx) => (
                <div key={idx} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{w.title}</span>
                    <span className="text-xl md:text-2xl font-black text-foreground">{w.value}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">{w.sub}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center">
                    {w.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Khối Biểu đồ (chỉ vẽ khi mount) */}
            {mounted && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Biểu đồ Doanh thu (BarChart) */}
                <div className="lg:col-span-2 bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Doanh thu 6 tháng qua (triệu VNĐ)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                        <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="DoanhThu" fill="#d95d14" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Biểu đồ cơ cấu phòng (PieChart) */}
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Trạng thái lấp đầy</h3>
                  <div className="h-60 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
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
                      <span className="text-2xl font-black text-foreground">{occupancyRate}%</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">Đã lấp đầy</span>
                    </div>
                  </div>
                  {/* Chú giải */}
                  <div className="flex justify-around text-xs font-semibold">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Trống</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Giữ cọc</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Đã thuê</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TẦN 2: QUẢN LÝ PHÒNG TRỌ (ROOMS) */}
        {activeTab === 'rooms' && (
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-border bg-muted/10 flex justify-between items-center">
              <span className="text-sm font-bold text-foreground">Danh sách phòng sở hữu</span>
              <span className="text-xs text-muted-foreground font-semibold">Tổng số: {myRooms.length} phòng</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 font-bold text-muted-foreground">
                    <th className="p-4">Hình ảnh / Tiêu đề</th>
                    <th className="p-4">Loại phòng</th>
                    <th className="p-4">Giá thuê / tháng</th>
                    <th className="p-4">Diện tích</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {myRooms.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground font-semibold">
                        Bạn chưa đăng thông tin phòng trọ nào. Nhấn "Đăng phòng trọ mới" để bắt đầu.
                      </td>
                    </tr>
                  ) : (
                    myRooms.map((room) => (
                      <tr key={room.id} className="hover:bg-muted/10 font-medium">
                        <td className="p-4 max-w-sm">
                          <div className="flex items-center gap-3">
                            <img
                              src={room.images[0]}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg border border-border"
                            />
                            <div className="flex flex-col truncate">
                              <span className="font-extrabold text-foreground truncate">{room.title}</span>
                              <span className="text-[10px] text-muted-foreground truncate">{room.district}, {room.city}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {room.type === 'phong-tro' ? 'Phòng trọ' : room.type === 'chung-cu-mini' ? 'Chung cư mini' : 'Ở ghép'}
                        </td>
                        <td className="p-4 font-bold text-primary">
                          {room.price.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-4">{room.area} m²</td>
                        <td className="p-4">
                          <Badge
                            variant={
                              room.status === 'available'
                                ? 'success'
                                : room.status === 'reserved'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {room.status === 'available' ? 'Còn trống' : room.status === 'reserved' ? 'Giữ chỗ' : 'Đã thuê'}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer"
                              title="Xóa phòng"
                            >
                              <Trash2 size={14} />
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

        {/* TẦN 3: PHÊ DUYỆT YÊU CẦU ĐẶT LỊCH (BOOKINGS) */}
        {activeTab === 'bookings' && (
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-border bg-muted/10">
              <span className="text-sm font-bold text-foreground">Yêu cầu xem phòng / Đặt cọc từ khách thuê</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 font-bold text-muted-foreground">
                    <th className="p-4">Khách thuê</th>
                    <th className="p-4">Phòng yêu cầu</th>
                    <th className="p-4">Thời gian hẹn</th>
                    <th className="p-4">Hình thức</th>
                    <th className="p-4">Ghi chú</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-center">Xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {myBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground font-semibold">
                        Chưa nhận được yêu cầu hẹn lịch hay đặt chỗ nào từ khách hàng.
                      </td>
                    </tr>
                  ) : (
                    myBookings.map((book) => {
                      const tenant = users.find((u) => u.id === book.tenantId);
                      const targetRoom = rooms.find((r) => r.id === book.roomId);
                      return (
                        <tr key={book.id} className="hover:bg-muted/10 font-medium">
                          <td className="p-4">
                            {tenant ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={tenant.avatar}
                                  alt=""
                                  className="w-7 h-7 rounded-full object-cover"
                                />
                                <div className="flex flex-col">
                                  <span className="font-bold text-foreground">{tenant.name}</span>
                                  <span className="text-[10px] text-muted-foreground">{tenant.phone}</span>
                                </div>
                              </div>
                            ) : (
                              'Khách thuê ẩn danh'
                            )}
                          </td>
                          <td className="p-4 max-w-xs truncate">
                            <span className="font-semibold text-foreground block truncate">{targetRoom?.title || 'Phòng đã bị xóa'}</span>
                            <span className="text-[10px] text-muted-foreground">{targetRoom?.district}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-foreground block">{book.bookingDate}</span>
                            <span className="text-[10px] text-muted-foreground">{book.bookingTime}</span>
                          </td>
                          <td className="p-4">
                            <Badge variant={book.type === 'deposit' ? 'default' : 'secondary'}>
                              {book.type === 'deposit' ? 'Đặt cọc giữ phòng' : 'Xem phòng trọ'}
                            </Badge>
                          </td>
                          <td className="p-4 max-w-xs truncate text-[11px] text-muted-foreground italic font-medium">
                            {book.note || 'Không có ghi chú'}
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
                                ? 'Đang chờ duyệt'
                                : book.status === 'approved'
                                ? 'Đã duyệt'
                                : book.status === 'completed'
                                ? 'Đã hoàn thành'
                                : 'Đã từ chối'}
                            </Badge>
                          </td>
                          <td className="p-4 text-center">
                            {book.status === 'pending' ? (
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleApproveBooking(book.id, book.type, book.roomId)}
                                  className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 cursor-pointer"
                                  title="Phê duyệt"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => handleRejectBooking(book.id)}
                                  className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 cursor-pointer"
                                  title="Từ chối"
                                >
                                  <XIcon size={14} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground/80 font-bold">—</span>
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

        {/* TẦN 4: ĐÁNH GIÁ NHẬN ĐƯỢC (REVIEWS) */}
        {activeTab === 'reviews' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {myReviews.length === 0 ? (
              <div className="bg-card border border-border p-8 rounded-xl text-center shadow-sm">
                <p className="text-sm font-semibold text-muted-foreground">Chưa có đánh giá nào từ khách thuê.</p>
              </div>
            ) : (
              myReviews.map((rev) => {
                const targetRoom = rooms.find((r) => r.id === rev.roomId);
                return (
                  <div key={rev.id} className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.userAvatar}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{rev.userName}</span>
                          <span className="text-[10px] text-muted-foreground">Đánh giá vào: {rev.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < rev.rating ? 'fill-amber-500' : 'text-muted/30'}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="pl-1">
                      <p className="text-xs md:text-sm font-medium text-muted-foreground italic">"{rev.comment}"</p>
                      {targetRoom && (
                        <span className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded font-semibold mt-2 inline-block">
                          Đánh giá phòng: {targetRoom.title}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TẦN 5: CHAT KHÁCH THUÊ (CHAT) */}
        {activeTab === 'chat' && (
          <div className="bg-card border border-border rounded-2xl shadow-lg h-[550px] flex overflow-hidden animate-fade-in">
            {/* Cột trái: Luồng chat (Chat list) */}
            <div className="w-1/3 border-r border-border flex flex-col h-full bg-muted/5">
              <div className="p-4 border-b border-border bg-card">
                <h3 className="font-extrabold text-sm text-foreground">Hội thoại liên hệ</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto divide-y divide-border/60">
                {chatThreads.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground font-semibold">
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
                      className={`w-full text-left p-3.5 flex gap-3 transition-colors cursor-pointer ${
                        selectedChatUserId === thread.tenantId && selectedChatRoomId === thread.roomId
                          ? 'bg-primary/5 border-l-4 border-primary'
                          : 'hover:bg-muted/10'
                      }`}
                    >
                      <img
                        src={thread.tenant.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-border"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground truncate">{thread.tenant.name}</span>
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
              {selectedChatUserId && selectedChatRoomId ? (
                <>
                  {/* Header Chat */}
                  {(() => {
                    const activeThread = chatThreads.find(
                      (t: any) => t.tenantId === selectedChatUserId && t.roomId === selectedChatRoomId
                    );
                    return activeThread ? (
                      <div className="p-3 border-b border-border bg-muted/10 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={activeThread.tenant.avatar}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-border"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{activeThread.tenant.name}</span>
                            <span className="text-[9px] text-muted-foreground">Khách thuê • Hỏi phòng: {activeThread.room.title}</span>
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
                  </div>

                  {/* Thanh gửi tin nhắn */}
                  <form onSubmit={handleSendDashboardMessage} className="p-3 border-t border-border bg-card flex gap-2">
                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder="Trả lời khách thuê..."
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
      </main>

      {/* DIALOG THÊM PHÒNG TRỌ MỚI */}
      <Dialog isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Đăng tin cho thuê phòng trọ mới" size="xl">
        <form onSubmit={handleAddRoom} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Tiêu đề đăng tin:</label>
            <input
              type="text"
              value={newRoomTitle}
              onChange={(e) => setNewRoomTitle(e.target.value)}
              placeholder="Ví dụ: Phòng trọ khép kín gác lửng mới tinh..."
              required
              className="h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Loại hình phòng:</label>
            <select
              value={newRoomType}
              onChange={(e) => setNewRoomType(e.target.value as any)}
              className="h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="phong-tro">Phòng trọ bình dân</option>
              <option value="chung-cu-mini">Chung cư mini dịch vụ</option>
              <option value="o-ghep">Ở ghép / Ký túc xá</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Giá thuê (VNĐ / tháng):</label>
            <input
              type="number"
              value={newRoomPrice}
              onChange={(e) => setNewRoomPrice(e.target.value)}
              placeholder="Ví dụ: 3000000"
              required
              className="h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Diện tích sử dụng (m²):</label>
            <input
              type="number"
              value={newRoomArea}
              onChange={(e) => setNewRoomArea(e.target.value)}
              placeholder="Ví dụ: 25"
              required
              className="h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Thành phố:</label>
            <select
              value={newRoomCity}
              onChange={(e) => setNewRoomCity(e.target.value as any)}
              className="h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Hà Nội">Hà Nội</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Quận / Huyện:</label>
            <input
              type="text"
              value={newRoomDistrict}
              onChange={(e) => setNewRoomDistrict(e.target.value)}
              placeholder="Ví dụ: Quận 7 hoặc Cầu Giấy"
              required
              className="h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Địa chỉ chi tiết:</label>
            <input
              type="text"
              value={newRoomAddress}
              onChange={(e) => setNewRoomAddress(e.target.value)}
              placeholder="Ví dụ: Số 29 Đường 17, Phường Tân Quy..."
              required
              className="h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Mô tả phòng trọ:</label>
            <textarea
              value={newRoomDesc}
              onChange={(e) => setNewRoomDesc(e.target.value)}
              placeholder="Nhập mô tả về nội thất, giờ giấc sinh hoạt..."
              rows={3}
              className="p-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Chọn tiện ích */}
          <div className="flex flex-col gap-2.5 md:col-span-2">
            <span className="text-xs font-bold text-muted-foreground uppercase">Chọn các tiện ích có sẵn:</span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-40 overflow-y-auto pr-1">
              {amenitiesList.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={newRoomAmenities.includes(item.id)}
                    onChange={() => handleToggleAmenity(item.id)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                  {item.name}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              className="font-bold text-xs"
            >
              Hủy bỏ
            </Button>
            <Button type="submit" className="font-bold text-xs">
              Đăng tin phòng trọ
            </Button>
          </div>
        </form>
      </Dialog>

      {/* FOOTER */}
      <footer className="bg-card border-t border-border py-6 text-center text-xs text-muted-foreground font-semibold mt-12">
        <span>HomieStay © 2026. Demo Web Thuê Phòng Trọ Client-Side.</span>
      </footer>
    </div>
  );
}
