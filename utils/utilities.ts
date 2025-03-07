// utils/ourutilities.ts
import type { UTCTimestamp } from "lightweight-charts";

export type AllowedPeriods = "24h" | "7d" | "14d" | "30d" | "90d" | "180d" | "360d";

export const PERIOD_OPTIONS: { value: AllowedPeriods; label: string }[] = [
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "14d", label: "14D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "180d", label: "180D" },
  { value: "360d", label: "360D" },
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
  "CBN3NCJSMOQTC6SPEYK3A44NU4VS3IPKTARJLI3Y77OH27EWBY36TP7U",
]);

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getTimeRangeForPeriod(period: AllowedPeriods): { from: number; to: number } {
  const to = Math.floor(Date.now() / 1000);
  let from: number;
  switch (period) {
    case "24h":
      from = to - 24 * 3600;
      break;
    case "7d":
      from = to - 7 * 24 * 3600;
      break;
    case "14d":
      from = to - 14 * 24 * 3600;
      break;
    case "30d":
      from = to - 30 * 24 * 3600;
      break;
    case "90d":
      from = to - 90 * 24 * 3600;
      break;
    case "180d":
      from = to - 180 * 24 * 3600;
      break;
    case "360d":
      from = to - 360 * 24 * 3600;
      break;
    default:
      from = to - 14 * 24 * 3600;
      break;
  }
  return { from, to };
}

export const ALL_PERIODS: AllowedPeriods[] = ["24h", "7d", "14d", "30d", "90d", "180d", "360d"];

export function formatPeriodDisplay(p: AllowedPeriods): string {
  switch (p) {
    case "24h":
      return "24H";
    case "7d":
      return "7D";
    case "14d":
      return "14D";
    case "30d":
      return "30D";
    case "90d":
      return "90D";
    case "180d":
      return "180D";
    case "360d":
      return "360D";
    default:
      return "30D";
  }
}

interface HSLParams {
  h: number;
  s: number;
  l: number;
}

export function hslToHex({ h, s, l }: HSLParams): string {
  // Convert s and l from percentages to [0, 1] range.
  s /= 100;
  l /= 100;

  const c: number = (1 - Math.abs(2 * l - 1)) * s;
  const hPrime: number = h / 60;
  const x: number = c * (1 - Math.abs((hPrime % 2) - 1));
  let r = 0,
    g = 0,
    b = 0;

  if (hPrime >= 0 && hPrime < 1) {
    r = c;
    g = x;
    b = 0;
  } else if (hPrime >= 1 && hPrime < 2) {
    r = x;
    g = c;
    b = 0;
  } else if (hPrime >= 2 && hPrime < 3) {
    r = 0;
    g = c;
    b = x;
  } else if (hPrime >= 3 && hPrime < 4) {
    r = 0;
    g = x;
    b = c;
  } else if (hPrime >= 4 && hPrime < 5) {
    r = x;
    g = 0;
    b = c;
  } else if (hPrime >= 5 && hPrime < 6) {
    r = c;
    g = 0;
    b = x;
  }

  const m: number = l - c / 2;
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  const toHex = (num: number): string => num.toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
