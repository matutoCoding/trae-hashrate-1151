import type { Booking, ConflictResult } from '../types';
import { parseDateTime } from './datetime';

export function checkTimeOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA < endB && endA > startB;
}

export function checkBookingConflict(
  roomId: string,
  startTime: string,
  endTime: string,
  bookings: Booking[],
  excludeBookingId?: string
): ConflictResult {
  const start = parseDateTime(startTime);
  const end = parseDateTime(endTime);

  const conflictingBookings = bookings.filter((booking) => {
    if (booking.roomId !== roomId) return false;
    if (booking.status === 'cancelled') return false;
    if (excludeBookingId && booking.id === excludeBookingId) return false;

    const bookingStart = parseDateTime(booking.startTime);
    const bookingEnd = parseDateTime(booking.endTime);

    return checkTimeOverlap(start, end, bookingStart, bookingEnd);
  });

  return {
    hasConflict: conflictingBookings.length > 0,
    conflictingBookings,
  };
}

export function validateBooking(
  roomId: string,
  startTime: string,
  endTime: string,
  bookings: Booking[],
  excludeBookingId?: string
): string | null {
  const start = parseDateTime(startTime);
  const end = parseDateTime(endTime);

  if (start >= end) {
    return '结束时间必须晚于开始时间';
  }

  const conflict = checkBookingConflict(roomId, startTime, endTime, bookings, excludeBookingId);
  if (conflict.hasConflict) {
    const first = conflict.conflictingBookings[0];
    return `该时段与「${first.customerName}的预订冲突（${formatShort(first.startTime)} - ${formatShort(first.endTime)}）`;
  }

  return null;
}

function formatShort(dateTimeStr: string): string {
  const date = parseDateTime(dateTimeStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}
