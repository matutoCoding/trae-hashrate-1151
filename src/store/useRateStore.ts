import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RateTier } from '../types';
import { mockRateTiers } from '../data/mockData';

interface RateState {
  rateTiers: RateTier[];
  updateRateTier: (id: string, tier: Partial<RateTier>) => void;
  getRateTierById: (id: string) => RateTier | undefined;
  getSortedRateTiers: () => RateTier[];
  validateRateTiers: (tiers?: RateTier[]) => string[];
}

function sortByStartTime(tiers: RateTier[]): RateTier[] {
  return [...tiers].sort((a, b) => {
    const timeToMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });
}

export function validateTierOverlap(tiers: RateTier[]): string[] {
  const errors: string[] = [];
  const sorted = sortByStartTime(tiers);

  if (sorted.length === 0) {
    return ['至少需要一个费率时段'];
  }

  const BUSINESS_START = 8 * 60;
  const BUSINESS_END = 23 * 60;

  const firstStartMin = timeToMinutes(sorted[0].startTime);
  if (firstStartMin > BUSINESS_START) {
    const startHour = Math.floor(BUSINESS_START / 60);
    const startMin = BUSINESS_START % 60;
    const gapStartStr = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
    errors.push(`营业时间开头存在空档（${gapStartStr} - ${sorted[0].startTime}）`);
  }

  const lastEndMin = timeToMinutes(sorted[sorted.length - 1].endTime);
  if (lastEndMin < BUSINESS_END) {
    const endHour = Math.floor(BUSINESS_END / 60);
    const endMin = BUSINESS_END % 60;
    const gapEndStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
    errors.push(`营业时间结尾存在空档（${sorted[sorted.length - 1].endTime} - ${gapEndStr}）`);
  }

  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i];
    const startMin = timeToMinutes(tier.startTime);
    const endMin = timeToMinutes(tier.endTime);

    if (startMin >= endMin) {
      errors.push(`「${tier.label}」开始时间必须早于结束时间`);
    }

    if (startMin < BUSINESS_START) {
      const startHour = Math.floor(BUSINESS_START / 60);
      const startMin2 = BUSINESS_START % 60;
      const bsStr = `${String(startHour).padStart(2, '0')}:${String(startMin2).padStart(2, '0')}`;
      errors.push(`「${tier.label}」开始时间（${tier.startTime}）早于营业时间（${bsStr}）`);
    }

    if (endMin > BUSINESS_END) {
      const endHour = Math.floor(BUSINESS_END / 60);
      const endMin2 = BUSINESS_END % 60;
      const beStr = `${String(endHour).padStart(2, '0')}:${String(endMin2).padStart(2, '0')}`;
      errors.push(`「${tier.label}」结束时间（${tier.endTime}）晚于营业时间（${beStr}）`);
    }

    if (i > 0) {
      const prevEndMin = timeToMinutes(sorted[i - 1].endTime);
      if (startMin < prevEndMin) {
        errors.push(`「${sorted[i - 1].label}」与「${tier.label}」时段重叠（${sorted[i - 1].endTime} - ${tier.startTime}）`);
      }
      if (startMin > prevEndMin) {
        const gapStart = sorted[i - 1].endTime;
        const gapEnd = tier.startTime;
        errors.push(`「${sorted[i - 1].label}」与「${tier.label}」之间存在空档（${gapStart} - ${gapEnd}）`);
      }
    }
  }

  return errors;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

export const useRateStore = create<RateState>()(
  persist(
    (set, get) => ({
      rateTiers: mockRateTiers,

      updateRateTier: (id, tier) => {
        set((state) => ({
          rateTiers: state.rateTiers.map((t) =>
            t.id === id ? { ...t, ...tier } : t
          ),
        }));
      },

      getRateTierById: (id) => {
        return get().rateTiers.find((t) => t.id === id);
      },

      getSortedRateTiers: () => {
        return sortByStartTime(get().rateTiers);
      },

      validateRateTiers: (tiers) => {
        return validateTierOverlap(tiers || get().rateTiers);
      },
    }),
    {
      name: 'tea-room-rates',
    }
  )
);
