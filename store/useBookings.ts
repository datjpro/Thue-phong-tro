import { create } from 'zustand';
import { Booking, bookings as initialBookings } from '../data/bookings';

interface BookingsState {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
}

export const useBookings = create<BookingsState>((set) => ({
  bookings: initialBookings,
  
  addBooking: (booking) => set((state) => ({
    bookings: [booking, ...state.bookings]
  })),
  
  updateBookingStatus: (bookingId, status) => set((state) => ({
    bookings: state.bookings.map((booking) => 
      booking.id === bookingId ? { ...booking, status } : booking
    )
  }))
}));
