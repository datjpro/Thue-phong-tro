export interface User {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  role: 'tenant' | 'landlord';
  // Thuộc tính dành cho chủ trọ (landlord)
  yearsActive?: number;
  roomsCount?: number;
  rating?: number;
  // Thuộc tính dành cho khách thuê (tenant)
  history?: string[]; // Danh sách roomId đã thuê trước đây
  email: string;
}

export const users: User[] = [
  // Chủ trọ (Landlords)
  {
    id: 'landlord-1',
    name: 'Nguyễn Văn Hùng',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', // Nữ/Nam avatar
    phone: '0912 345 678',
    role: 'landlord',
    yearsActive: 5,
    roomsCount: 8,
    rating: 4.8,
    email: 'hung.nguyen@example.com'
  },
  {
    id: 'landlord-2',
    name: 'Trần Thị Mai',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    phone: '0987 654 321',
    role: 'landlord',
    yearsActive: 8,
    roomsCount: 12,
    rating: 4.9,
    email: 'mai.tran@example.com'
  },
  {
    id: 'landlord-3',
    name: 'Lê Hoàng Nam',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    phone: '0909 123 456',
    role: 'landlord',
    yearsActive: 3,
    roomsCount: 5,
    rating: 4.5,
    email: 'nam.le@example.com'
  },
  {
    id: 'landlord-4',
    name: 'Phạm Thanh Thủy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    phone: '0933 987 654',
    role: 'landlord',
    yearsActive: 10,
    roomsCount: 15,
    rating: 4.9,
    email: 'thuy.pham@example.com'
  },
  {
    id: 'landlord-5',
    name: 'Hoàng Minh Đức',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    phone: '0977 111 222',
    role: 'landlord',
    yearsActive: 4,
    roomsCount: 6,
    rating: 4.6,
    email: 'duc.hoang@example.com'
  },

  // Khách thuê (Tenants)
  {
    id: 'tenant-1',
    name: 'Lê Minh Triết',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    phone: '0944 555 666',
    role: 'tenant',
    history: ['room-2', 'room-5'],
    email: 'triet.le@student.edu.vn'
  },
  {
    id: 'tenant-2',
    name: 'Nguyễn Thảo Vy',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    phone: '0966 777 888',
    role: 'tenant',
    history: ['room-1'],
    email: 'vy.nguyen@gmail.com'
  },
  {
    id: 'tenant-3',
    name: 'Phạm Đức Anh',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    phone: '0988 999 000',
    role: 'tenant',
    history: ['room-8'],
    email: 'ducanh.pham@work.com'
  },
  {
    id: 'tenant-4',
    name: 'Vũ Hải Yến',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    phone: '0911 222 333',
    role: 'tenant',
    history: [],
    email: 'yen.vu@outlook.com'
  },
  {
    id: 'tenant-5',
    name: 'Đỗ Tuấn Kiệt',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    phone: '0922 333 444',
    role: 'tenant',
    history: ['room-3'],
    email: 'kiet.do@gmail.com'
  }
];
