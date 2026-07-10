import { create } from 'zustand';
import { Room, rooms as initialRooms } from '../data/rooms';
import { Review, reviews as initialReviews } from '../data/reviews';

interface RoomsState {
  rooms: Room[];
  reviews: Review[];
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, updatedRoom: Partial<Room>) => void;
  updateRoomStatus: (roomId: string, status: Room['status']) => void;
  deleteRoom: (roomId: string) => void;
  addReview: (review: Review) => void;
}

export const useRooms = create<RoomsState>((set) => ({
  rooms: initialRooms,
  reviews: initialReviews,
  
  addRoom: (room) => set((state) => ({
    rooms: [room, ...state.rooms]
  })),
  
  updateRoom: (roomId, updatedFields) => set((state) => ({
    rooms: state.rooms.map((room) => 
      room.id === roomId ? { ...room, ...updatedFields } : room
    )
  })),

  updateRoomStatus: (roomId, status) => set((state) => ({
    rooms: state.rooms.map((room) =>
      room.id === roomId ? { ...room, status } : room
    )
  })),
  
  deleteRoom: (roomId) => set((state) => ({
    rooms: state.rooms.filter((room) => room.id !== roomId),
    reviews: state.reviews.filter((review) => review.roomId !== roomId)
  })),
  
  addReview: (newReview) => set((state) => {
    const updatedReviews = [newReview, ...state.reviews];
    
    // Tính toán lại điểm đánh giá trung bình (rating) cho phòng
    const roomReviews = updatedReviews.filter(r => r.roomId === newReview.roomId);
    const avgRating = roomReviews.reduce((sum, r) => sum + r.rating, 0) / roomReviews.length;
    const roundedRating = Math.round(avgRating * 10) / 10;
    
    const updatedRooms = state.rooms.map(room => 
      room.id === newReview.roomId 
        ? { ...room, rating: roundedRating } 
        : room
    );

    return {
      reviews: updatedReviews,
      rooms: updatedRooms
    };
  })
}));
