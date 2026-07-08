export interface Room {
  id: string;
  title: string;
  type: 'phong-tro' | 'chung-cu-mini' | 'o-ghep';
  price: number; // Giá thuê VNĐ/tháng
  area: number; // Diện tích m2
  maxTenants: number; // Số người tối đa
  address: string;
  district: string;
  city: 'Hồ Chí Minh' | 'Hà Nội';
  images: string[];
  amenities: string[]; // Các tiện ích
  description: string;
  status: 'available' | 'rented' | 'reserved';
  rating: number;
  branchId: string;
  createdAt: string;
  landlordId: string; // Tương thích ngược với các store khác
}

export const rooms: Room[] = [
  {
    id: 'room-1',
    title: 'Phòng 101 - Studio Gác Lửng View Sông Đỉnh Cao',
    type: 'phong-tro',
    price: 3200000,
    area: 25,
    maxTenants: 3,
    address: '45 Đường số 17, Phường Tân Quy, Quận 7, TP. HCM',
    district: 'Quận 7',
    city: 'Hồ Chí Minh',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502005229762-fc1b2d812ca5?auto=format&fit=crop&w=600&q=80'
    ],
    amenities: ['wifi', 'dieu-hoa', 'gac-lung', 'xe-may', 'gio-tu-do', 'may-giat', 'tu-quan-ao'],
    description: 'Nằm trong chi nhánh HomieStay Riverside. Phòng có gác lửng đúc kiên cố, ban công thoáng mát hướng sông. Đầy đủ tiện nghi cơ bản, bếp từ hiện đại, khu vệ sinh khép kín sạch sẽ. Ra vào vân tay tiện lợi.',
    status: 'available',
    rating: 4.8,
    branchId: 'branch-1',
    landlordId: 'landlord-1',
    createdAt: '2026-06-01'
  },
  {
    id: 'room-2',
    title: 'Phòng 202 - Căn hộ Studio cao cấp ban công riêng',
    type: 'chung-cu-mini',
    price: 5300000,
    area: 35,
    maxTenants: 2,
    address: '128 Nguyễn Gia Trí, Phường 25, Quận Bình Thạnh, TP. HCM',
    district: 'Bình Thạnh',
    city: 'Hồ Chí Minh',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1527030280862-64139fbe04ca?auto=format&fit=crop&w=600&q=80'
    ],
    amenities: ['wifi', 'dieu-hoa', 'xe-may', 'gio-tu-do', 'bep', 'may-giat', 'tu-lanh', 'tu-quan-ao', 'ban-cong', 'bao-ve'],
    description: 'Nằm trong chi nhánh HomieStay Central. Căn hộ studio được trang bị đầy đủ nội thất cao cấp: máy lạnh Daikin, tủ lạnh Inverter, tủ quần áo âm tường lớn, bếp nấu hiện đại. Ban công kính cường lực rộng đón gió tự nhiên tốt.',
    status: 'rented',
    rating: 4.9,
    branchId: 'branch-2',
    landlordId: 'landlord-1',
    createdAt: '2026-05-15'
  },
  {
    id: 'room-3',
    title: 'Phòng 303 - Giường Tầng KTX Cao Cấp Trọn Gói',
    type: 'o-ghep',
    price: 1600000,
    area: 50,
    maxTenants: 6,
    address: '45 Đường số 17, Phường Tân Quy, Quận 7, TP. HCM',
    district: 'Quận 7',
    city: 'Hồ Chí Minh',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80'
    ],
    amenities: ['wifi', 'dieu-hoa', 'xe-may', 'gio-tu-do', 'may-giat', 'tu-quan-ao', 'bao-ve'],
    description: 'Nằm trong chi nhánh HomieStay Riverside. Giường tầng Homestay cao cấp, rèm che riêng tư, ổ cắm điện riêng, đèn đọc sách đầy đủ. Khu vực bếp chung rộng rãi, phòng khách sinh hoạt chung đầy đủ tivi tủ lạnh.',
    status: 'available',
    rating: 4.5,
    branchId: 'branch-1',
    landlordId: 'landlord-1',
    createdAt: '2026-06-10'
  },
  {
    id: 'room-4',
    title: 'Phòng 102 - Studio Hiện Đại Nội Thất Bắc Âu',
    type: 'chung-cu-mini',
    price: 6000000,
    area: 32,
    maxTenants: 2,
    address: '128 Nguyễn Gia Trí, Phường 25, Quận Bình Thạnh, TP. HCM',
    district: 'Bình Thạnh',
    city: 'Hồ Chí Minh',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=600&q=80'
    ],
    amenities: ['wifi', 'dieu-hoa', 'xe-may', 'gio-tu-do', 'bep', 'may-giat', 'tu-lanh', 'tu-quan-ao', 'bao-ve'],
    description: 'Nằm trong chi nhánh HomieStay Central. Căn hộ phong cách Scandinavian tối giản tinh tế. Có bàn làm việc thông minh, giường đệm lò xo êm ái, bồn rửa chén rộng rãi. Bảo vệ túc trực 24/7.',
    status: 'available',
    rating: 4.7,
    branchId: 'branch-2',
    landlordId: 'landlord-1',
    createdAt: '2026-06-20'
  },
  {
    id: 'room-5',
    title: 'Phòng 301 - Căn Hộ Nhỏ Gọn Yên Tĩnh Cho Sinh Viên',
    type: 'phong-tro',
    price: 3500000,
    area: 22,
    maxTenants: 2,
    address: '15 Ngõ 99 Nguyễn Phong Sắc, Quận Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    city: 'Hà Nội',
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80'
    ],
    amenities: ['wifi', 'dieu-hoa', 'gac-lung', 'xe-may', 'gio-tu-do', 'may-giat', 'tu-quan-ao'],
    description: 'Nằm trong chi nhánh HomieStay Sunrise Cầu Giấy. Thiết kế gọn gàng, cửa sổ kính lớn ngập tràn ánh nắng sáng. Gác xép lót sàn gỗ sồi sạch mát, đầy đủ tủ quần áo và kệ bếp nhỏ gọn.',
    status: 'available',
    rating: 4.6,
    branchId: 'branch-3',
    landlordId: 'landlord-1',
    createdAt: '2026-06-05'
  },
  {
    id: 'room-6',
    title: 'Phòng 402 - Studio Gác Lửng Cao Cấp Gần Đại Học',
    type: 'phong-tro',
    price: 3800000,
    area: 26,
    maxTenants: 3,
    address: '84 Chùa Láng, Phường Láng Thượng, Quận Đống Đa, Hà Nội',
    district: 'Đống Đa',
    city: 'Hà Nội',
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80'
    ],
    amenities: ['wifi', 'dieu-hoa', 'gac-lung', 'xe-may', 'gio-tu-do', 'may-giat', 'tu-quan-ao', 'ban-cong'],
    description: 'Nằm trong chi nhánh HomieStay Greenery Đống Đa. Gác lửng đúc kiên cố, có giếng trời đón gió tự nhiên siêu thoáng. Gần nhiều trường học lớn như Ngoại Thương, Ngoại Giao, thích hợp nhóm bạn sinh viên.',
    status: 'available',
    rating: 4.8,
    branchId: 'branch-4',
    landlordId: 'landlord-1',
    createdAt: '2026-06-15'
  }
];
