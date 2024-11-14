import { NextRequest, NextResponse } from "next/server";
import { TransformedCandleData } from "utils/newTypes";
import { UTCTimestamp } from "lightweight-charts";

type CandleDataRaw = [number, number, number, number, number, number, number, number];

const API_BASE_URL = "https://api.stellar.expert/explorer/public/market";
const API_KEY = process.env.SXX_API_KEY;

export async function GET(request: NextRequest, { params }: { params: { token0: string; token1: string } }) {
  let { token0, token1 } = params;

  if (token0.toLowerCase() === "xlm" || token0.toLowerCase() === "native") {
    token0 = "XLM";
  }
  if (token1.toLowerCase() === "xlm" || token1.toLowerCase() === "native") {
    token1 = "XLM";
  }

  // Normalize token names by replacing ":" with "-"
  token0 = token0.replace(/:/g, "-");
  token1 = token1.replace(/:/g, "-");

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "Missing query parameters: from and to are required." }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${token0}/${token1}/candles?from=${from}&to=${to}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data: CandleDataRaw[] = await response.json(); // API returns an array of arrays

    // Transform the raw data
    const transformedData: TransformedCandleData[] = data.map((record: CandleDataRaw, index: number, array: CandleDataRaw[]): TransformedCandleData => {
      const nextCandleOpen = index < array.length - 1 ? array[index + 1][1] : record[1];

      return {
        time: record[0] as UTCTimestamp, // Cast the time to UTCTimestamp
        open: record[1], // Open price
        high: record[2], // High price
        low: record[3], // Low price
        close: nextCandleOpen, // Close price (set to next candle's open)
        baseVolume: record[4], // Base volume
        quoteVolume: record[5], // Quote volume
        tradesCount: record[6] // Trades count
      };
    });

    return NextResponse.json(transformedData, {
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow all origins for CORS
        "Cache-Control": "no-store, max-age=0" // Disable caching
      }
    });
  } catch (error) {
    console.error("Error fetching market pair candle data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
