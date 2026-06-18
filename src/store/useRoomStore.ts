import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Room } from '../types';
import { mockRooms } from '../data/mockData';
import { generateId } from '../utils/datetime';

interface RoomState {
  rooms: Room[];
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  toggleRoomActive: (id: string) => void;
  getRoomById: (id: string) => Room | undefined;
  getActiveRooms: () => Room[];
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      rooms: mockRooms,

      addRoom: (room) => {
        const newRoom: Room = {
          ...room,
          id: generateId(),
        };
        set((state) => ({ rooms: [...state.rooms, newRoom] }));
      },

      updateRoom: (id, room) => {
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...room } : r)),
        }));
      },

      deleteRoom: (id) => {
        set((state) => ({ rooms: state.rooms.filter((r) => r.id !== id) }));
      },

      toggleRoomActive: (id) => {
        set((state) => ({
          rooms: state.rooms.map((r) =>
            r.id === id ? { ...r, active: !r.active } : r
          ),
        }));
      },

      getRoomById: (id) => {
        return get().rooms.find((r) => r.id === id);
      },

      getActiveRooms: () => {
        return get().rooms.filter((r) => r.active);
      },
    }),
    {
      name: 'tea-room-rooms',
    }
  )
);
