export interface Room {
  id: string;
  name: string;
  capacity: number;
  minConsumption: number;
  description: string;
  active: boolean;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  roomId: string;
  customerName: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  guests: number;
  createdAt: string;
}

export type RateTierName = 'peak' | 'normal' | 'valley';

export interface RateTier {
  id: string;
  name: RateTierName;
  label: string;
  color: string;
  pricePerHour: number;
  startTime: string;
  endTime: string;
}

export interface TierSegment {
  tierName: RateTierName;
  tierLabel: string;
  color: string;
  pricePerHour: number;
  startTime: string;
  endTime: string;
  durationHours: number;
  amount: number;
}

export type BillStatus = 'pending' | 'settled' | 'refunded';

export interface Bill {
  id: string;
  bookingId: string;
  roomId: string;
  baseAmount: number;
  minConsumption: number;
  finalAmount: number;
  tierDetails: TierSegment[];
  status: BillStatus;
  createdAt: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingBookings: Booking[];
}

export type PageType = 'rooms' | 'schedule' | 'rate' | 'billing';
