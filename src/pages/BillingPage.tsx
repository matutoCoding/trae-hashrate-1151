import { useState } from 'react';
import {
  Receipt, Search, Filter, ChevronDown, Eye, CheckCircle,
  RefreshCw, ArrowDown, ArrowUp, Minus, RotateCcw,
} from 'lucide-react';
import { useBillStore } from '../store/useBillStore';
import { useBookingStore } from '../store/useBookingStore';
import { useRoomStore } from '../store/useRoomStore';
import { formatDateTime, parseDateTime } from '../utils/datetime';
import { formatCurrency, formatDuration } from '../utils/billing';

type FilterStatus = 'all' | 'pending' | 'settled' | 'refunded';

export default function BillingPage() {
  const { bills, settleBill } = useBillStore();
  const { getBookingById } = useBookingStore();
  const { getRoomById } = useRoomStore();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

  const filteredBills = bills
    .filter((bill) => {
      if (filterStatus !== 'all' && bill.status !== filterStatus) return false;
      if (searchText) {
        const booking = getBookingById(bill.bookingId);
        const room = getRoomById(bill.roomId);
        const searchLower = searchText.toLowerCase();
        return (
          booking?.customerName.toLowerCase().includes(searchLower) ||
          room?.name.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPending = bills.filter((b) => b.status === 'pending').length;
  const totalSettled = bills.filter((b) => b.status === 'settled').length;
  const totalAmount = bills
    .filter((b) => b.status === 'settled')
    .reduce((sum, b) => sum + b.finalAmount, 0);

  const getStatusInfo = (status: string) => {
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

  const statusOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all', label: '全部状态' },
    { value: 'pending', label: '待结算' },
    { value: 'settled', label: '已结算' },
    { value: 'refunded', label: '已退款' },
  ];

  const handleSettle = (billId: string) => {
    settleBill(billId);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-soft border border-sandal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500">待结算账单</p>
              <p className="font-song text-3xl font-bold text-amber-600 mt-1">
                {totalPending}
                <span className="text-base font-normal text-ink-400 ml-1">单</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Receipt className="text-amber-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-soft border border-sandal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500">已结算账单</p>
              <p className="font-song text-3xl font-bold text-bamboo-600 mt-1">
                {totalSettled}
                <span className="text-base font-normal text-ink-400 ml-1">单</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-bamboo-100 flex items-center justify-center">
              <CheckCircle className="text-bamboo-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sandal-900 to-sandal-800 rounded-xl p-5 shadow-card text-white">
          <p className="text-sm text-sandal-300">累计营收</p>
          <p className="font-song text-3xl font-bold text-gold-400 mt-1">
            ¥{totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-sandal-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-sandal-200">
          <h2 className="font-song text-lg font-bold text-sandal-900">账单列表</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                size={16}
              />
              <input
                type="text"
                placeholder="搜索客户或包间"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-4 py-2 rounded-lg border border-sandal-300 text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-sandal-300 text-sm text-ink-600 hover:bg-sandal-50 transition-colors"
              >
                <Filter size={16} />
                <span>
                  {statusOptions.find((o) => o.value === filterStatus)?.label}
                </span>
                <ChevronDown size={14} />
              </button>
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-elevated border border-sandal-200 py-1 z-10">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterStatus(option.value);
                        setShowDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-sandal-50 transition-colors ${
                        filterStatus === option.value
                          ? 'text-gold-600 font-medium bg-gold-50'
                          : 'text-ink-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sandal-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider">
                  订单信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider">
                  包间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wider">
                  时段
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-ink-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-ink-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-ink-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sandal-100">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-ink-400">
                    <RefreshCw className="mx-auto mb-3 opacity-50" size={32} />
                    <p>暂无账单记录</p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const booking = getBookingById(bill.bookingId);
                  const room = getRoomById(bill.roomId);
                  const statusInfo = getStatusInfo(bill.status);
                  const totalHours = bill.tierDetails.reduce(
                    (sum, seg) => sum + seg.durationHours,
                    0
                  );

                  return (
                    <tr key={bill.id} className="hover:bg-sandal-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-ink-800">
                          {booking?.customerName || '-'}
                        </div>
                        <div className="text-xs text-ink-400 mt-0.5">
                          {booking?.customerPhone || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-ink-700">{room?.name || '-'}</div>
                        <div className="text-xs text-ink-400 mt-0.5">
                          {room?.capacity}人座
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-ink-700">
                          {booking
                            ? formatDateTime(parseDateTime(booking.startTime))
                            : '-'}
                        </div>
                        <div className="text-xs text-ink-400 mt-0.5">
                          时长 {formatDuration(totalHours)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-song text-lg font-bold text-gold-600">
                          ¥{bill.finalAmount.toFixed(2)}
                        </div>
                        {bill.baseAmount < bill.minConsumption && (
                          <div className="text-xs text-amber-500">含低消补足</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}
                        >
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedBillId(bill.id)}
                            className="p-2 text-ink-500 hover:text-ink-700 hover:bg-sandal-100 rounded-lg transition-colors"
                            title="查看详情"
                          >
                            <Eye size={18} />
                          </button>
                          {bill.status === 'pending' && (
                            <button
                              onClick={() => handleSettle(bill.id)}
                              className="p-2 text-bamboo-500 hover:text-bamboo-700 hover:bg-bamboo-50 rounded-lg transition-colors"
                              title="结算"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBillId && (
        <BillDetailDrawer
          billId={selectedBillId}
          onClose={() => setSelectedBillId(null)}
        />
      )}
    </div>
  );
}

function BillDetailDrawer({ billId, onClose }: { billId: string; onClose: () => void }) {
  const { getBillById, settleBill } = useBillStore();
  const { getBookingById } = useBookingStore();
  const { getRoomById } = useRoomStore();

  const bill = getBillById(billId);
  const booking = bill ? getBookingById(bill.bookingId) : null;
  const room = bill ? getRoomById(bill.roomId) : null;

  if (!bill || !booking || !room) return null;

  const totalHours = bill.tierDetails.reduce(
    (sum, seg) => sum + seg.durationHours,
    0
  );

  const hasMinConsumptionSupplement = bill.baseAmount < bill.minConsumption;
  const supplementAmount = hasMinConsumptionSupplement
    ? bill.minConsumption - bill.baseAmount
    : 0;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: '待结算', className: 'bg-amber-100 text-amber-700', icon: <Minus size={14} /> };
      case 'settled':
        return { text: '已结算', className: 'bg-bamboo-100 text-bamboo-700', icon: <CheckCircle size={14} /> };
      case 'refunded':
        return { text: '已退款', className: 'bg-ink-100 text-ink-500', icon: <RotateCcw size={14} /> };
      default:
        return { text: status, className: 'bg-ink-100 text-ink-500', icon: <Minus size={14} /> };
    }
  };

  const statusInfo = getStatusInfo(bill.status);

  const bookingStatusInfo = (() => {
    switch (booking.status) {
      case 'confirmed':
        return { text: '已确认', className: 'bg-gold-100 text-gold-700' };
      case 'completed':
        return { text: '已完成', className: 'bg-bamboo-100 text-bamboo-700' };
      case 'cancelled':
        return { text: '已取消', className: 'bg-ink-100 text-ink-500' };
      default:
        return { text: booking.status, className: 'bg-ink-100 text-ink-500' };
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white shadow-elevated animate-slide-up overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-sandal-200 bg-sandal-50 flex items-center justify-between">
          <h3 className="font-song text-lg font-bold text-sandal-900">账单详情</h3>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.className} flex items-center gap-1`}>
              {statusInfo.icon}
              {statusInfo.text}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {bill.status === 'refunded' && (
            <div className="bg-ink-50 rounded-xl p-4 border border-ink-200">
              <div className="flex items-start gap-2">
                <RotateCcw className="text-ink-400 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-medium text-ink-600">已退订退款</p>
                  <p className="text-sm text-ink-400 mt-1">
                    预订已取消，对应排期已释放，账单已标记为已退款
                  </p>
                  {booking.status === 'cancelled' && (
                    <p className="text-xs text-ink-400 mt-1">
                      预订状态：已取消 · 排期已释放
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-sandal-50 rounded-xl p-4 border border-sandal-200">
            <h4 className="font-medium text-ink-700 mb-3">客户信息</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">姓名</span>
                <span className="text-ink-800 font-medium">{booking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">电话</span>
                <span className="text-ink-800">{booking.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">人数</span>
                <span className="text-ink-800">{booking.guests} 人</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">预订状态</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bookingStatusInfo.className}`}>
                  {bookingStatusInfo.text}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-sandal-50 rounded-xl p-4 border border-sandal-200">
            <h4 className="font-medium text-ink-700 mb-3">包间信息</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">包间名称</span>
                <span className="text-ink-800 font-medium">{room.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">容纳人数</span>
                <span className="text-ink-800">{room.capacity} 人</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">最低消费</span>
                <span className="text-ink-800 font-medium">¥{bill.minConsumption.toFixed(2)}</span>
              </div>
              {!room.active && (
                <div className="mt-1 text-xs text-amber-600">
                  ⚠ 该包间当前已停用
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-ink-700 mb-3">消费时段</h4>
            <div className="text-sm text-ink-600">
              {formatDateTime(parseDateTime(booking.startTime))}
            </div>
            <div className="text-sm text-ink-600">
              至 {formatDateTime(parseDateTime(booking.endTime))}
            </div>
            <div className="text-sm text-ink-400 mt-1">
              共 {formatDuration(totalHours)}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-ink-700 mb-3">分段计费明细</h4>
            <div className="space-y-3">
              {bill.tierDetails.map((seg, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-3 border border-sandal-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-sm font-medium text-ink-700">
                        {seg.tierLabel}
                      </span>
                    </div>
                    <span className="font-song text-base font-bold text-gold-600">
                      ¥{seg.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-400">
                    <span>{seg.startTime} - {seg.endTime}</span>
                    <span>
                      ¥{seg.pricePerHour.toFixed(2)}/h × {seg.durationHours}h = ¥{seg.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-sandal-900 to-sandal-800 rounded-xl p-5 text-white">
            <h4 className="text-sandal-300 text-sm mb-3">核算过程</h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-sandal-300">① 分段合计（基础费用）</span>
                <span className="text-sandal-200">¥{bill.baseAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sandal-300">② 包间最低消费</span>
                <span className="text-sandal-200">¥{bill.minConsumption.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2 text-xs py-1">
                <span className="text-sandal-400">
                  {hasMinConsumptionSupplement ? '① ＜ ②' : '① ≥ ②'}
                </span>
                <span className="text-sandal-400">
                  {hasMinConsumptionSupplement
                    ? '基础费用未达低消门槛'
                    : '基础费用已满足低消门槛'}
                </span>
              </div>

              {hasMinConsumptionSupplement && (
                <div className="flex justify-between items-center pl-3 border-l-2 border-gold-500">
                  <span className="text-gold-400 flex items-center gap-1">
                    <ArrowUp size={14} />
                    低消补足
                  </span>
                  <span className="text-gold-400 font-medium">
                    +¥{supplementAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-sandal-400 pt-1">
                <span>
                  最终应收 = max(①, ②) = max(¥{bill.baseAmount.toFixed(2)}, ¥{bill.minConsumption.toFixed(2)})
                </span>
              </div>

              <div className="pt-3 mt-1 border-t border-sandal-700">
                <div className="flex justify-between items-center">
                  <span className="text-sandal-200 font-medium">最终应收</span>
                  <span className="font-song text-3xl font-bold text-gold-400">
                    ¥{bill.finalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-sandal-50 rounded-xl p-3 border border-sandal-200">
            <div className="flex justify-between text-xs text-ink-400">
              <span>账单编号</span>
              <span className="font-mono">{bill.id}</span>
            </div>
            <div className="flex justify-between text-xs text-ink-400 mt-1">
              <span>创建时间</span>
              <span>{formatDateTime(parseDateTime(bill.createdAt))}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-sandal-200 bg-white">
          {bill.status === 'pending' ? (
            <button
              onClick={() => settleBill(bill.id)}
              className="w-full px-4 py-3 rounded-lg bg-bamboo-500 text-white font-medium hover:bg-bamboo-600 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              确认结算
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-3 rounded-lg bg-sandal-100 text-sandal-700 font-medium hover:bg-sandal-200 transition-colors"
            >
              关闭
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
