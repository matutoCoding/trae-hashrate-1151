import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Booking, BookingStatus } from '../types';
import { mockBookings } from '../data/mockData';
import { generateId } from '../utils/datetime';

interface BookingState {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => Booking;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;
  getBookingsByRoom: (roomId: string) => Booking[];
  getBookingsByDate: (date: Date) => Booking[];
  getBookingById: (id: string) => Booking | undefined;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: mockBookings,

      addBooking: (booking) => {
        const newBooking: Booking = {
          ...booking,
          id: generateId(),
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ bookings: [...state.bookings, newBooking] }));
        return newBooking;
      },

      updateBooking: (id, booking) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, ...booking } : b
          ),
        }));
      },

      cancelBooking: (id) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, status: 'cancelled' as BookingStatus } : b
          ),
        }));
      },

      getBookingsByRoom: (roomId) => {
        return get().bookings.filter((b) => b.roomId === roomId);
      },

      getBookingsByDate: (date) => {
        const dateStr = date.toDateString();
        return get().bookings.filter((b) => {
          const start = new Date(b.startTime);
          const end = new Date(b.endTime);
          return (
            start.toDateString() === dateStr ||
            end.toDateString() === dateStr ||
            (start < date && end > date)
          );
        });
      },

      getBookingById: (id) => {
        return get().bookings.find((b) => b.id === id);
      },
    }),
    {
      name: 'tea-room-bookings',
    }
  )
);
