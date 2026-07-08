export interface Branch {
  id: string;
  name: string;
  address: string;
  city: 'Hồ Chí Minh' | 'Hà Nội';
  managerName: string;
  managerPhone: string;
  image: string;
  description: string;
}

export const branches: Branch[] = [
  {
    id: 'branch-1',
    name: 'HomieStay Riverside (Quận 7)',
    address: '45 Đường số 17, Phường Tân Quy, Quận 7, TP. HCM',
    city: 'Hồ Chí Minh',
    managerName: 'Nguyễn Văn Hùng',
    managerPhone: '0901 234 567',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80',
    description: 'Nằm gần bờ sông thoáng mát, gần trường Đại học Tôn Đức Thắng, Đại học RMIT. Thích hợp cho sinh viên và giới trẻ năng động.'
  },
  {
    id: 'branch-2',
    name: 'HomieStay Central (Bình Thạnh)',
    address: '128 Nguyễn Gia Trí, Phường 25, Quận Bình Thạnh, TP. HCM',
    city: 'Hồ Chí Minh',
    managerName: 'Trần Thị Mai',
    managerPhone: '0912 345 678',
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=600&q=80',
    description: 'Vị trí sầm uất ngay trung tâm học tập Bình Thạnh, xung quanh nhiều quán ăn tiện lợi và trường Đại học HUTECH, Ngoại Thương.'
  },
  {
    id: 'branch-3',
    name: 'HomieStay Sunrise (Cầu Giấy)',
    address: '15 Ngõ 99 Nguyễn Phong Sắc, Quận Cầu Giấy, Hà Nội',
    city: 'Hà Nội',
    managerName: 'Lê Hoàng Long',
    managerPhone: '0988 777 666',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
    description: 'Khu vực yên tĩnh, dân trí cao tại Cầu Giấy. Gần Đại học Quốc Gia, Đại học Sư Phạm. Phòng ốc thiết kế tối giản, tinh tế.'
  },
  {
    id: 'branch-4',
    name: 'HomieStay Greenery (Đống Đa)',
    address: '84 Chùa Láng, Phường Láng Thượng, Quận Đống Đa, Hà Nội',
    city: 'Hà Nội',
    managerName: 'Phạm Thanh Thủy',
    managerPhone: '0933 444 555',
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80',
    description: 'Nằm ngay trung tâm quận Đống Đa, khu vực nhộn nhịp gần Ngoại Thương và Ngoại Giao. Phong cách sống xanh mát mẻ.'
  }
];
