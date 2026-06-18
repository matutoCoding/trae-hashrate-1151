import { create } from 'zustand';
import type { Room } from '../types';
import { mockRooms } from '../data/mockData';
import { generateId } from '../utils/datetime';

interface RoomState {
  rooms: Room[];
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  getRoomById: (id: string) => Room | undefined;
}

export const useRoomStore = create<RoomState>((set, get) => ({
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

  getRoomById: (id) => {
    return get().rooms.find((r) => r.id === id);
  },
}));
