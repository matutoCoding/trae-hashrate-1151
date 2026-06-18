import { useState } from 'react';
import { X, Phone, Users, Clock, MapPin, AlertTriangle, XCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { useRoomStore } from '../../store/useRoomStore';
import { useBookingStore } from '../../store/useBookingStore';
import { useBillStore } from '../../store/useBillStore';
import { parseDateTime, formatDateTime } from '../../utils/datetime';
import { formatCurrency, formatDuration } from '../../utils/billing';

interface BookingDetailModalProps {
  isOpen: boolean;
  bookingId: string | null;
  onClose: () => void;
}

export default function BookingDetailModal({
  isOpen,
  bookingId,
  onClose,
}: BookingDetailModalProps) {
  const { getRoomById } = useRoomStore();
  const { getBookingById, cancelBooking } = useBookingStore();
  const { getBillByBookingId, refundBill } = useBillStore();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const booking = bookingId ? getBookingById(bookingId) : null;
  const room = booking ? getRoomById(booking.roomId) : null;
  const bill = booking ? getBillByBookingId(booking.id) : null;

  if (!isOpen || !booking || !room) return null;

  const handleCancel = () => {
    cancelBooking(booking.id);
    if (bill && (bill.status === 'pending' || bill.status === 'settled')) {
      refundBill(bill.id);
    }
    setShowCancelConfirm(false);
    onClose();
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { text: '已确认', className: 'bg-gold-100 text-gold-700' };
      case 'completed':
        return { text: '已完成', className: 'bg-bamboo-100 text-bamboo-700' };
      case 'cancelled':
        return { text: '已取消', className: 'bg-ink-100 text-ink-500' };
      default:
        return { text: status, className: 'bg-ink-100 text-ink-500' };
    }
  };

  const getBillStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: '待结算', className: 'bg-amber-100 text-amber-700' };
      case 'settled':
        return { text: '已结算', className: 'bg-bamboo-100 text-bamboo-700' };
      case 'refunded':
        return { text: '已退款', className: 'bg-ink-100 text-ink-500' };
      default:
        return { text: status, className: 'bg-ink-100 text-ink-500' };
    }
  };

  const statusInfo = getStatusLabel(booking.status);
  const duration = getDurationHours(booking.startTime, booking.endTime);

  const currentMinConsumption = room.minConsumption;
  const originalMinConsumption = bill ? bill.minConsumption : room.minConsumption;
  const hasMinConsumptionChange = bill && currentMinConsumption !== originalMinConsumption;

  const hasMinConsumptionSupplement = bill ? bill.baseAmount < currentMinConsumption : false;
  const supplementAmount = hasMinConsumptionSupplement && bill
    ? currentMinConsumption - bill.baseAmount
    : 0;

  const displayMinConsumption = currentMinConsumption;
  const displayFinalAmount = bill
    ? Math.max(bill.baseAmount, currentMinConsumption)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-elevated animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sandal-200 bg-sandal-50">
          <div className="flex items-center gap-3">
            <h3 className="font-song text-lg font-bold text-sandal-900">预订详情</h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
              {statusInfo.text}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {booking.status === 'cancelled' && (
            <div className="bg-ink-50 rounded-xl p-4 border border-ink-200">
              <div className="flex items-start gap-2">
                <RotateCcw className="text-ink-400 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-medium text-ink-600">已退订</p>
                  <p className="text-sm text-ink-400 mt-1">
                    排期已释放，该时段可被其他客户预订
                  </p>
                  {bill && bill.status === 'refunded' && (
                    <p className="text-xs text-ink-400 mt-1">
                      账单状态：已退款
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-sandal-50 rounded-xl p-4 border border-sandal-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="text-gold-600" size={20} />
              </div>
              <div>
                <h4 className="font-song text-lg font-bold text-sandal-900">{room.name}</h4>
                <p className="text-sm text-ink-500 mt-0.5">{room.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-ink-600 flex items-center gap-1">
                    <Users size={14} />
                    {room.capacity}人座
                  </span>
                  <span className="text-ink-600">
                    低消 ¥{displayMinConsumption}
                  </span>
                </div>
                {!room.active && (
                  <div className="text-xs text-amber-600 mt-1">
                    ⚠ 该包间当前已停用
                  </div>
                )}
                {hasMinConsumptionChange && (
                  <div className="text-xs text-bamboo-600 mt-1">
                    ↻ 低消已从 ¥{originalMinConsumption.toFixed(2)} 更新为 ¥{currentMinConsumption.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="text-ink-400" size={18} />
              <div className="flex-1">
                <div className="text-ink-500">时间</div>
                <div className="text-ink-800 font-medium">
                  {formatDateTime(parseDateTime(booking.startTime))}
                </div>
                <div className="text-ink-800 font-medium">
                  至 {formatDateTime(parseDateTime(booking.endTime))}
                </div>
                <div className="text-ink-400 text-xs mt-1">
                  共 {formatDuration(duration)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Users className="text-ink-400" size={18} />
              <div>
                <div className="text-ink-500">人数</div>
                <div className="text-ink-800 font-medium">{booking.guests} 人</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-[18px] h-[18px] flex items-center justify-center">
                <span className="text-ink-400 text-lg leading-none">👤</span>
              </div>
              <div>
                <div className="text-ink-500">客户</div>
                <div className="text-ink-800 font-medium">{booking.customerName}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Phone className="text-ink-400" size={18} />
              <div>
                <div className="text-ink-500">电话</div>
                <div className="text-ink-800 font-medium">{booking.customerPhone}</div>
              </div>
            </div>
          </div>

          {bill && bill.tierDetails.length > 0 && (
            <div className="bg-sandal-50 rounded-xl p-4 border border-sandal-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-ink-700">费用明细</h4>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBillStatusLabel(bill.status).className}`}>
                  {getBillStatusLabel(bill.status).text}
                </span>
              </div>

              <div className="space-y-2">
                {bill.tierDetails.map((seg, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-2.5 border border-sandal-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="text-sm text-ink-700">{seg.tierLabel}</span>
                        <span className="text-ink-400 text-xs">
                          {seg.startTime}-{seg.endTime}
                        </span>
                      </div>
                      <span className="text-ink-700 font-medium text-sm">
                        ¥{seg.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-ink-400 mt-1 text-right">
                      ¥{seg.pricePerHour.toFixed(2)}/h × {seg.durationHours}h
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-sandal-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-600">基础费用</span>
                  <span className="text-ink-700">¥{bill.baseAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-600">最低消费</span>
                  <span className="text-ink-700">¥{displayMinConsumption.toFixed(2)}</span>
                </div>
                {hasMinConsumptionSupplement && (
                  <div className="flex justify-between text-sm text-amber-600">
                    <span className="flex items-center gap-1">
                      <AlertTriangle size={14} />
                      低消补足
                    </span>
                    <span>+¥{supplementAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-ink-400 pt-1">
                  <span>
                    {hasMinConsumptionSupplement
                      ? '基础费用未达低消，按最新低消标准计费'
                      : '基础费用已满足低消门槛'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-sandal-300">
                  <span className="font-medium text-ink-800">应付金额</span>
                  <span className="font-song text-2xl font-bold text-gold-600">
                    ¥{displayFinalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {booking.status === 'confirmed' && (
            <div className="pt-2 space-y-3">
              {showCancelConfirm ? (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-start gap-2 text-red-600 mb-3">
                    <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">确认退订？</p>
                      <p className="text-sm text-red-500 mt-1">
                        退订后该时段将被释放，对应账单将标记为已退款
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 px-4 py-2 rounded-lg border border-sandal-300 text-ink-700 text-sm font-medium hover:bg-white transition-colors"
                    >
                      再想想
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle size={16} />
                      确认退订
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full px-4 py-3 rounded-lg border border-red-300 text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  取消预订
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getDurationHours(start: string, end: string): number {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  return diffMs / (1000 * 60 * 60);
}
