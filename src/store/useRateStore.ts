import { create } from 'zustand';
import type { RateTier } from '../types';
import { mockRateTiers } from '../data/mockData';

interface RateState {
  rateTiers: RateTier[];
  updateRateTier: (id: string, tier: Partial<RateTier>) => void;
  getRateTierById: (id: string) => RateTier | undefined;
  getSortedRateTiers: () => RateTier[];
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

export const useRateStore = create<RateState>((set, get) => ({
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
}));
