import type { RateTier, TierSegment } from '../types';
import {
  parseDateTime,
  setTimeToDate,
  getStartOfDay,
  addDays,
  getDurationHours,
  formatTime,
} from './datetime';

interface BillingResult {
  baseAmount: number;
  finalAmount: number;
  tierDetails: TierSegment[];
}

export function calculateBilling(
  startTime: string,
  endTime: string,
  rateTiers: RateTier[],
  minConsumption: number
): BillingResult {
  const start = parseDateTime(startTime);
  const end = parseDateTime(endTime);

  const daySegments = splitByDays(start, end);

  const allSegments: TierSegment[] = [];

  for (const { dayStart, dayEnd } of daySegments) {
    const daySegmentsWithTier = matchRateTiers(dayStart, dayEnd, rateTiers);
    allSegments.push(...daySegmentsWithTier);
  }

  const baseAmount = allSegments.reduce((sum, seg) => sum + seg.amount, 0);
  const finalAmount = Math.max(baseAmount, minConsumption);

  return {
    baseAmount: Math.round(baseAmount * 100) / 100,
    finalAmount: Math.round(finalAmount * 100) / 100,
    tierDetails: allSegments,
  };
}

interface DaySegment {
  dayStart: Date;
  dayEnd: Date;
}

function splitByDays(start: Date, end: Date): DaySegment[] {
  const segments: DaySegment[] = [];
  let currentStart = start;

  while (currentStart < end) {
    const dayEnd = addDays(getStartOfDay(currentStart), 1);
    const currentEnd = dayEnd < end ? dayEnd : end;

    segments.push({
      dayStart: new Date(currentStart),
      dayEnd: new Date(currentEnd),
    });

    currentStart = dayEnd;
  }

  return segments;
}

function matchRateTiers(
  segmentStart: Date,
  segmentEnd: Date,
  rateTiers: RateTier[]
): TierSegment[] {
  const segments: TierSegment[] = [];
  const dayDate = getStartOfDay(segmentStart);

  for (const tier of rateTiers) {
    const tierStart = setTimeToDate(dayDate, tier.startTime);
    const tierEnd = setTimeToDate(dayDate, tier.endTime);

    if (tier.endTime <= tier.startTime) {
      continue;
    }

    const overlapStart = new Date(Math.max(segmentStart.getTime(), tierStart.getTime()));
    const overlapEnd = new Date(Math.min(segmentEnd.getTime(), tierEnd.getTime()));

    if (overlapStart < overlapEnd) {
      const durationHours = getDurationHours(overlapStart, overlapEnd);
      const amount = durationHours * tier.pricePerHour;

      segments.push({
        tierName: tier.name,
        tierLabel: tier.label,
        color: tier.color,
        pricePerHour: tier.pricePerHour,
        startTime: formatTime(overlapStart),
        endTime: formatTime(overlapEnd),
        durationHours: Math.round(durationHours * 100) / 100,
        amount: Math.round(amount * 100) / 100,
      });
    }
  }

  return segments.sort(
    (a, b) => parseTimeMinutes(a.startTime) - parseTimeMinutes(b.startTime)
  );
}

function parseTimeMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function getTotalDuration(segments: TierSegment[]): number {
  return segments.reduce((sum, seg) => sum + seg.durationHours, 0);
}

export function formatDuration(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) {
    return `${wholeHours}小时`;
  }
  return `${wholeHours}小时${minutes}分钟`;
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}
