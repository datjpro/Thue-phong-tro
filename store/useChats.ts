import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  roomId: string;
  text: string;
  createdAt: string;
}

interface ChatsState {
  messages: ChatMessage[];
  sendMessage: (senderId: string, receiverId: string, roomId: string, text: string) => void;
}

const initialMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'tenant-1',
    receiverId: 'landlord-1',
    roomId: 'room-1',
    text: 'Chào anh Hùng, phòng trọ gác lửng ở Quận 7 còn trống không ạ?',
    createdAt: '2026-07-08T09:00:00Z'
  },
  {
    id: 'msg-2',
    senderId: 'landlord-1',
    receiverId: 'tenant-1',
    roomId: 'room-1',
    text: 'Chào Triết, phòng đó hiện tại vẫn còn trống nhé em. Em muốn qua xem phòng khi nào?',
    createdAt: '2026-07-08T09:05:00Z'
  },
  {
    id: 'msg-3',
    senderId: 'tenant-1',
    receiverId: 'landlord-1',
    roomId: 'room-1',
    text: 'Dạ sáng thứ 7 này tầm 9h30 em ghé xem được không anh?',
    createdAt: '2026-07-08T09:10:00Z'
  },
  {
    id: 'msg-4',
    senderId: 'landlord-1',
    receiverId: 'tenant-1',
    roomId: 'room-1',
    text: 'Ok em, anh đã duyệt lịch hẹn xem phòng cho em rồi đó nhé.',
    createdAt: '2026-07-08T09:12:00Z'
  }
];

export const useChats = create<ChatsState>((set) => ({
  messages: initialMessages,
  
  sendMessage: (senderId, receiverId, roomId, text) => set((state) => ({
    messages: [
      ...state.messages,
      {
        id: `msg-${Date.now()}`,
        senderId,
        receiverId,
        roomId,
        text,
        createdAt: new Date().toISOString()
      }
    ]
  }))
}));
