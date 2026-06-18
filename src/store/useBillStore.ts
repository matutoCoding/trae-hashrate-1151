import { create } from 'zustand';
import type { Bill, BillStatus } from '../types';
import { mockBills } from '../data/mockData';
import { generateId } from '../utils/datetime';
import { calculateBilling } from '../utils/billing';

interface BillState {
  bills: Bill[];
  createBill: (
    bookingId: string,
    roomId: string,
    startTime: string,
    endTime: string,
    rateTiers: any[],
    minConsumption: number
  ) => Bill;
  updateBillStatus: (id: string, status: BillStatus) => void;
  getBillById: (id: string) => Bill | undefined;
  getBillByBookingId: (bookingId: string) => Bill | undefined;
  settleBill: (id: string) => void;
  refundBill: (id: string) => void;
}

export const useBillStore = create<BillState>((set, get) => ({
  bills: mockBills,

  createBill: (bookingId, roomId, startTime, endTime, rateTiers, minConsumption) => {
    const billing = calculateBilling(startTime, endTime, rateTiers, minConsumption);
    
    const newBill: Bill = {
      id: generateId(),
      bookingId,
      roomId,
      baseAmount: billing.baseAmount,
      minConsumption,
      finalAmount: billing.finalAmount,
      tierDetails: billing.tierDetails,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({ bills: [...state.bills, newBill] }));
    return newBill;
  },

  updateBillStatus: (id, status) => {
    set((state) => ({
      bills: state.bills.map((b) =>
        b.id === id ? { ...b, status } : b
      ),
    }));
  },

  getBillById: (id) => {
    return get().bills.find((b) => b.id === id);
  },

  getBillByBookingId: (bookingId) => {
    return get().bills.find((b) => b.bookingId === bookingId);
  },

  settleBill: (id) => {
    set((state) => ({
      bills: state.bills.map((b) =>
        b.id === id ? { ...b, status: 'settled' as BillStatus } : b
      ),
    }));
  },

  refundBill: (id) => {
    set((state) => ({
      bills: state.bills.map((b) =>
        b.id === id ? { ...b, status: 'refunded' as BillStatus } : b
      ),
    }));
  },
}));
