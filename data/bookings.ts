export interface Booking {
  id: string;
  roomId: string;
  tenantId: string;
  landlordId: string;
  bookingDate: string;
  bookingTime: string;
  type: 'viewing' | 'deposit'; // xem phòng | đặt cọc giữ chỗ
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  price: number;
  note: string;
}

export const bookings: Booking[] = [
  {
    id: 'book-1',
    roomId: 'room-1',
    tenantId: 'tenant-1',
    landlordId: 'landlord-1',
    bookingDate: '2026-07-10',
    bookingTime: '09:30',
    type: 'viewing',
    status: 'approved',
    price: 3200000,
    note: 'Em muốn qua xem trực tiếp phòng trọ gác lửng vào cuối tuần này.'
  },
  {
    id: 'book-2',
    roomId: 'room-3',
    tenantId: 'tenant-2',
    landlordId: 'landlord-1',
    bookingDate: '2026-07-09',
    bookingTime: '15:00',
    type: 'viewing',
    status: 'pending',
    price: 1800000,
    note: 'Xem phòng lúc 3h chiều ngày mai được không ạ?'
  },
  {
    id: 'book-3',
    roomId: 'room-8',
    tenantId: 'tenant-3',
    landlordId: 'landlord-4',
    bookingDate: '2026-07-05',
    bookingTime: '10:00',
    type: 'deposit',
    status: 'completed',
    price: 7500000,
    note: 'Đã chuyển cọc giữ chỗ 1 tháng thuê phòng Hồ Tây.'
  },
  {
    id: 'book-4',
    roomId: 'room-5',
    tenantId: 'tenant-4',
    landlordId: 'landlord-4',
    bookingDate: '2026-07-12',
    bookingTime: '18:30',
    type: 'viewing',
    status: 'pending',
    price: 6000000,
    note: 'Hẹn xem phòng ngoài giờ hành chính.'
  }
];
