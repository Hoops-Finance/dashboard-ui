export function ema(data: number[], period: number): number[] {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  let prev = data[0];
  const emaVals: number[] = [prev];
  for (let i = 1; i < data.length; i++) {
    prev = data[i] * k + prev * (1 - k);
    emaVals.push(prev);
  }
  return emaVals;
}

export function calcMACD(data: number[]): { macd: number[]; signal: number[] } {
  if (data.length < 26) return { macd: [], signal: [] };
  const ema12 = ema(data, 12);
  const ema26 = ema(data, 26);
  const macdVals: number[] = [];
  for (let i = 25; i < data.length; i++) {
    macdVals.push(ema12[i] - ema26[i]);
  }
  const signal = ema(macdVals, 9);
  return { macd: macdVals, signal };
}

export function calcRSI(data: number[]): number[] {
  const period = 14;
  if (data.length < period + 1) return [];
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = data[i] - data[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  const rsiArr: number[] = [];
  rsiArr.push(100 - 100 / (1 + avgGain / avgLoss));
  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    if (diff > 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - diff) / period;
    }
    const rs = avgGain / avgLoss;
    rsiArr.push(100 - 100 / (1 + rs));
  }
  return rsiArr;
}

export function calcSMA(data: number[], period: number): number[] {
  if (data.length < period) return [];
  const smaVals: number[] = [];
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  smaVals.push(sum / period);
  for (let i = period; i < data.length; i++) {
    sum += data[i] - data[i - period];
    smaVals.push(sum / period);
  }
  return smaVals;
}

export function calcBollinger(data: number[], period = 20, multiplier = 2): { upper: number[]; middle: number[]; lower: number[] } {
  if (data.length < period) return { upper: [], middle: [], lower: [] };
  const middle = calcSMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];
  // middle.length = data.length - period + 1
  // For each middle value, we compute stddev of that slice
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const avg = middle[i - (period - 1)];
    const variance = slice.reduce((acc, val) => acc + (val - avg) ** 2, 0) / period;
    const stdDev = Math.sqrt(variance);
    upper.push(avg + multiplier * stdDev);
    lower.push(avg - multiplier * stdDev);
  }
  return { upper, middle, lower };
}
