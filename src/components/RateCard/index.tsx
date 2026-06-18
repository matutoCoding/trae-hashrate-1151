import { useState } from 'react';
import { Edit3, Check, X, Clock, AlertTriangle } from 'lucide-react';
import type { RateTier } from '../../types';
import { validateTierOverlap } from '../../store/useRateStore';

interface RateCardProps {
  tier: RateTier;
  allTiers: RateTier[];
  onUpdate: (id: string, data: Partial<RateTier>) => void;
}

export default function RateCard({ tier, allTiers, onUpdate }: RateCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    pricePerHour: tier.pricePerHour,
    startTime: tier.startTime,
    endTime: tier.endTime,
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSave = () => {
    const hypotheticalTiers = allTiers.map((t) =>
      t.id === tier.id ? { ...t, ...editData } : t
    );
    const errors = validateTierOverlap(hypotheticalTiers);

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    onUpdate(tier.id, editData);
    setValidationErrors([]);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      pricePerHour: tier.pricePerHour,
      startTime: tier.startTime,
      endTime: tier.endTime,
    });
    setValidationErrors([]);
    setIsEditing(false);
  };

  const getBgColor = () => {
    switch (tier.name) {
      case 'peak':
        return 'from-red-50 to-orange-50 border-red-200';
      case 'normal':
        return 'from-amber-50 to-yellow-50 border-amber-200';
      case 'valley':
        return 'from-green-50 to-emerald-50 border-green-200';
      default:
        return 'from-slate-50 to-gray-50 border-slate-200';
    }
  };

  const getTextColor = () => {
    switch (tier.name) {
      case 'peak':
        return 'text-red-700';
      case 'normal':
        return 'text-amber-700';
      case 'valley':
        return 'text-green-700';
      default:
        return 'text-slate-700';
    }
  };

  const getAccentColor = () => {
    switch (tier.name) {
      case 'peak':
        return 'bg-red-500';
      case 'normal':
        return 'bg-amber-500';
      case 'valley':
        return 'bg-green-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div
      className={`bg-gradient-to-br ${getBgColor()} border rounded-2xl p-6 transition-all duration-300 hover:shadow-card ${
        validationErrors.length > 0 ? 'ring-2 ring-red-300' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getAccentColor()}`} />
          <h3 className={`font-song text-xl font-bold ${getTextColor()}`}>
            {tier.label}
          </h3>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg text-ink-400 hover:text-ink-600 hover:bg-white/50 transition-colors"
          >
            <Edit3 size={16} />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-ink-500 mb-1.5">时段价格（元/小时）</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400">¥</span>
              <input
                type="number"
                value={editData.pricePerHour}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    pricePerHour: Number(e.target.value),
                  })
                }
                className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-sandal-300 bg-white text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-ink-500 mb-1.5">时段范围</label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={editData.startTime}
                onChange={(e) =>
                  setEditData({ ...editData, startTime: e.target.value })
                }
                className="flex-1 px-3 py-2.5 rounded-lg border border-sandal-300 bg-white text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
              />
              <span className="text-ink-400">至</span>
              <input
                type="time"
                value={editData.endTime}
                onChange={(e) =>
                  setEditData({ ...editData, endTime: e.target.value })
                }
                className="flex-1 px-3 py-2.5 rounded-lg border border-sandal-300 bg-white text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
              />
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              {validationErrors.map((err, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-red-600 text-sm">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 rounded-lg border border-sandal-300 text-ink-600 text-sm font-medium hover:bg-white/50 transition-colors flex items-center justify-center gap-1"
            >
              <X size={16} />
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 rounded-lg bg-sandal-900 text-gold-400 text-sm font-medium hover:bg-sandal-800 transition-colors flex items-center justify-center gap-1"
            >
              <Check size={16} />
              保存
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-ink-500 mb-1">时段价格</p>
            <p className="font-song text-3xl font-bold text-ink-800">
              ¥{tier.pricePerHour}
              <span className="text-base font-normal text-ink-400 ml-1">/小时</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} className="text-ink-400" />
            <span className="text-ink-600 font-medium">
              {tier.startTime} - {tier.endTime}
            </span>
          </div>

          <div className="pt-2">
            <div className="h-2 bg-white/60 rounded-full overflow-hidden">
              <div
                className={`h-full ${getAccentColor()} rounded-full`}
                style={{ width: `${getTierPercentage(tier)}%` }}
              />
            </div>
            <p className="text-xs text-ink-400 mt-1.5">
              占营业时长 {getTierPercentage(tier).toFixed(0)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function getTierPercentage(tier: RateTier): number {
  const parseTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h + m / 60;
  };

  const start = parseTime(tier.startTime);
  const end = parseTime(tier.endTime);
  const duration = end - start;
  const totalHours = 15;

  return (duration / totalHours) * 100;
}
