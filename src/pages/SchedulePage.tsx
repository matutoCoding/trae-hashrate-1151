import { useState } from 'react';
import { Plus, Users, Coffee } from 'lucide-react';
import Calendar from '../components/Calendar';
import BookingModal from '../components/BookingModal';
import BookingDetailModal from '../components/BookingDetailModal';
import { useRoomStore } from '../store/useRoomStore';
import { useBookingStore } from '../store/useBookingStore';

export default function SchedulePage() {
  const { rooms, getActiveRooms } = useRoomStore();
  const { bookings } = useBookingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();
  const [initialStartTime, setInitialStartTime] = useState<string | undefined>();
  const [viewingBookingId, setViewingBookingId] = useState<string | null>(null);

  const activeRooms = getActiveRooms();

  const handleNewBooking = (roomId: string, startTime?: string) => {
    setSelectedRoomId(roomId);
    setInitialStartTime(startTime);
    setIsModalOpen(true);
  };

  const handleViewBooking = (bookingId: string) => {
    setViewingBookingId(bookingId);
  };

  const activeBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'completed'
  );

  const todayBookings = activeBookings.filter((b) => {
    const today = new Date().toDateString();
    const start = new Date(b.startTime);
    return start.toDateString() === today;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-soft border border-sandal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500">可用包间</p>
              <p className="font-song text-3xl font-bold text-sandal-900 mt-1">
                {activeRooms.length}
                <span className="text-base font-normal text-ink-400 ml-1">间</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center">
              <Coffee className="text-gold-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-soft border border-sandal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500">今日预订</p>
              <p className="font-song text-3xl font-bold text-sandal-900 mt-1">
                {todayBookings.length}
                <span className="text-base font-normal text-ink-400 ml-1">单</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-bamboo-100 flex items-center justify-center">
              <Users className="text-bamboo-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sandal-900 to-sandal-800 rounded-xl p-5 shadow-card text-white">
          <p className="text-sm text-sandal-300">快速创建</p>
          <button
            onClick={() => handleNewBooking(activeRooms[0]?.id)}
            className="w-full mt-3 px-4 py-2.5 rounded-lg bg-gold-500 text-sandal-900 font-medium hover:bg-gold-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            新建预订
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-song text-xl font-bold text-sandal-900">排期日历</h2>
          <p className="text-sm text-ink-400">点击空档快速创建预订</p>
        </div>
        <Calendar
          rooms={rooms}
          onNewBooking={handleNewBooking}
          onViewBooking={handleViewBooking}
        />
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomId={selectedRoomId}
        initialStartTime={initialStartTime}
      />

      <BookingDetailModal
        isOpen={viewingBookingId !== null}
        bookingId={viewingBookingId}
        onClose={() => setViewingBookingId(null)}
      />
    </div>
  );
}
