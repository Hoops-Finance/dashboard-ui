// /utils/testApi.ts
import { TransformedCandleData } from "./types";
async function testFetchCandles(): Promise<void> {
  const token0 = "USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN-1";
  const token1 = "XLM"; //native
  const from = 1611187200; // Example UNIX timestamp
  const to = 1613606400; // Example UNIX timestamp

  try {
    const response = await fetch(`http://localhost:3001/api/candles/${token0}?from=${from}&to=${to}`);
    const data = (await response.json()) as TransformedCandleData[];
    console.log("Token Candle Data[0]:", data[0]);

    const response2 = await fetch(`http://localhost:3001/api/candles/${token0}/${token1}?from=${from}&to=${to}`);
    const data2 = (await response2.json()) as TransformedCandleData[];
    console.log("Market Candle Data2[0]:", data2[0]);
  } catch (error) {
    console.error("Error fetching candle data:", error);
  }
}

void testFetchCandles();
