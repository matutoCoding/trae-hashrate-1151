import { useState } from 'react';
import { Clock, Info } from 'lucide-react';
import RateCard from '../components/RateCard';
import { useRateStore } from '../store/useRateStore';
import { useRoomStore } from '../store/useRoomStore';

export default function RatePage() {
  const { rateTiers, updateRateTier, getSortedRateTiers } = useRateStore();
  const { rooms } = useRoomStore();
  const sortedTiers = getSortedRateTiers();

  const handleUpdateRate = (id: string, data: any) => {
    updateRateTier(id, data);
  };

  const timelineSegments = sortedTiers.map((tier) => {
    const parseTime = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h + m / 60;
    };
    return {
      ...tier,
      startHour: parseTime(tier.startTime),
      endHour: parseTime(tier.endTime),
    };
  });

  const dayStart = 8;
  const dayEnd = 23;
  const totalHours = dayEnd - dayStart;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-soft border border-sandal-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-gold-600" size={22} />
          <h2 className="font-song text-xl font-bold text-sandal-900">时段费率</h2>
        </div>
        <p className="text-sm text-ink-500 mb-6">
          配置不同时段的计费标准，系统将根据预订时间自动分段计算费用
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sortedTiers.map((tier) => (
            <RateCard key={tier.id} tier={tier} onUpdate={handleUpdateRate} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-sandal-200 p-6">
        <h3 className="font-song text-lg font-bold text-sandal-900 mb-4">费率时段分布图</h3>

        <div className="relative pt-8 pb-4">
          <div className="flex justify-between text-xs text-ink-400 mb-2">
            <span>08:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>

          <div className="h-12 rounded-lg overflow-hidden flex">
            {timelineSegments.map((seg, idx) => {
              const widthPercent =
                ((seg.endHour - seg.startHour) / totalHours) * 100;
              const bgColor =
                seg.name === 'peak'
                  ? 'bg-gradient-to-r from-red-400 to-orange-400'
                  : seg.name === 'normal'
                  ? 'bg-gradient-to-r from-amber-300 to-yellow-400'
                  : 'bg-gradient-to-r from-green-400 to-emerald-400';

              return (
                <div
                  key={idx}
                  className={`${bgColor} flex items-center justify-center text-white text-sm font-medium`}
                  style={{ width: `${widthPercent}%` }}
                >
                  {seg.label}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            {sortedTiers.map((tier) => (
              <div key={tier.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tier.color }}
                />
                <span className="text-ink-600">
                  {tier.label}: ¥{tier.pricePerHour}/小时
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 bg-sandal-50 rounded-lg border border-sandal-200">
          <div className="flex items-start gap-2">
            <Info className="text-gold-600 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-ink-600">
              <p className="font-medium text-ink-700 mb-1">计费规则说明</p>
              <ul className="space-y-1 text-ink-500">
                <li>• 预订费用按实际占用时段分段计算，跨越费率切换点时自动拆分</li>
                <li>• 各时段金额相加为基础费用，与包间最低消费取较高值计费</li>
                <li>• 可在上方卡片中点击编辑按钮调整各时段价格和时间范围</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-sandal-200 p-6">
        <h3 className="font-song text-lg font-bold text-sandal-900 mb-4">各包间最低消费</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="p-4 bg-sandal-50 rounded-xl border border-sandal-200 text-center"
            >
              <p className="text-sm text-ink-500 mb-1">{room.name}</p>
              <p className="font-song text-2xl font-bold text-gold-600">
                ¥{room.minConsumption}
              </p>
              <p className="text-xs text-ink-400 mt-1">{room.capacity}人座</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
