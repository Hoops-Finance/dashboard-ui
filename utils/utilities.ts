// utils/ourutilities.ts
import type { UTCTimestamp } from 'lightweight-charts';

export type AllowedPeriods = '24h' | '7d' | '14d' | '30d' | '90d' | '180d' | '360d';

export const PERIOD_OPTIONS: { value: AllowedPeriods; label: string }[] = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '14d', label: '14D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '180d', label: '180D' },
  { value: '360d', label: '360D' }
];

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

export const STABLECOIN_IDS = new Set<string>([
  "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
  "CDIKURWHYS4FFTR5KOQK6MBFZA2K3E26WGBQI6PXBYWZ4XIOPJHDFJKP",
  "CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV",
  "CBN3NCJSMOQTC6SPEYK3A44NU4VS3IPKTARJLI3Y77OH27EWBY36TP7U"
]);

export function formatPeriodDisplay(p: AllowedPeriods): string {
  switch (p) {
    case '24h': return '24H';
    case '7d': return '7D';
    case '14d': return '14D';
    case '30d': return '30D';
    case '90d': return '90D';
    case '180d': return '180D';
    case '360d': return '360D';
    default: return '30D';
  }
}
