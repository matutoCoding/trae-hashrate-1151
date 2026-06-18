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

  for (let i = 0; i < sorted.length; i++) {
    const tier = sorted[i];
    const startMin = timeToMinutes(tier.startTime);
    const endMin = timeToMinutes(tier.endTime);

    if (startMin >= endMin) {
      errors.push(`「${tier.label}」开始时间必须早于结束时间`);
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
