// utils/utilities.ts
import type { UTCTimestamp } from "lightweight-charts";

// Shared data types
export interface CandleDataPoint {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VolumeDataPoint {
  time: UTCTimestamp;
  value: number;
  color: string;
}

// Utility functions for parsing and calculations

export function parseAPR(aprString: string): number {
  if (!aprString) return 0;
  const n = parseFloat(aprString.replace(/[^0-9.-]+/g, ''));
  return isNaN(n) ? 0 : n;
}

export function parseVolume(volumeString: string): number {
  const n = parseFloat(volumeString.replace(/[^0-9.-]+/g, ''));
  return isNaN(n) ? 0 : n;
}

// Format period label
export const PERIODS_LABELS: Record<string, string> = {
  '24h': '24H',
  '7d': '7D',
  '14d': '14D',
  '30d': '30D',
  '90d': '90D',
  '180d': '180D',
  '360d': '360D'
};
