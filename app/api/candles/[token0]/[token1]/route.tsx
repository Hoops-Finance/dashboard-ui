import { NextRequest, NextResponse } from "next/server";
import { SxCandleResponse } from "utils/newTypes";

const API_BASE_URL = "https://api.stellar.expert/explorer/public/market";
const API_KEY = process.env.SXX_API_KEY;
console.log("API_KEY", API_KEY);

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
  console.log("token0", token0);
  console.log("token1", token1);

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

    const data: SxCandleResponse[] = await response.json();

    // Transform data and ensure the `close` value is filled using the next candle's open value
    const transformedData = data.map((record: SxCandleResponse, index: number, array) => {
      // Get the open value of the next candle (if it exists)
      const nextCandleOpen = index < array.length - 1 ? array[index + 1].open : record.open;

      return {
        time: record.time, // Unix timestamp
        open: record.open, // Open price
        high: record.high, // High price
        low: record.low, // Low price
        close: nextCandleOpen, // Close value is the next candle's open value
        baseVolume: record.baseVolume, // Base volume
        quoteVolume: record.quoteVolume, // Quote volume
        tradesCount: record.tradesCount // Trades count
      };
      /*
        time: record[0], // Unix timestamp
        open: record[1], // Open price
        high: record[2], // High price
        low: record[3], // Low price
        close: nextCandleOpen, // Close value is the next candle's open value
        baseVolume: record[4], // Base volume
        quoteVolume: record[5], // Quote volume
        tradesCount: record[6] // Trades count
      };
      */
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching market pair candle data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
