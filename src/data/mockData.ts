import type { Room, Booking, RateTier, Bill } from '../types';
import { addDays, getStartOfDay } from '../utils/datetime';

function createTime(hours: number, minutes: number = 0): Date {
  const now = getStartOfDay(new Date());
  now.setHours(hours, minutes, 0, 0);
  return now;
}

function offsetTime(base: Date, hourOffset: number): string {
  const date = new Date(base);
  date.setTime(date.getTime() + hourOffset * 60 * 60 * 1000);
  return date.toISOString();
}

export const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: '清风阁',
    capacity: 4,
    minConsumption: 288,
    description: '雅致小包间，适合朋友小聚品茗',
    active: true,
  },
  {
    id: 'room-2',
    name: '明月轩',
    capacity: 6,
    minConsumption: 488,
    description: '中式典雅风格，商务洽谈首选',
    active: true,
  },
  {
    id: 'room-3',
    name: '云栖厅',
    capacity: 10,
    minConsumption: 888,
    description: '豪华大包间，团建聚会皆宜',
    active: true,
  },
  {
    id: 'room-4',
    name: '竹语堂',
    capacity: 8,
    minConsumption: 688,
    description: '竹林主题设计，清幽静谧',
    active: true,
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    roomId: 'room-1',
    customerName: '张先生',
    customerPhone: '13800138001',
    startTime: offsetTime(createTime(14), 0),
    endTime: offsetTime(createTime(14), 3),
    status: 'confirmed',
    guests: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'booking-2',
    roomId: 'room-2',
    customerName: '李女士',
    customerPhone: '13900139002',
    startTime: offsetTime(createTime(10), 0),
    endTime: offsetTime(createTime(10), 2),
    status: 'confirmed',
    guests: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'booking-3',
    roomId: 'room-2',
    customerName: '王总',
    customerPhone: '13700137003',
    startTime: offsetTime(createTime(19), 0),
    endTime: offsetTime(createTime(19), 3.5),
    status: 'confirmed',
    guests: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'booking-4',
    roomId: 'room-3',
    customerName: '赵经理',
    customerPhone: '13600136004',
    startTime: offsetTime(addDays(createTime(13), 1), 0),
    endTime: offsetTime(addDays(createTime(13), 1), 4),
    status: 'confirmed',
    guests: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'booking-5',
    roomId: 'room-1',
    customerName: '陈小姐',
    customerPhone: '13500135005',
    startTime: offsetTime(createTime(9), 0),
    endTime: offsetTime(createTime(9), 1.5),
    status: 'completed',
    guests: 2,
    createdAt: new Date().toISOString(),
  },
];

export const mockRateTiers: RateTier[] = [
  {
    id: 'tier-valley',
    name: 'valley',
    label: '低谷时段',
    color: '#7CB342',
    pricePerHour: 68,
    startTime: '08:00',
    endTime: '12:00',
  },
  {
    id: 'tier-normal',
    name: 'normal',
    label: '平峰时段',
    color: '#C9A96E',
    pricePerHour: 128,
    startTime: '12:00',
    endTime: '18:00',
  },
  {
    id: 'tier-peak',
    name: 'peak',
    label: '高峰时段',
    color: '#D32F2F',
    pricePerHour: 198,
    startTime: '18:00',
    endTime: '23:00',
  },
];

export const mockBills: Bill[] = [
  {
    id: 'bill-1',
    bookingId: 'booking-5',
    roomId: 'room-1',
    baseAmount: 102,
    minConsumption: 288,
    finalAmount: 288,
    tierDetails: [
      {
        tierName: 'valley',
        tierLabel: '低谷时段',
        color: '#7CB342',
        pricePerHour: 68,
        startTime: '09:00',
        endTime: '10:30',
        durationHours: 1.5,
        amount: 102,
      },
    ],
    status: 'settled',
    createdAt: new Date().toISOString(),
  },
];
