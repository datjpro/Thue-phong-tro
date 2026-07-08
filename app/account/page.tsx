'use client';
 
import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/store/useAuth';
import { useRooms } from '@/store/useRooms';
import { useBookings } from '@/store/useBookings';
import { useFavorites } from '@/store/useFavorites';
import { useChats } from '@/store/useChats';
import { useBills, Bill } from '@/store/useBills';
import { useIssues, IssueReport } from '@/store/useIssues';
import { users } from '@/data/users';
import { branches } from '@/data/branches';
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
  Send,
  Receipt,
  AlertTriangle,
  CheckCircle,
  QrCode,
  DollarSign,
  Plus,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useToasts } from '@/store/useToasts';

export default function TenantAccountPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest animate-pulse">Đang tải tài khoản...</p>
        </div>
      </div>
    }>
      <TenantAccountContent />
    </Suspense>
  );
}

function TenantAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, loginAs, logout } = useAuth();
  const { rooms } = useRooms();
  const { bookings } = useBookings();
  const { favorites } = useFavorites();
  const { messages, sendMessage } = useChats();
  const { bills, payBill } = useBills();
  const { reports, addReport } = useIssues();
  const { addToast } = useToasts();

  const tabParam = searchParams.get('tab') as 'profile' | 'room' | 'bills' | 'issues' | 'bookings' | 'favorites' | 'chat' | null;
  const [activeTab, setActiveTab] = useState<'profile' | 'room' | 'bills' | 'issues' | 'bookings' | 'favorites' | 'chat'>('profile');

  // Đổi tab khi param thay đổi
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // States
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);

  // Form báo cáo sự cố mới
  const [issueTitle, setIssueTitle] = useState('');
  const [issueCategory, setIssueCategory] = useState<'dien-nuoc' | 'thiet-bi' | 'internet' | 'khac'>('dien-nuoc');
  const [issueDesc, setIssueDesc] = useState('');

  // Chat panel state
  const [chatText, setChatText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  // Bảo vệ trang (chỉ cho phép tenant)
  if (!currentUser || currentUser.role !== 'tenant') {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 shadow-sm">
            <Info size={24} />
          </div>
          <h2 className="text-xl font-black text-foreground tracking-tight">Vui lòng đăng nhập</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-2 max-w-xs font-semibold leading-relaxed">
            Bạn cần đăng nhập với tài khoản cư dân để truy cập Cổng Khách Thuê này.
          </p>
          <Button
            onClick={() => {
              const tenant = users.find((u) => u.role === 'tenant');
              if (tenant) loginAs('tenant', tenant.id);
            }}
            className="mt-6 font-extrabold text-xs rounded-xl shadow-md glow-shadow-primary"
          >
            Đăng nhập tài khoản Cư Dân
          </Button>
        </div>
      </div>
    );
  }

  // Phòng hiện tại đang thuê (giả định là room-2 thuộc chi nhánh Bình Thạnh)
  const myRentedRoom = rooms.find((r) => r.id === 'room-2');
  const myBranch = myRentedRoom ? branches.find((b) => b.id === myRentedRoom.branchId) : null;

  // Lọc dữ liệu cá nhân
  const myBills = bills.filter((b) => b.tenantId === currentUser.id);
  const myReports = reports.filter((r) => r.tenantId === currentUser.id);
  const myBookings = bookings.filter((b) => b.tenantId === currentUser.id);
  
  const favoriteRooms = rooms.filter((r) => favorites.includes(r.id));

  // Chat với chủ trọ đại diện (landlord-1)
  const chatMessages = messages.filter(
    (m) =>
      m.roomId === 'room-2' &&
      ((m.senderId === currentUser.id && m.receiverId === 'landlord-1') ||
        (m.senderId === 'landlord-1' && m.receiverId === currentUser.id))
  );

  // Gửi chat
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    sendMessage(currentUser.id, 'landlord-1', 'room-2', chatText.trim());
    setChatText('');
  };

  // Submit thanh toán hóa đơn
  const handleConfirmPayment = () => {
    if (!selectedBill) return;
    payBill(selectedBill.id, 'https://img.vietqr.io/image/demo-proof.png');
    addToast('Gửi yêu cầu thanh toán thành công! Đang chờ duyệt.', 'success');
    setIsPayModalOpen(false);
  };

  // Submit báo cáo sự cố mới
  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle.trim() || !issueDesc.trim()) {
      addToast('Vui lòng điền tiêu đề và mô tả sự cố!', 'error');
      return;
    }

    addReport({
      roomId: 'room-2',
      roomTitle: myRentedRoom?.title || 'Phòng 202',
      tenantId: currentUser.id,
      tenantName: currentUser.name,
      title: issueTitle.trim(),
      category: issueCategory,
      description: issueDesc.trim(),
    });

    addToast('Đã gửi báo cáo sự cố kỹ thuật thành công!', 'success');
    
    // Reset
    setIssueTitle('');
    setIssueDesc('');
    setIsNewIssueOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI: DANH SÁCH TABS VÀ PROFILE (4 Cột) */}
          <div className="lg:col-span-3 flex flex-col gap-6.5">
            {/* Thẻ Profile */}
            <div className="glass-card p-5.5 rounded-2xl shadow-sm flex flex-col items-center text-center">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-18 h-18 rounded-full object-cover border-2 border-primary/20 shadow-sm"
              />
              <h3 className="font-extrabold text-foreground mt-3 text-sm">{currentUser.name}</h3>
              <span className="text-[10px] text-muted-foreground font-semibold mt-0.5">{currentUser.email}</span>
              <Badge variant="default" className="text-[8px] mt-2.5 py-0.5 px-2.5">
                Cư Dân HomieStay
              </Badge>
            </div>

            {/* Menu Tabs */}
            <div className="glass-card rounded-2xl shadow-sm p-3 flex flex-col gap-1">
              {[
                { id: 'profile', label: 'Thông tin cá nhân', icon: <UserIcon size={14} /> },
                { id: 'room', label: 'Phòng đang thuê', icon: <Building size={14} /> },
                { id: 'bills', label: 'Hóa đơn & Thanh toán', icon: <Receipt size={14} />, badge: myBills.filter(b => b.status === 'unpaid').length },
                { id: 'issues', label: 'Báo cáo sự cố', icon: <AlertTriangle size={14} />, badge: myReports.filter(r => r.status === 'pending').length },
                { id: 'bookings', label: 'Lịch hẹn xem phòng', icon: <Calendar size={14} /> },
                { id: 'favorites', label: 'Phòng đã lưu', icon: <Heart size={14} /> },
                { id: 'chat', label: 'Liên hệ ban quản lý', icon: <MessageSquare size={14} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground glow-shadow-primary'
                      : 'hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && tab.badge > 0 ? (
                    <span className={`w-4.5 h-4.5 text-[9px] font-black rounded-full flex items-center justify-center ${
                      activeTab === tab.id ? 'bg-primary-foreground text-primary' : 'bg-rose-500 text-white'
                    }`}>
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: NỘI DUNG CHI TIẾT TABS (9 Cột) */}
          <div className="lg:col-span-9 flex flex-col gap-6.5">
            
            {/* TAB 1: THÔNG TIN CÁ NHÂN */}
            {activeTab === 'profile' && (
              <div className="glass-card p-6.5 rounded-2xl shadow-sm flex flex-col gap-6.5 animate-fade-in">
                <div className="border-b border-border/55 pb-3">
                  <h2 className="text-base font-black text-foreground uppercase tracking-wider">Hồ sơ cư dân</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5 text-xs font-semibold">
                  <Input label="Họ và tên" value={currentUser.name} disabled readOnly />
                  <Input label="Số điện thoại di động" value={currentUser.phone} disabled readOnly />
                  <Input label="Địa chỉ Email" value={currentUser.email} disabled readOnly />
                  <Input label="Số căn cước công dân" value="030099123456" disabled readOnly />
                </div>
                <div className="p-4 bg-muted/15 rounded-xl border border-border flex items-start gap-3 mt-2">
                  <Info className="text-primary mt-0.5 flex-shrink-0" size={16} />
                  <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
                    Thông tin cá nhân cư dân được bảo mật theo hợp đồng pháp lý của HomieStay Co-living. Để thay đổi các thông tin cơ bản này, quý cư dân vui lòng liên hệ trực tiếp với quản lý chi nhánh để thực hiện ký phụ lục hợp đồng thuê phòng.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: PHÒNG ĐANG THUÊ */}
            {activeTab === 'room' && (
              <div className="flex flex-col gap-6.5 animate-fade-in">
                {myRentedRoom && myBranch ? (
                  <>
                    {/* Thẻ phòng đang thuê */}
                    <div className="glass-card p-6 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6.5">
                      <img
                        src={myRentedRoom.images[0]}
                        alt=""
                        className="w-full md:w-56 aspect-[4/3] object-cover rounded-xl border border-border"
                      />
                      <div className="flex-grow flex flex-col justify-between">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <Badge variant="success">Đang thuê</Badge>
                            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                              {myBranch.name}
                            </Badge>
                          </div>
                          <h3 className="font-extrabold text-foreground text-sm leading-snug">{myRentedRoom.title}</h3>
                          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                            <MapPin size={12} className="text-primary" />
                            {myRentedRoom.address}
                          </span>
                        </div>
                        <div className="flex items-center gap-6.5 border-t border-border/45 pt-3.5 mt-4">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Tiền phòng/tháng</span>
                            <span className="text-sm font-extrabold text-primary mt-0.5">{myRentedRoom.price.toLocaleString('vi-VN')} đ</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Diện tích</span>
                            <span className="text-sm font-extrabold text-foreground mt-0.5">{myRentedRoom.area} m²</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">Mã phòng</span>
                            <span className="text-sm font-extrabold text-foreground mt-0.5">ROOM-202</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chi tiết hợp đồng */}
                    <div className="glass-card p-6.5 rounded-2xl shadow-sm flex flex-col gap-5">
                      <div className="border-b border-border/55 pb-2.5">
                        <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Thông tin hợp đồng thuê</h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div className="flex flex-col gap-0.5 p-3.5 bg-muted/15 rounded-xl border border-border/50">
                          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">Ngày bắt đầu</span>
                          <span className="text-xs font-bold text-foreground mt-0.5">15/05/2026</span>
                        </div>
                        <div className="flex flex-col gap-0.5 p-3.5 bg-muted/15 rounded-xl border border-border/50">
                          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">Thời hạn thuê</span>
                          <span className="text-xs font-bold text-foreground mt-0.5">12 tháng</span>
                        </div>
                        <div className="flex flex-col gap-0.5 p-3.5 bg-muted/15 rounded-xl border border-border/50">
                          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">Tiền đặt cọc</span>
                          <span className="text-xs font-bold text-primary mt-0.5">5.300.000 đ</span>
                        </div>
                        <div className="flex flex-col gap-0.5 p-3.5 bg-muted/15 rounded-xl border border-border/50">
                          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">Quản lý chi nhánh</span>
                          <span className="text-xs font-bold text-foreground mt-0.5">{myBranch.managerName}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="glass-card p-8 text-center text-xs text-muted-foreground font-bold rounded-2xl">
                    Hệ thống ghi nhận bạn chưa hoàn thành thủ tục check-in phòng trọ nào. Vui lòng đặt hẹn để ký hợp đồng.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: HÓA ĐƠN & THANH TOÁN */}
            {activeTab === 'bills' && (
              <div className="glass-card rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                <div className="p-4.5 border-b border-border/55 bg-muted/15">
                  <span className="text-xs font-black text-foreground uppercase tracking-wider">Lịch sử hóa đơn tiền phòng</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/20 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">
                        <th className="p-4">Tháng</th>
                        <th className="p-4">Nội dung chi tiết</th>
                        <th className="p-4 text-right">Tổng tiền</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-xs font-semibold">
                      {myBills.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-xs text-muted-foreground font-bold">
                            Chưa có hóa đơn nào được phát hành.
                          </td>
                        </tr>
                      ) : (
                        myBills.map((bill) => (
                          <tr key={bill.id} className="hover:bg-muted/10 transition-colors">
                            <td className="p-4 font-extrabold text-foreground">{bill.month}</td>
                            <td className="p-4">
                              <div className="flex flex-col text-[10px] text-muted-foreground font-semibold gap-0.5">
                                <span>• Điện tiêu thụ: {bill.electricity} kWh (3.5k/kWh)</span>
                                <span>• Nước sinh hoạt: {bill.water} khối (20k/khối)</span>
                                <span>• Dịch vụ (wifi + rác): {bill.service.toLocaleString('vi-VN')} đ</span>
                              </div>
                            </td>
                            <td className="p-4 text-right font-extrabold text-primary">
                              {bill.amount.toLocaleString('vi-VN')} đ
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
                                {bill.status === 'paid'
                                  ? 'Đã đóng'
                                  : bill.status === 'pending'
                                  ? 'Đang duyệt'
                                  : 'Chưa đóng'}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              {bill.status === 'unpaid' ? (
                                <Button
                                  onClick={() => {
                                    setSelectedBill(bill);
                                    setIsPayModalOpen(true);
                                  }}
                                  size="sm"
                                  className="h-8 text-[9px] font-black rounded-lg py-0 px-3.5 shadow-sm"
                                >
                                  Đóng tiền trọ
                                </Button>
                              ) : bill.status === 'pending' ? (
                                <span className="text-[10px] text-muted-foreground font-bold">Đang kiểm tra giao dịch</span>
                              ) : (
                                <span className="text-[10px] text-emerald-500 font-extrabold flex items-center justify-center gap-1">
                                  <CheckCircle size={12} />
                                  Đã thanh toán
                                </span>
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

            {/* TAB 4: BÁO CÁO SỰ CỐ */}
            {activeTab === 'issues' && (
              <div className="flex flex-col gap-6 animate-fade-in">
                {/* Header & Button */}
                <div className="flex justify-between items-center bg-card p-4.5 border border-border/80 rounded-2xl shadow-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-black text-foreground uppercase tracking-wider">Hỗ trợ kỹ thuật căn hộ</span>
                    <span className="text-[9px] text-muted-foreground font-bold">Đã gửi {myReports.length} yêu cầu bảo trì</span>
                  </div>
                  <Button
                    onClick={() => setIsNewIssueOpen(true)}
                    size="sm"
                    className="flex items-center gap-1.5 font-extrabold text-[10px] rounded-xl shadow-md"
                  >
                    <Plus size={14} />
                    Gửi báo sự cố mới
                  </Button>
                </div>

                {/* Danh sách các yêu cầu báo cáo */}
                <div className="space-y-4">
                  {myReports.length === 0 ? (
                    <div className="glass-card p-8 text-center text-xs text-muted-foreground font-bold rounded-2xl">
                      Phòng của bạn chưa gặp sự cố kỹ thuật nào. Mọi thiết bị vận hành bình thường!
                    </div>
                  ) : (
                    myReports.map((rep) => (
                      <div key={rep.id} className="glass-card p-5 flex flex-col gap-3 rounded-2xl border">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-0.5">
                            <h4 className="font-extrabold text-foreground text-sm">{rep.title}</h4>
                            <span className="text-[9px] text-muted-foreground font-semibold">
                              Gửi ngày: {rep.createdAt} • Phân loại:{' '}
                              {rep.category === 'dien-nuoc'
                                ? 'Điện nước'
                                : rep.category === 'thiet-bi'
                                ? 'Thiết bị gia dụng'
                                : rep.category === 'internet'
                                ? 'Mạng wifi'
                                : 'Khác'}
                            </span>
                          </div>
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
                            {rep.status === 'resolved' ? 'Đã sửa xong' : rep.status === 'processing' ? 'Đang xử lý' : 'Chờ duyệt'}
                          </Badge>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground/90 pl-1 leading-relaxed bg-muted/10 p-2.5 rounded-xl border border-border/40">
                          {rep.description}
                        </p>

                        {/* Note giải quyết nếu có */}
                        {rep.status === 'resolved' && rep.resolutionNote && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                            <CheckCircle size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span className="font-black text-[10px] uppercase tracking-wider">Kết quả xử lý từ Ban quản lý:</span>
                              <p className="mt-0.5 text-[11px] leading-relaxed font-bold">{rep.resolutionNote} (Xong ngày: {rep.resolvedAt})</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: LỊCH HẸN XEM PHÒNG */}
            {activeTab === 'bookings' && (
              <div className="glass-card rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                <div className="p-4.5 border-b border-border/55 bg-muted/15">
                  <span className="text-xs font-black text-foreground uppercase tracking-wider">Lịch hẹn gặp HomieStay</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/20 font-bold text-muted-foreground text-[10px] uppercase tracking-wider">
                        <th className="p-4">Phòng yêu cầu</th>
                        <th className="p-4">Ngày hẹn</th>
                        <th className="p-4">Khung giờ</th>
                        <th className="p-4">Hình thức</th>
                        <th className="p-4">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-xs font-semibold">
                      {myBookings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-xs text-muted-foreground font-bold">
                            Bạn chưa đăng ký lịch hẹn xem phòng nào.
                          </td>
                        </tr>
                      ) : (
                        myBookings.map((book) => {
                          const targetRoom = rooms.find((r) => r.id === book.roomId);
                          return (
                            <tr key={book.id} className="hover:bg-muted/10 transition-colors">
                              <td className="p-4 font-bold text-foreground">
                                {targetRoom ? targetRoom.title : 'Phòng đã bị xóa'}
                              </td>
                              <td className="p-4 font-bold">{book.bookingDate}</td>
                              <td className="p-4 font-bold">{book.bookingTime}</td>
                              <td className="p-4">
                                <Badge variant={book.type === 'deposit' ? 'default' : 'secondary'} className="text-[9px]">
                                  {book.type === 'deposit' ? 'Cọc giữ chỗ' : 'Lịch xem phòng'}
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
                                  {book.status === 'approved' ? 'Chấp nhận' : book.status === 'rejected' ? 'Từ chối' : 'Đang đợi duyệt'}
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

            {/* TAB 6: PHÒNG ĐÃ LƯU */}
            {activeTab === 'favorites' && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="border-b border-border/55 pb-3">
                  <h2 className="text-base font-black text-foreground uppercase tracking-wider">Tin đăng đã lưu yêu thích</h2>
                </div>
                {favoriteRooms.length === 0 ? (
                  <div className="glass-card p-8 text-center text-xs text-muted-foreground font-bold rounded-2xl">
                    Bạn chưa bấm lưu yêu thích phòng trọ nào.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6.5">
                    {favoriteRooms.map((room) => (
                      <RoomCard key={room.id} room={room} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: CHAT VỚI BAN QUẢN LÝ */}
            {activeTab === 'chat' && (
              <div className="glass-card rounded-2xl shadow-lg h-[460px] flex flex-col overflow-hidden animate-fade-in">
                {/* Header Chat */}
                <div className="p-3.5 border-b border-border/55 bg-muted/15 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      H
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-foreground">Ban Quản Lý HomieStay</span>
                      <span className="text-[8px] text-emerald-500 font-extrabold uppercase mt-0.5 tracking-wider">Hỗ trợ cư dân trực tuyến</span>
                    </div>
                  </div>
                </div>

                {/* Khung chat */}
                <div className="flex-grow overflow-y-auto p-4 space-y-3.5 flex flex-col bg-card">
                  {chatMessages.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-6 text-xs text-muted-foreground font-semibold">
                      <HelpCircle size={32} className="text-muted-foreground/35 mb-2 animate-bounce-short" />
                      Chào cư dân! Hãy đặt câu hỏi thắc mắc về tiền điện nước, bảo trì thiết bị,... Ban quản lý sẽ phản hồi bạn nhanh nhất có thể.
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-xs md:text-sm font-semibold shadow-sm leading-relaxed ${
                              isMe
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-muted text-foreground rounded-tl-none border border-border/70'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <span
                              className={`text-[8px] mt-1 block text-right font-bold ${
                                isMe ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Form chat input */}
                <form onSubmit={handleSendChat} className="p-3 border-t border-border/55 bg-background flex gap-2">
                  <input
                    type="text"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    placeholder="Nhập câu hỏi hỗ trợ gửi ban quản lý..."
                    className="flex-grow h-10 px-3.5 rounded-xl border border-border bg-card text-xs md:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                  />
                  <Button type="submit" size="sm" className="h-10 w-10 p-0 flex items-center justify-center rounded-xl shadow-md">
                    <Send size={15} />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* DIALOG 1: MODAL THANH TOÁN TIỀN PHÒNG */}
      <Dialog isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Thanh Toán Tiền Phòng" size="md">
        {selectedBill && (
          <div className="flex flex-col gap-4 p-1">
            <div className="p-4 bg-primary/10 border border-primary/25 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-sm">
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Hóa đơn cần thanh toán</span>
                <span className="text-sm font-black text-foreground mt-0.5">Tháng {selectedBill.month}</span>
              </div>
              <span className="text-sm font-black text-primary">{selectedBill.amount.toLocaleString('vi-VN')} đ</span>
            </div>

            {/* Qr code mock */}
            <div className="flex flex-col items-center justify-center p-5 border border-dashed border-border/90 rounded-2xl bg-muted/10 shadow-inner">
              <QrCode size={130} className="text-foreground animate-pulse" />
              <span className="text-[9px] text-primary font-black uppercase tracking-wider mt-3">Quét QR chuyển khoản nhanh</span>
              
              <div className="w-full border-t border-border/55 mt-4 pt-3.5 flex flex-col gap-1.5 text-xs text-foreground font-semibold">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tài khoản hưởng:</span>
                  <span className="font-extrabold text-foreground">HỆ THỐNG CO-LIVING HOMIESTAY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số tài khoản:</span>
                  <span className="font-extrabold text-foreground">1903 5678 9010</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngân hàng:</span>
                  <span className="font-extrabold text-foreground">Techcombank (TCB)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nội dung chuyển khoản:</span>
                  <span className="font-extrabold text-primary">HOMIESTAY ROOM202 {selectedBill.month.replace('/', '')}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs font-semibold text-rose-800 dark:text-rose-300">
              <AlertTriangle className="text-rose-500 mt-0.5 flex-shrink-0" size={16} />
              <p className="text-[10px] leading-relaxed font-bold">
                Cư dân chuyển đúng số tiền hóa đơn và nội dung chuyển khoản ở trên để hệ thống tự động quét nhận diện. Bấm "Xác nhận chuyển khoản" sau khi giao dịch thành công.
              </p>
            </div>

            <div className="flex gap-3 justify-end mt-2">
              <Button
                variant="outline"
                onClick={() => setIsPayModalOpen(false)}
                className="px-6.5 font-extrabold text-xs rounded-xl"
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmPayment}
                className="px-6.5 font-extrabold text-xs rounded-xl shadow-md glow-shadow-primary"
              >
                Xác nhận chuyển khoản
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* DIALOG 2: MODAL GỬI BÁO CÁO SỰ CỐ MỚI */}
      <Dialog isOpen={isNewIssueOpen} onClose={() => setIsNewIssueOpen(false)} title="Báo Cáo Sự Cố Thiết Bị Căn Hộ" size="md">
        <form onSubmit={handleCreateIssue} className="flex flex-col gap-4.5 p-1">
          <Input
            label="Tiêu đề sự cố kỹ thuật (Bắt buộc)"
            required
            placeholder="Ví dụ: Máy lạnh phòng 202 bị chảy nước, tắc cống toilet..."
            value={issueTitle}
            onChange={(e) => setIssueTitle(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Phân loại thiết bị</label>
            <select
              value={issueCategory}
              onChange={(e) => setIssueCategory(e.target.value as any)}
              className="h-11 w-full px-3.5 text-xs font-semibold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer shadow-sm"
            >
              <option value="dien-nuoc">Điện nước (Đèn cháy, rò nước,...)</option>
              <option value="thiet-bi">Thiết bị gia dụng (Điều hòa, tủ lạnh, bếp,...)</option>
              <option value="internet">Mạng internet (Không kết nối, chập chờn,...)</option>
              <option value="khac">Khác (Cửa kẹt, tường nứt, tiếng ồn,...)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Mô tả cụ thể hiện trạng</label>
            <textarea
              required
              rows={4}
              placeholder="Vui lòng ghi rõ hiện trạng hư hỏng thiết bị, thời gian bạn ở phòng để thợ qua kiểm tra sửa chữa..."
              value={issueDesc}
              onChange={(e) => setIssueDesc(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/25 text-foreground shadow-sm"
            />
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewIssueOpen(false)}
              className="px-6 font-extrabold text-xs rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="px-6 font-extrabold text-xs rounded-xl shadow-md glow-shadow-primary"
            >
              Gửi báo cáo sự cố
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
