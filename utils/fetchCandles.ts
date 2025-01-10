// /utils/fetchCandles.ts

import { UTCTimestamp } from "lightweight-charts";
import { RawCandleRecord } from "./types";

interface CandleData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface ErrorResponse {
  error?: string;
}

export async function fetchMarketCandles(token0: string, token1: string, from: number, to: number): Promise<CandleData[]> {
  try {
    const response = await fetch(`/api/candles/${token0}/${token1}?from=${from}&to=${to}`);

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData.error ?? "Failed to fetch market candles");
    }
    const data = (await response.json()) as RawCandleRecord[];
    return data.map((record: RawCandleRecord) => ({
      time: record.time as UTCTimestamp,
      open: record.open,
      high: record.high,
      low: record.low,
      close: record.close
    }));
  } catch (error) {
    console.error("Error in fetchMarketCandles:", error);
    throw error;
  }
}

export async function fetchTokenCandles(token0: string, from: number, to: number): Promise<CandleData[]> {
  try {
    const response = await fetch(`/api/candles/${token0}?from=${from}&to=${to}`);

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData.error ?? "Failed to fetch token candles");
    }
    const data = (await response.json()) as RawCandleRecord[];
    return data.map((record: RawCandleRecord) => ({
      time: record.time as UTCTimestamp,
      open: record.open,
      high: record.high,
      low: record.low,
      close: record.close
    }));
  } catch (error) {
    console.error("Error in fetchTokenCandles:", error);
    throw error;
  }
}
