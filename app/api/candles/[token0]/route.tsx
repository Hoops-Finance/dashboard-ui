import { UTCTimestamp } from "lightweight-charts";
import { NextRequest, NextResponse } from "next/server";
import { SxCandleResponse } from "utils/newTypes";

const API_BASE_URL = "https://api.stellar.expert/explorer/public/asset";
const API_KEY = process.env.SXX_API_KEY;

type CandleDataRaw = [number, number, number, number, number, number, number]; // Adjusted raw data type

export async function GET(request: NextRequest, { params }: { params: { token0: string } }) {
  let { token0 } = params;

  // Normalize token name by replacing ":" with "-"
  if (token0 === "xlm" || token0 === "native") {
    token0 = "XLM";
  }
  token0 = token0.replace(/:/g, "-");

  // Extract query parameters for 'from' and 'to'
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "Missing query parameters: from and to are required." }, { status: 400 });
  }

  const fetchurl = `${API_BASE_URL}/${token0}/candles?from=${from}&to=${to}`;
  console.log(fetchurl);

  try {
    const response = await fetch(fetchurl, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data: CandleDataRaw[] = await response.json(); // Assume the API returns raw candle data

    // Transform the data to match the expected format with UTCTimestamp
    const transformedData = data.map((record: CandleDataRaw, index: number, array: CandleDataRaw[]) => {
      const nextCandleOpen = index < array.length - 1 ? array[index + 1][1] : record[1];

      return {
        time: record[0] as UTCTimestamp, // Cast time to UTCTimestamp
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
    console.error("Error fetching candle data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
