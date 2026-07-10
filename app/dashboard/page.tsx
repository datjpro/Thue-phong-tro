'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/store/useAuth';
import { useRooms } from '@/store/useRooms';
import { useBookings } from '@/store/useBookings';
import { useChats } from '@/store/useChats';
import { useBills, Bill } from '@/store/useBills';
import { useIssues, IssueReport } from '@/store/useIssues';
import { users } from '@/data/users';
import { branches } from '@/data/branches';
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
  Check,
  X as XIcon,
  MessageSquare,
  Layers,
  Info,
  Send,
  AlertTriangle,
  Receipt,
  CheckCircle,
  Wrench,
  Search,
  MapPin,
  Maximize,
  Users as UsersIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useToasts } from '@/store/useToasts';
import { Room } from '@/data/rooms';

export default function LandlordDashboardPage() {
  const { currentUser, loginAs } = useAuth();
  const { rooms, addRoom, deleteRoom, updateRoomStatus } = useRooms();
  const { bookings, updateBookingStatus } = useBookings();
  const { messages, sendMessage } = useChats();
  const { bills, approveBill, addBill } = useBills();
  const { reports, updateReportStatus } = useIssues();
  const { addToast } = useToasts();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'rooms' | 'bookings' | 'bills' | 'issues' | 'chat'>('dashboard');
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
  const [newRoomBranchId, setNewRoomBranchId] = useState<string>('branch-1');

  // States cho xử lý sự cố (modal hoàn thành sửa chữa)
  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  // States cho tạo hóa đơn mới
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [billRoomId, setBillRoomId] = useState('');
  const [billMonth, setBillMonth] = useState('07/2026');
  const [billElectricity, setBillElectricity] = useState(100); // kWh
  const [billWater, setBillWater] = useState(4); // khối
  const [billService, setBillService] = useState(150000); // dịch vụ cố định

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

  // Bảo vệ trang (chỉ cho phép landlord/admin)
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
            Bạn cần đăng nhập tài khoản Ban Quản Trị để truy cập trang cấu hình và thống kê.
          </p>
          <Button
            onClick={() => {
              const landlord = users.find((u) => u.role === 'landlord');
              if (landlord) loginAs('landlord', landlord.id);
            }}
            className="mt-6 font-extrabold text-xs rounded-xl shadow-md glow-shadow-primary"
          >
            Đăng nhập Ban Quản Trị
          </Button>
        </div>
      </div>
    );
  }

  // Tính toán thống kê
  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;
  const rentedRoomsCount = rooms.filter((r) => r.status === 'rented').length;
  const reservedRoomsCount = rooms.filter((r) => r.status === 'reserved').length;
  const availableRoomsCount = rooms.filter((r) => r.status === 'available').length;
  
  const occupancyRate = rooms.length > 0 
    ? Math.round(((rentedRoomsCount + reservedRoomsCount) / rooms.length) * 100) 
    : 0;

  // Tổng doanh thu thực tế đã thu (Paid)
  const totalRevenueCollected = bills
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + b.amount, 0);

  // Doanh thu đang chờ duyệt (Pending)
  const totalRevenuePending = bills
    .filter((b) => b.status === 'pending')
    .reduce((sum, b) => sum + b.amount, 0);

  // Số lượng báo cáo sự cố chưa xử lý xong
  const activeIssuesCount = reports.filter((r) => r.status !== 'resolved').length;

  // P5: useMemo cho chart data — tránh re-calculate mỗi render
  const revenueChartData = useMemo(() => [
    { name: 'Tháng 5', DoanhThu: 12.5 },
    { name: 'Tháng 6', DoanhThu: 15.8 },
    { name: 'Tháng 7 (Thu)', DoanhThu: Number((totalRevenueCollected / 1000000).toFixed(1)) }
  ], [totalRevenueCollected]);

  // P5: useMemo cho pie data
  const pieChartData = useMemo(() => [
    { name: 'Trống', value: availableRoomsCount, color: '#10b981' }, // Emerald
    { name: 'Giữ cọc', value: reservedRoomsCount, color: '#f59e0b' }, // Amber
    { name: 'Đã thuê', value: rentedRoomsCount, color: '#6366f1' }, // Indigo/Purple
  ], [availableRoomsCount, reservedRoomsCount, rentedRoomsCount]);

  // Duyệt thanh toán
  const handleApproveBillPayment = (billId: string) => {
    approveBill(billId);
    addToast('Đã xác nhận thanh toán hóa đơn thành công!', 'success');
  };

  // Cập nhật trạng thái sự cố sang "Đang xử lý"
  const handleProcessReport = (reportId: string) => {
    updateReportStatus(reportId, 'processing');
    addToast('Đã chuyển trạng thái sang Đang xử lý sự cố.', 'info');
  };

  // Xác nhận đã khắc phục sự cố (Submit Modal)
  const handleResolveReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    updateReportStatus(selectedReport.id, 'resolved', resolutionNote.trim() || 'Đã kiểm tra sửa chữa xong.');
    addToast('Đã xác nhận khắc phục sự cố thành công!', 'success');
    setResolutionNote('');
    setIsResolveModalOpen(false);
    setSelectedReport(null);
  };

  // Duyệt yêu cầu đặt lịch
  const handleApproveBooking = (bookingId: string, roomId: string) => {
    updateBookingStatus(bookingId, 'approved');
    
    // Tự động chuyển trạng thái phòng nếu cọc giữ chỗ — dùng action thay vì mutate trực tiếp
    const bookingDetail = bookings.find(b => b.id === bookingId);
    if (bookingDetail?.type === 'deposit') {
      updateRoomStatus(roomId, 'reserved');
    }
    addToast('Đã chấp nhận lịch đặt hẹn!', 'success');
  };

  const handleRejectBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'rejected');
    addToast('Đã từ chối lịch hẹn', 'info');
  };

  const handleDeleteRoom = (roomId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa phòng trọ này khỏi hệ thống?')) {
      deleteRoom(roomId);
      addToast('Đã xóa phòng trọ', 'info');
    }
  };

  // Tạo hóa đơn mới
  const handleCreateBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billRoomId) {
      addToast('Vui lòng chọn phòng để phát hành hóa đơn!', 'error');
      return;
    }

    const targetRoom = rooms.find(r => r.id === billRoomId);
    if (!targetRoom) return;

    // Tính toán số tiền: Tiền phòng + điện (3500đ) + nước (20000đ) + phí dịch vụ
    const electricityCost = billElectricity * 3500;
    const waterCost = billWater * 20000;
    const totalAmount = targetRoom.price + electricityCost + waterCost + billService;

    addBill({
      roomId: billRoomId,
      roomTitle: targetRoom.title,
      tenantId: 'tenant-1', // Default tenant
      month: billMonth,
      amount: totalAmount,
      electricity: billElectricity,
      water: billWater,
      service: billService,
      status: 'unpaid'
    });

    addToast(`Đã phát hành hóa đơn thành công cho phòng ${targetRoom.title}!`, 'success');
    setIsAddBillOpen(false);
  };

  //gom các tin nhắn chat liên hệ
  const chatThreads = useMemo(() => {
    const threadsMap = new Map<string, { tenant: any; room: Room; lastMsg: string; time: string }>();
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
      branchId: newRoomBranchId
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
            <h1 className="text-xl md:text-3xl font-black text-foreground tracking-tight">Cổng Quản Trị HomieStay</h1>
            <p className="text-xs text-muted-foreground font-semibold mt-1">
              Hệ thống co-living đang vận hành <span className="text-primary font-bold">{rooms.length} phòng</span> trên 4 chi nhánh.
            </p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setIsAddBillOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 font-extrabold text-xs rounded-xl flex-1 sm:flex-none"
            >
              <Receipt size={15} />
              Tạo hóa đơn tháng
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              size="sm"
              className="flex items-center gap-1.5 font-extrabold text-xs rounded-xl shadow-md glow-shadow-primary flex-1 sm:flex-none"
            >
              <Plus size={15} />
              Đăng phòng mới
            </Button>
          </div>
        </div>

        {/* Tab điều khiển chính */}
        <div className="flex border-b border-border/55 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
          {[
            { id: 'dashboard', label: 'Tổng quan báo cáo', icon: <TrendingUp size={15} /> },
            { id: 'rooms', label: `Quản lý phòng trọ (${rooms.length})`, icon: <Building size={15} /> },
            { id: 'bills', label: `Duyệt thanh toán (${bills.filter(b => b.status === 'pending').length})`, icon: <Receipt size={15} /> },
            { id: 'issues', label: `Xử lý sự cố (${activeIssuesCount})`, icon: <AlertTriangle size={15} /> },
            { id: 'bookings', label: `Duyệt lịch hẹn (${bookings.filter(b => b.status === 'pending').length})`, icon: <Clock size={15} /> },
            { id: 'chat', label: `Hỗ trợ cư dân (${chatThreads.length})`, icon: <MessageSquare size={15} /> },
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

        {/* TAB 1: BÁO CÁO TỔNG QUAN */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-8.5 animate-fade-in">
            {/* Hàng Widget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Phòng đang vận hành', value: rooms.length, sub: 'Toàn hệ thống', icon: <Building className="text-primary" /> },
                { title: 'Tỉ lệ lấp đầy', value: `${occupancyRate}%`, sub: `${rentedRoomsCount} phòng đang ở`, icon: <Layers className="text-amber-500" /> },
                { title: 'Doanh thu tháng này', value: totalRevenueCollected.toLocaleString('vi-VN') + ' đ', sub: `Chờ duyệt: ${totalRevenuePending.toLocaleString('vi-VN')} đ`, icon: <DollarSign className="text-emerald-500 animate-pulse" /> },
                { title: 'Báo cáo sự cố', value: activeIssuesCount, sub: 'Yêu cầu cần bảo trì', icon: <AlertTriangle className="text-rose-500 animate-pulse" /> }
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
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Doanh thu thu tiền trọ (triệu VNĐ)</h3>
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
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Trạng thái phòng trống</h3>
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
                      <span className="text-[10px] text-muted-foreground font-semibold">Đang sử dụng</span>
                    </div>
                  </div>
                  <div className="flex justify-around text-[10px] font-black uppercase tracking-wider mt-1.5">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Trống</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Giữ cọc</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Đã thuê</div>
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
              <span className="text-xs font-black text-foreground uppercase tracking-wider">Danh sách phòng co-living</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tổng số: {rooms.length} phòng</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">
                    <th className="p-4">Hình ảnh / Tên phòng</th>
                    <th className="p-4">Thuộc chi nhánh</th>
                    <th className="p-4">Loại hình</th>
                    <th className="p-4">Đơn giá/tháng</th>
                    <th className="p-4">Diện tích</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs font-semibold">
                  {rooms.map((room) => {
                    const branch = branches.find(b => b.id === room.branchId);
                    return (
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
                              <span className="text-[10px] text-muted-foreground truncate block mt-0.5">{room.address}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-muted-foreground">
                          {branch ? branch.name : 'Chi nhánh trống'}
                        </td>
                        <td className="p-4 font-bold">
                          {room.type === 'phong-tro' ? 'Phòng trọ gác' : room.type === 'chung-cu-mini' ? 'Căn hộ Studio' : 'KTX / Ở ghép'}
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
                            {room.status === 'available' ? 'Còn trống' : room.status === 'reserved' ? 'Giữ chỗ cọc' : 'Đã thuê'}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all cursor-pointer border border-rose-500/20"
                            title="Xóa phòng"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DUYỆT THANH TOÁN TIỀN PHÒNG (BILLS) */}
        {activeTab === 'bills' && (
          <div className="glass-card rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <div className="p-4.5 border-b border-border/55 bg-muted/15">
              <span className="text-xs font-black text-foreground uppercase tracking-wider">Hóa đơn cần xác nhận thanh toán</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">
                    <th className="p-4">Phòng</th>
                    <th className="p-4">Tháng hóa đơn</th>
                    <th className="p-4 text-right">Tổng số tiền</th>
                    <th className="p-4">Giao dịch</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-center">Xử lý duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs font-semibold">
                  {bills.map((bill) => {
                    const tenant = users.find(u => u.id === bill.tenantId);
                    return (
                      <tr key={bill.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 font-bold text-foreground max-w-xs truncate">
                          {bill.roomTitle}
                        </td>
                        <td className="p-4 font-extrabold text-foreground">{bill.month}</td>
                        <td className="p-4 text-right font-extrabold text-primary">
                          {bill.amount.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-4">
                          {bill.status === 'pending' ? (
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[9px] font-bold text-amber-500 uppercase">Khách báo đã chuyển</span>
                              <a href={bill.paymentProof} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline font-extrabold">Xem ảnh minh chứng</a>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-semibold">Chưa có giao dịch</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              bill.status === 'paid'
                                ? 'success'
                                : bill.status === 'pending'
                                ? 'warning'
                                : 'danger'
                            }
                            className="text-[9px]"
                          >
                            {bill.status === 'paid' ? 'Đã thu tiền' : bill.status === 'pending' ? 'Chờ duyệt' : 'Chưa đóng'}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          {bill.status === 'pending' ? (
                            <Button
                              onClick={() => handleApproveBillPayment(bill.id)}
                              size="sm"
                              className="h-8 text-[9px] font-black rounded-lg py-0 px-3.5 shadow-sm"
                            >
                              Duyệt thanh toán
                            </Button>
                          ) : bill.status === 'paid' ? (
                            <span className="text-[10px] text-emerald-500 font-extrabold flex items-center justify-center gap-1">
                              <CheckCircle size={12} />
                              Hoàn tất
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/60 font-bold">Chờ khách đóng tiền</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: XỬ LÝ SỰ CỐ KỸ THUẬT (ISSUES) */}
        {activeTab === 'issues' && (
          <div className="glass-card rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <div className="p-4.5 border-b border-border/55 bg-muted/15">
              <span className="text-xs font-black text-foreground uppercase tracking-wider">Danh sách báo cáo hư hại kỹ thuật</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">
                    <th className="p-4">Cư dân / Phòng</th>
                    <th className="p-4">Tiêu đề báo cáo</th>
                    <th className="p-4">Chi tiết hư hại</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-center">Hành động khắc phục</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs font-semibold">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-muted-foreground font-bold">
                        Không có báo cáo sự cố nào cần xử lý.
                      </td>
                    </tr>
                  ) : (
                    reports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-foreground">{rep.tenantName}</span>
                            <span className="text-[10px] text-primary font-bold mt-0.5">{rep.roomTitle}</span>
                          </div>
                        </td>
                        <td className="p-4 max-w-xs font-bold text-foreground">
                          {rep.title}
                          <span className="block text-[9px] text-muted-foreground font-semibold mt-0.5">
                            Gửi ngày: {rep.createdAt} • Phân loại: {rep.category}
                          </span>
                        </td>
                        <td className="p-4 max-w-sm truncate text-muted-foreground" title={rep.description}>
                          {rep.description}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              rep.status === 'resolved'
                                ? 'success'
                                : rep.status === 'processing'
                                ? 'warning'
                                : 'outline'
                            }
                            className="text-[9px]"
                          >
                            {rep.status === 'resolved' ? 'Khắc phục xong' : rep.status === 'processing' ? 'Đang sửa' : 'Mới gửi'}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          {rep.status === 'pending' ? (
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => handleProcessReport(rep.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/20 transition-all font-black text-[9px] uppercase cursor-pointer"
                              >
                                Đang sửa
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedReport(rep);
                                  setIsResolveModalOpen(true);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 transition-all font-black text-[9px] uppercase cursor-pointer"
                              >
                                Xong
                              </button>
                            </div>
                          ) : rep.status === 'processing' ? (
                            <button
                              onClick={() => {
                                setSelectedReport(rep);
                                setIsResolveModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 transition-all font-black text-[9px] uppercase cursor-pointer"
                            >
                              Xác nhận xong
                            </button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/60 font-bold uppercase">Lưu kho dữ liệu</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: PHÊ DUYỆT YÊU CẦU ĐẶT LỊCH (BOOKINGS) */}
        {activeTab === 'bookings' && (
          <div className="glass-card rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <div className="p-4.5 border-b border-border/55 bg-muted/15">
              <span className="text-xs font-black text-foreground uppercase tracking-wider">Yêu cọc giữ chỗ & lịch hẹn từ khách hàng</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">
                    <th className="p-4">Khách hẹn</th>
                    <th className="p-4">Căn hộ yêu cầu</th>
                    <th className="p-4">Thời gian</th>
                    <th className="p-4">Hình thức</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-center">Xử lý duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs font-semibold">
                  {bookings.map((book) => {
                    const tenant = users.find((u) => u.id === book.tenantId);
                    const targetRoom = rooms.find((r) => r.id === book.roomId);
                    return (
                      <tr key={book.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4">
                          {tenant ? (
                            <div className="flex items-center gap-2">
                              <img src={tenant.avatar} alt="" className="w-7.5 h-7.5 rounded-full object-cover border border-border" />
                              <div className="flex flex-col">
                                <span className="font-extrabold text-foreground leading-none">{tenant.name}</span>
                                <span className="text-[9px] text-muted-foreground mt-0.5">{tenant.phone}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Khách nặc danh</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-foreground max-w-xs truncate">
                          {targetRoom ? targetRoom.title : 'Phòng đã xóa'}
                        </td>
                        <td className="p-4">
                          <span className="block font-bold">{book.bookingDate}</span>
                          <span className="text-[9px] text-muted-foreground mt-0.5 block">{book.bookingTime}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant={book.type === 'deposit' ? 'default' : 'secondary'} className="text-[9px]">
                            {book.type === 'deposit' ? 'Cọc giữ phòng' : 'Lịch hẹn xem'}
                          </Badge>
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
                            className="text-[9px]"
                          >
                            {book.status === 'approved' ? 'Chấp nhận' : book.status === 'rejected' ? 'Từ chối' : 'Đợi duyệt'}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          {book.status === 'pending' ? (
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => handleApproveBooking(book.id, book.roomId)}
                                className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20 transition-all cursor-pointer"
                              >
                                <Check size={13} />
                              </button>
                              <button
                                onClick={() => handleRejectBooking(book.id)}
                                className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all cursor-pointer"
                              >
                                <XIcon size={13} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/60 font-bold uppercase">Xong</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: HỖ TRỢ CHAT CƯ DÂN */}
        {activeTab === 'chat' && (
          <div className="glass-card rounded-2xl shadow-lg h-[540px] flex overflow-hidden animate-fade-in">
            {/* Cột trái: Luồng chat */}
            <div className="w-1/3 border-r border-border/55 flex flex-col h-full bg-muted/10">
              <div className="p-4 border-b border-border/55 bg-card">
                <h3 className="font-black text-xs text-foreground uppercase tracking-wider">Tin nhắn cư dân</h3>
              </div>
              
              <div className="flex-grow overflow-y-auto divide-y divide-border/45">
                {chatThreads.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground/80 font-bold">
                    Chưa có cư dân liên hệ.
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
                        <span className="text-[9px] text-primary truncate mt-0.5 font-bold">Căn hộ: {thread.room.title}</span>
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
                            <span className="text-[9px] text-muted-foreground font-semibold">Cư dân phòng: {activeThread.room.title}</span>
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
                    <Button type="submit" size="sm" className="h-10 w-10 p-0 flex items-center justify-center rounded-xl shadow-md">
                      <Send size={15} />
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-muted/5">
                  <MessageSquare size={38} className="text-muted-foreground/30 mb-2 animate-bounce-short" />
                  <p className="text-xs font-bold text-foreground">Chọn cuộc hội thoại</p>
                  <p className="text-[10px] text-muted-foreground max-w-xs mt-1">
                    Chọn một cư dân gửi tin nhắn liên hệ ở danh sách bên trái để phản hồi hỗ trợ.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* DIALOG 1: MODAL ĐĂNG PHÒNG TRỌ MỚI */}
      <Dialog isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Đăng Tin Phòng Trọ Mới" size="xl">
        <form onSubmit={handleCreateRoom} className="flex flex-col gap-4 p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tiêu đề tin đăng (Bắt buộc)"
              required
              placeholder="Ví dụ: Phòng Studio khép kín ban công gần FTU..."
              value={newRoomTitle}
              onChange={(e) => setNewRoomTitle(e.target.value)}
            />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Loại hình</label>
              <select
                value={newRoomType}
                onChange={(e) => setNewRoomType(e.target.value as any)}
                className="h-11 w-full px-3.5 text-xs font-semibold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-sm"
              >
                <option value="phong-tro">Phòng đơn gác lửng</option>
                <option value="chung-cu-mini">Căn hộ Studio khép kín</option>
                <option value="o-ghep">Ở ghép giường tầng KTX</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Thành phố</label>
              <select
                value={newRoomCity}
                onChange={(e) => setNewRoomCity(e.target.value as any)}
                className="h-11 w-full px-3.5 text-xs font-semibold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-sm"
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

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Thuộc chi nhánh</label>
              <select
                value={newRoomBranchId}
                onChange={(e) => setNewRoomBranchId(e.target.value)}
                className="h-11 w-full px-3.5 text-xs font-semibold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-sm"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Địa chỉ chi tiết (Bắt buộc)"
              required
              placeholder="Ví dụ: Số 12 Ngõ 99 Nguyễn Phong Sắc..."
              value={newRoomAddress}
              onChange={(e) => setNewRoomAddress(e.target.value)}
            />

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
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Tiện ích kèm theo</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl border border-border bg-muted/10">
              {amenitiesList.map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newRoomAmenities.includes(item.id)}
                    onChange={() => handleAmenityCheck(item.id)}
                    className="w-4 h-4 rounded border-border text-primary accent-primary cursor-pointer focus:ring-primary/20"
                  />
                  {item.name}
                </label>
              ))}
            </div>
          </div>

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
              placeholder="Mô tả cụ thể về bàn giao nội thất, chi phí điện nước chi nhánh..."
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
              Đăng phòng mới
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DIALOG 2: MODAL XÁC NHẬN SỬA SỰ CỐ XONG */}
      <Dialog isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} title="Xác Nhận Khắc Phục Sự Cố" size="md">
        {selectedReport && (
          <form onSubmit={handleResolveReportSubmit} className="flex flex-col gap-4 p-1">
            <div className="p-4 bg-muted/20 border border-border rounded-xl text-xs font-semibold flex flex-col gap-1 shadow-sm">
              <span className="text-[10px] font-black text-muted-foreground uppercase">Sự cố đang xử lý</span>
              <span className="font-extrabold text-foreground text-sm">{selectedReport.title}</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{selectedReport.description}</p>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Nội dung / Báo cáo giải trình đã khắc phục</label>
              <textarea
                required
                rows={3}
                placeholder="Ghi cụ thể kết quả sửa chữa (Ví dụ: Đã thay thế vòi nước mới, Đã cho thợ bảo trì nạp ga điều hòa...)"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/25 text-foreground shadow-sm"
              />
            </div>

            <div className="flex gap-3 justify-end mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResolveModalOpen(false)}
                className="px-6.5 font-extrabold text-xs rounded-xl"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="px-6.5 font-extrabold text-xs rounded-xl shadow-md glow-shadow-primary"
              >
                Khắc phục xong
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* DIALOG 3: MODAL TẠO HÓA ĐƠN MỚI */}
      <Dialog isOpen={isAddBillOpen} onClose={() => setIsAddBillOpen(false)} title="Phát Hành Hóa Đơn Tiền Phòng Mới" size="md">
        <form onSubmit={handleCreateBillSubmit} className="flex flex-col gap-4 p-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Chọn phòng phát hành (Khách đang ở)</label>
            <select
              value={billRoomId}
              onChange={(e) => setBillRoomId(e.target.value)}
              className="h-11 w-full px-3.5 text-xs font-semibold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-sm"
            >
              <option value="">Lựa chọn phòng căn hộ</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.status === 'rented' ? 'Đã thuê' : 'Trống'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kỳ hóa đơn (Tháng)"
              required
              placeholder="07/2026"
              value={billMonth}
              onChange={(e) => setBillMonth(e.target.value)}
            />
            <Input
              label="Số điện tiêu thụ (kWh)"
              type="number"
              required
              placeholder="120"
              value={billElectricity}
              onChange={(e) => setBillElectricity(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Khối nước tiêu thụ"
              type="number"
              required
              placeholder="4"
              value={billWater}
              onChange={(e) => setBillWater(Number(e.target.value))}
            />
            <Input
              label="Phí dịch vụ cố định (VNĐ)"
              type="number"
              required
              placeholder="150000"
              value={billService}
              onChange={(e) => setBillService(Number(e.target.value))}
            />
          </div>

          <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-[10px] text-muted-foreground font-semibold leading-relaxed">
            Hệ thống tự động tính toán tổng số tiền: Tiền phòng cơ bản + Điện (3.5k/kWh) + Nước (20k/khối) + Phí dịch vụ cố định.
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddBillOpen(false)}
              className="px-6 font-extrabold text-xs rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="px-6 font-extrabold text-xs rounded-xl shadow-md glow-shadow-primary"
            >
              Phát hành ngay
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
