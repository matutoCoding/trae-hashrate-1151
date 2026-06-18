import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Info, XCircle } from 'lucide-react';
import type { Booking, Room } from '../../types';
import { useBookingStore } from '../../store/useBookingStore';
import { useBillStore } from '../../store/useBillStore';
import {
  getWeekDates,
  formatDate,
  getWeekdayLabel,
  getDurationHours,
  parseDateTime,
  formatTime,
} from '../../utils/datetime';
import { formatCurrency } from '../../utils/billing';

interface CalendarProps {
  rooms: Room[];
  onNewBooking: (roomId: string, startTime?: string) => void;
  onViewBooking: (bookingId: string) => void;
}

const HOUR_START = 8;
const HOUR_END = 23;
const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);

export default function Calendar({ rooms, onNewBooking, onViewBooking }: CalendarProps) {
  const { bookings } = useBookingStore();
  const { getBillByBookingId } = useBillStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoverInfo, setHoverInfo] = useState<{
    booking: Booking;
    x: number;
    y: number;
  } | null>(null);

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const getBookingsForRoomAndDate = (roomId: string, date: Date) => {
    return bookings.filter((b) => {
      if (b.roomId !== roomId) return false;
      if (b.status === 'cancelled') return false;

      const bookingStart = parseDateTime(b.startTime);
      const bookingEnd = parseDateTime(b.endTime);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      return bookingStart <= dayEnd && bookingEnd >= dayStart;
    });
  };

  const getBookingStyle = (booking: Booking, date: Date) => {
    const bookingStart = parseDateTime(booking.startTime);
    const bookingEnd = parseDateTime(booking.endTime);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const visibleStart = new Date(Math.max(bookingStart.getTime(), dayStart.getTime()));
    const visibleEnd = new Date(Math.min(bookingEnd.getTime(), dayEnd.getTime()));

    const startHour = visibleStart.getHours() + visibleStart.getMinutes() / 60;
    const endHour = visibleEnd.getHours() + visibleEnd.getMinutes() / 60;

    const topPercent = ((startHour - HOUR_START) / (HOUR_END - HOUR_START)) * 100;
    const heightPercent = ((endHour - startHour) / (HOUR_END - HOUR_START)) * 100;

    return {
      top: `${topPercent}%`,
      height: `${Math.max(heightPercent, 3)}%`,
    };
  };

  const handleCellClick = (roomId: string, date: Date, hour: number) => {
    const startDate = new Date(date);
    startDate.setHours(hour, 0, 0, 0);
    onNewBooking(roomId, startDate.toISOString());
  };

  const handleBookingHover = (
    e: React.MouseEvent,
    booking: Booking | null
  ) => {
    if (booking) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoverInfo({
        booking,
        x: rect.right + 10,
        y: rect.top,
      });
    } else {
      setHoverInfo(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-gold-500/90 text-white';
      case 'completed':
        return 'bg-bamboo-500/90 text-white';
      case 'cancelled':
        return 'bg-ink-300/90 text-white';
      default:
        return 'bg-gold-500/90 text-white';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-sandal-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-sandal-200 bg-sandal-50/50">
        <div className="flex items-center gap-3">
          <button
            onClick={prevWeek}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-500 hover:bg-sandal-200/50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-sm font-medium text-sandal-700 bg-sandal-100 rounded-lg hover:bg-sandal-200 transition-colors"
          >
            今天
          </button>
          <button
            onClick={nextWeek}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-500 hover:bg-sandal-200/50 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <h3 className="font-song text-lg font-bold text-sandal-900 ml-2">
            {weekDates[0].getMonth() + 1}月{weekDates[0].getDate()}日 -{' '}
            {weekDates[6].getMonth() + 1}月{weekDates[6].getDate()}日
          </h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gold-500" />
            <span className="text-ink-600">已预订</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-bamboo-500" />
            <span className="text-ink-600">已完成</span>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto">
        <div className="min-w-[120px] w-[120px] flex-shrink-0 border-r border-sandal-200 bg-sandal-50/30">
          <div className="h-16 border-b border-sandal-200 flex items-center justify-center">
            <span className="text-sm font-medium text-ink-500">时间 / 包间</span>
          </div>
          <div className="relative" style={{ height: `${HOURS.length * 48}px` }}>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 flex items-center justify-center text-xs text-ink-400"
                style={{ top: `${((hour - HOUR_START) / (HOUR_END - HOUR_START)) * 100}%` }}
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 min-w-0">
          {weekDates.map((date) => {
            const isToday = formatDate(date) === formatDate(new Date());
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div key={formatDate(date)} className="flex-1 min-w-[140px] border-r border-sandal-100 last:border-r-0">
                <div
                  className={`h-16 border-b border-sandal-200 flex flex-col items-center justify-center ${
                    isToday ? 'bg-gold-50' : ''
                  }`}
                >
                  <span
                    className={`text-xs ${
                      isWeekend ? 'text-red-400' : 'text-ink-400'
                    }`}
                  >
                    {getWeekdayLabel(date)}
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      isToday ? 'text-gold-600' : 'text-ink-700'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>

                <div className="relative" style={{ height: `${HOURS.length * 48}px` }}>
                  {HOURS.map((hour, idx) => (
                    <div
                      key={hour}
                      className={`absolute left-0 right-0 border-t border-sandal-100 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-sandal-50/30'
                      }`}
                      style={{
                        top: `${((hour - HOUR_START) / (HOUR_END - HOUR_START)) * 100}%`,
                        height: `${(1 / (HOUR_END - HOUR_START)) * 100}%`,
                      }}
                    />
                  ))}

                  {rooms.map((room) => {
                    const roomBookings = getBookingsForRoomAndDate(room.id, date);

                    return (
                      <div key={room.id} className="absolute inset-0">
                        {roomBookings.map((booking) => {
                          const style = getBookingStyle(booking, date);
                          const bill = getBillByBookingId(booking.id);

                          return (
                            <div
                              key={booking.id}
                              className={`absolute left-1 right-1 rounded-md px-2 py-1 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] z-10 ${getStatusColor(
                                booking.status
                              )}`}
                              style={style}
                              onClick={() => onViewBooking(booking.id)}
                              onMouseEnter={(e) => handleBookingHover(e, booking)}
                              onMouseLeave={(e) => handleBookingHover(e, null)}
                            >
                              <div className="text-xs font-medium truncate">
                                {booking.customerName}
                              </div>
                              {bill && (
                                <div className="text-xs opacity-80 truncate">
                                  {formatCurrency(bill.finalAmount)}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {HOURS.map((hour) => (
                          <div
                            key={`${room.id}-${hour}`}
                            className="absolute left-0 right-0 cursor-pointer hover:bg-gold-100/30 transition-colors z-[5]"
                            style={{
                              top: `${((hour - HOUR_START) / (HOUR_END - HOUR_START)) * 100}%`,
                              height: `${(1 / (HOUR_END - HOUR_START)) * 100}%`,
                            }}
                            onClick={() => handleCellClick(room.id, date, hour)}
                            title="点击创建预订"
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hoverInfo && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-elevated border border-sandal-200 p-4 w-64 pointer-events-none animate-fade-in"
          style={{ left: hoverInfo.x, top: hoverInfo.y }}
        >
          <div className="font-medium text-ink-800 mb-2">
            {hoverInfo.booking.customerName}
          </div>
          <div className="space-y-1 text-sm text-ink-600">
            <div className="flex justify-between">
              <span>开始</span>
              <span>{formatDateTimeText(hoverInfo.booking.startTime)}</span>
            </div>
            <div className="flex justify-between">
              <span>结束</span>
              <span>{formatDateTimeText(hoverInfo.booking.endTime)}</span>
            </div>
            <div className="flex justify-between">
              <span>人数</span>
              <span>{hoverInfo.booking.guests}人</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-sandal-100 text-xs text-ink-400 text-center">
            点击查看详情
          </div>
        </div>
      )}
    </div>
  );
}

function formatDateTimeText(dateTimeStr: string): string {
  const date = parseDateTime(dateTimeStr);
  return `${date.getMonth() + 1}/${date.getDate()} ${formatTime(date)}`;
}
