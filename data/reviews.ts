export interface Review {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export const reviews: Review[] = [
  // Reviews for room-1
  {
    id: 'rev-1-1',
    roomId: 'room-1',
    userId: 'tenant-1',
    userName: 'Lê Minh Triết',
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'Phòng sạch sẽ, gác lửng cao ráo thoáng mát. Chủ nhà thân thiện, nhiệt tình hỗ trợ khi có sự cố điện nước.',
    date: '2026-06-15'
  },
  {
    id: 'rev-1-2',
    roomId: 'room-1',
    userId: 'tenant-2',
    userName: 'Nguyễn Thảo Vy',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    rating: 4,
    comment: 'Phòng mới xây nên rất sạch. Khu vực xung quanh an ninh tốt, gần chợ nên tiện mua đồ ăn.',
    date: '2026-06-20'
  },
  {
    id: 'rev-1-3',
    roomId: 'room-1',
    userId: 'tenant-5',
    userName: 'Đỗ Tuấn Kiệt',
    userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'Điện nước tính giá nhà nước rất rẻ. Máy lạnh chạy êm, wifi mạnh, chỗ để xe rộng rãi.',
    date: '2026-06-22'
  },

  // Reviews for room-2
  {
    id: 'rev-2-1',
    roomId: 'room-2',
    userId: 'tenant-1',
    userName: 'Lê Minh Triết',
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'Chung cư dịch vụ tuyệt vời, nội thất xịn y như hình. Ban công hướng gió nên rất mát mẻ.',
    date: '2026-05-30'
  },
  {
    id: 'rev-2-2',
    roomId: 'room-2',
    userId: 'tenant-3',
    userName: 'Phạm Đức Anh',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'Đáng đồng tiền bát gạo! Dịch vụ dọn vệ sinh rất sạch, bảo vệ thân thiện hỗ trợ dắt xe.',
    date: '2026-06-05'
  },

  // Reviews for room-3
  {
    id: 'rev-3-1',
    roomId: 'room-3',
    userId: 'tenant-5',
    userName: 'Đỗ Tuấn Kiệt',
    userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    rating: 4,
    comment: 'Giá siêu tốt cho sinh viên gần trường Bách Khoa. Phòng hơi nhỏ nhưng có gác nên ở vẫn thoải mái.',
    date: '2026-06-15'
  },
  {
    id: 'rev-3-2',
    roomId: 'room-3',
    userId: 'tenant-4',
    userName: 'Vũ Hải Yến',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    rating: 4,
    comment: 'Chủ nhà dễ tính, cho đóng tiền trọ linh hoạt. Phòng cách âm hơi kém nhưng tổng thể tốt so với tầm giá.',
    date: '2026-06-18'
  },

  // Reviews for room-5
  {
    id: 'rev-5-1',
    roomId: 'room-5',
    userId: 'tenant-1',
    userName: 'Lê Minh Triết',
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'Phòng studio cực kỳ sang xịn, thiết kế hiện đại. Ngõ hơi hẹp chút nhưng đi lại vẫn tiện.',
    date: '2026-06-25'
  },

  // Reviews for room-8
  {
    id: 'rev-8-1',
    roomId: 'room-8',
    userId: 'tenant-3',
    userName: 'Phạm Đức Anh',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    comment: 'Đỉnh cao! View Hồ Tây lộng gió cực chill. Phòng đầy đủ thiết bị từ máy giặt, máy sấy đến lò vi sóng.',
    date: '2026-07-02'
  }
];
