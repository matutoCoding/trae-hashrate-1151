import { useState, useEffect } from 'react';
import { X, Users, Clock, AlertTriangle, CheckCircle, Ban } from 'lucide-react';
import { useRoomStore } from '../../store/useRoomStore';
import { useBookingStore } from '../../store/useBookingStore';
import { useRateStore } from '../../store/useRateStore';
import { useBillStore } from '../../store/useBillStore';
import { validateBooking } from '../../utils/conflict';
import { calculateBilling, formatCurrency, formatDuration } from '../../utils/billing';
import { formatDateTime, parseDateTime } from '../../utils/datetime';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string;
  initialStartTime?: string;
  initialEndTime?: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  roomId,
  initialStartTime,
  initialEndTime,
}: BookingModalProps) {
  const { rooms, getActiveRooms, getRoomById } = useRoomStore();
  const { bookings, addBooking } = useBookingStore();
  const { rateTiers } = useRateStore();
  const { createBill } = useBillStore();

  const activeRooms = getActiveRooms();
  const hasActiveRooms = activeRooms.length > 0;

  const [formData, setFormData] = useState({
    roomId: roomId || '',
    customerName: '',
    customerPhone: '',
    startTime: '',
    endTime: '',
    guests: 2,
  });

  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    baseAmount: number;
    finalAmount: number;
    tierDetails: any[];
    totalHours: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const start = initialStartTime ? new Date(initialStartTime) : getDefaultStartTime();
      const end = initialEndTime ? new Date(initialEndTime) : getDefaultEndTime(start);

      const defaultRoomId = roomId && getRoomById(roomId)?.active
        ? roomId
        : activeRooms[0]?.id || '';

      setFormData({
        roomId: defaultRoomId,
        customerName: '',
        customerPhone: '',
        startTime: formatForInput(start),
        endTime: formatForInput(end),
        guests: 2,
      });
      setError(null);
      setPreview(null);
    }
  }, [isOpen, roomId, initialStartTime, initialEndTime, activeRooms]);

  useEffect(() => {
    if (formData.roomId && formData.startTime && formData.endTime) {
      const room = getRoomById(formData.roomId);
      if (room && room.active) {
        try {
          const billing = calculateBilling(
            new Date(formData.startTime).toISOString(),
            new Date(formData.endTime).toISOString(),
            rateTiers,
            room.minConsumption
          );
          const totalHours = billing.tierDetails.reduce(
            (sum: number, seg: any) => sum + seg.durationHours,
            0
          );
          setPreview({
            baseAmount: billing.baseAmount,
            finalAmount: billing.finalAmount,
            tierDetails: billing.tierDetails,
            totalHours,
          });
        } catch (e) {
          setPreview(null);
        }
      }
    }
  }, [formData.roomId, formData.startTime, formData.endTime, rateTiers, getRoomById]);

  function getDefaultStartTime(): Date {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    return now;
  }

  function getDefaultEndTime(start: Date): Date {
    const end = new Date(start);
    end.setHours(end.getHours() + 2);
    return end;
  }

  function formatForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasActiveRooms) {
      setError('当前没有可用的包间，请先在包间档案中启用至少一个包间');
      return;
    }

    if (!formData.roomId) {
      setError('请选择包间');
      return;
    }

    const selectedRoom = getRoomById(formData.roomId);
    if (!selectedRoom || !selectedRoom.active) {
      setError('所选包间已停用，请选择其他包间');
      return;
    }

    if (!formData.customerName.trim()) {
      setError('请输入客户姓名');
      return;
    }
    if (!formData.customerPhone.trim()) {
      setError('请输入联系电话');
      return;
    }

    const startISO = new Date(formData.startTime).toISOString();
    const endISO = new Date(formData.endTime).toISOString();

    const validationError = validateBooking(
      formData.roomId,
      startISO,
      endISO,
      bookings
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    const room = getRoomById(formData.roomId);
    if (!room) return;

    const booking = addBooking({
      roomId: formData.roomId,
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim(),
      startTime: startISO,
      endTime: endISO,
      guests: formData.guests,
    });

    createBill(
      booking.id,
      booking.roomId,
      booking.startTime,
      booking.endTime,
      rateTiers,
      room.minConsumption
    );

    onClose();
  }

  if (!isOpen) return null;

  const selectedRoom = getRoomById(formData.roomId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-elevated animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sandal-200 bg-sandal-50">
          <h3 className="font-song text-lg font-bold text-sandal-900">新建预订</h3>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {!hasActiveRooms && (
            <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 text-amber-700 rounded-lg">
              <Ban size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">当前没有可用的包间</p>
                <p className="text-sm text-amber-600 mt-1">
                  请先在「包间档案」中启用至少一个包间后再创建预订
                </p>
              </div>
            </div>
          )}

          {hasActiveRooms && (
            <>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  选择包间
                </label>
                <select
                  value={formData.roomId}
                  onChange={(e) =>
                    setFormData({ ...formData, roomId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-sandal-300 bg-white text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                >
                  {activeRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}（{room.capacity}人座 · 低消¥{room.minConsumption}）
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    <Clock size={14} className="inline mr-1" />
                    开始时间
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-sandal-300 bg-white text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    <Clock size={14} className="inline mr-1" />
                    结束时间
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-sandal-300 bg-white text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    客户姓名
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    placeholder="请输入姓名"
                    className="w-full px-4 py-2.5 rounded-lg border border-sandal-300 bg-white text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-2">
                    <Users size={14} className="inline mr-1" />
                    用餐人数
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.guests}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guests: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-sandal-300 bg-white text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  联系电话
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  placeholder="请输入联系电话"
                  className="w-full px-4 py-2.5 rounded-lg border border-sandal-300 bg-white text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
                />
              </div>

              {preview && preview.tierDetails.length > 0 && (
                <div className="bg-sandal-50 rounded-xl p-4 border border-sandal-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-ink-600">费用预估</span>
                    <span className="text-sm text-ink-500">
                      共 {formatDuration(preview.totalHours)}
                    </span>
                  </div>
                  <div className="space-y-2 mb-3">
                    {preview.tierDetails.map((seg, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: seg.color }}
                          />
                          <span className="text-ink-600">{seg.tierLabel}</span>
                          <span className="text-ink-400 text-xs">
                            {seg.startTime}-{seg.endTime}
                          </span>
                        </div>
                        <span className="text-ink-700 font-medium">
                          ¥{seg.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-sandal-200">
                    <span className="text-sm text-ink-600">基础费用</span>
                    <span className="text-ink-700">
                      ¥{preview.baseAmount.toFixed(2)}
                    </span>
                  </div>
                  {selectedRoom && preview.baseAmount < selectedRoom.minConsumption && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-amber-600 flex items-center gap-1">
                        <AlertTriangle size={14} />
                        未达低消
                      </span>
                      <span className="text-sm text-amber-600">
                        低消 ¥{selectedRoom.minConsumption}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-sandal-300">
                    <span className="font-medium text-ink-800">应付金额</span>
                    <span className="font-song text-2xl font-bold text-gold-600">
                      ¥{preview.finalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg text-sm">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-sandal-300 text-ink-700 font-medium hover:bg-sandal-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!hasActiveRooms}
              className="flex-1 px-4 py-3 rounded-lg bg-sandal-900 text-gold-400 font-medium hover:bg-sandal-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={18} />
              确认预订
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
