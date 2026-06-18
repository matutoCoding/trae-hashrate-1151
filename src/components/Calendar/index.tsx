import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking, Room } from '../../types';
import { useBookingStore } from '../../store/useBookingStore';
import { useBillStore } from '../../store/useBillStore';
import {
  getWeekDates,
  formatDate,
  getWeekdayLabel,
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
const ROW_HEIGHT = 52;

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
  const activeRooms = useMemo(() => rooms.filter((r) => r.active), [rooms]);
  const displayRooms = rooms;

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  const getBookingsForRoomAndDate = (roomId: string, date: Date) => {
    return bookings.filter((b) => {
      if (b.roomId !== roomId) return false;
      const bs = parseDateTime(b.startTime);
      const be = parseDateTime(b.endTime);
      const ds = new Date(date);
      ds.setHours(0, 0, 0, 0);
      const de = new Date(date);
      de.setHours(23, 59, 59, 999);
      return bs <= de && be >= ds;
    });
  };

  const getBookingStyle = (booking: Booking, date: Date) => {
    const bs = parseDateTime(booking.startTime);
    const be = parseDateTime(booking.endTime);
    const ds = new Date(date);
    ds.setHours(0, 0, 0, 0);
    const de = new Date(date);
    de.setHours(23, 59, 59, 999);

    const vs = new Date(Math.max(bs.getTime(), ds.getTime()));
    const ve = new Date(Math.min(be.getTime(), de.getTime()));

    const sh = vs.getHours() + vs.getMinutes() / 60;
    const eh = ve.getHours() + ve.getMinutes() / 60;

    const totalRange = HOUR_END - HOUR_START;
    const left = ((sh - HOUR_START) / totalRange) * 100;
    const width = ((eh - sh) / totalRange) * 100;

    return {
      left: `${left}%`,
      width: `${Math.max(width, 2)}%`,
    };
  };

  const handleEmptyClick = (roomId: string, date: Date, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    const hourOffset = ratio * (HOUR_END - HOUR_START);
    const hour = Math.floor(HOUR_START + hourOffset);
    const startDate = new Date(date);
    startDate.setHours(hour, 0, 0, 0);
    onNewBooking(roomId, startDate.toISOString());
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

  const timelineHeight = displayRooms.length * ROW_HEIGHT;

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

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="flex border-b border-sandal-200">
            <div className="w-28 flex-shrink-0 border-r border-sandal-200 bg-sandal-50/30">
              <div className="h-10 border-b border-sandal-100 flex items-center justify-center text-xs text-ink-400">
                时间
              </div>
              <div style={{ height: `${timelineHeight}px` }} className="relative">
                {displayRooms.map((room, idx) => (
                  <div
                    key={room.id}
                    className={`absolute left-0 right-0 flex items-center justify-center border-b border-sandal-100 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-sandal-50/30'
                    } ${!room.active ? 'bg-ink-50/50' : ''}`}
                    style={{ top: idx * ROW_HEIGHT, height: ROW_HEIGHT }}
                  >
                    <span className={`text-xs font-medium truncate px-1 flex items-center gap-1 ${
                      !room.active ? 'text-ink-400' : 'text-ink-700'
                    }`}>
                      {room.name}
                      {!room.active && <span className="text-[10px] bg-ink-200 text-ink-500 px-1 rounded">已停用</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {weekDates.map((date) => {
              const isToday = formatDate(date) === formatDate(new Date());
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <div key={formatDate(date)} className="flex-1 min-w-[110px] border-r border-sandal-100 last:border-r-0">
                  <div
                    className={`h-10 border-b border-sandal-100 flex flex-col items-center justify-center ${
                      isToday ? 'bg-gold-50' : ''
                    }`}
                  >
                    <span className={`text-[10px] leading-tight ${isWeekend ? 'text-red-400' : 'text-ink-400'}`}>
                      {getWeekdayLabel(date)}
                    </span>
                    <span className={`text-sm font-bold leading-tight ${isToday ? 'text-gold-600' : 'text-ink-700'}`}>
                      {date.getDate()}
                    </span>
                  </div>

                  <div style={{ height: `${timelineHeight}px` }} className="relative">
                    {displayRooms.map((room, rIdx) => {
                      const roomBookings = getBookingsForRoomAndDate(room.id, date);

                      return (
                        <div
                          key={room.id}
                          className={`absolute left-0 right-0 border-b border-sandal-100 ${
                            rIdx % 2 === 0 ? 'bg-white' : 'bg-sandal-50/20'
                          } ${!room.active ? 'bg-ink-50/30' : ''}`}
                          style={{ top: rIdx * ROW_HEIGHT, height: ROW_HEIGHT }}
                        >
                          {room.active ? (
                            <div
                              className="absolute inset-0 cursor-pointer hover:bg-gold-100/20 transition-colors"
                              onClick={(e) => handleEmptyClick(room.id, date, e)}
                            />
                          ) : (
                            <div className="absolute inset-0 cursor-not-allowed" />
                          )}

                          {roomBookings.map((booking) => {
                            const style = getBookingStyle(booking, date);
                            const bill = getBillByBookingId(booking.id);
                            const isCancelled = booking.status === 'cancelled';

                            return (
                              <div
                                key={booking.id}
                                className={`absolute top-1 bottom-1 rounded-md px-1.5 overflow-hidden cursor-pointer transition-all duration-200 z-10 flex items-center ${getStatusColor(booking.status)} ${isCancelled ? 'opacity-60 hover:opacity-70' : 'hover:shadow-md hover:brightness-110'}`}
                                style={style}
                                onClick={() => onViewBooking(booking.id)}
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoverInfo({ booking, x: rect.right + 8, y: rect.top });
                                }}
                                onMouseLeave={() => setHoverInfo(null)}
                              >
                                <span className={`text-[11px] font-medium truncate leading-tight ${isCancelled ? 'line-through' : ''}`}>
                                  {booking.customerName}
                                  {isCancelled && <span className="ml-1 text-[9px] bg-white/30 px-1 rounded">已取消</span>}
                                  {bill && !isCancelled && (
                                    <span className="ml-1 opacity-80">
                                      {formatCurrency(bill.finalAmount)}
                                    </span>
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex border-t border-sandal-200 bg-sandal-50/30">
            <div className="w-28 flex-shrink-0 border-r border-sandal-200" />
            <div className="flex-1 relative" style={{ height: '28px' }}>
              {HOURS.filter((h) => h % 2 === 0 || h === HOUR_START).map((hour) => {
                const totalRange = HOUR_END - HOUR_START;
                const left = ((hour - HOUR_START) / totalRange) * 100;
                return (
                  <span
                    key={hour}
                    className="absolute text-[10px] text-ink-400 -translate-x-1/2"
                    style={{ left: `${left}%`, top: '4px' }}
                  >
                    {String(hour).padStart(2, '0')}:00
                  </span>
                );
              })}
            </div>
          </div>
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
