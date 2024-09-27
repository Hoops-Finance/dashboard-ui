import { NextRequest, NextResponse } from "next/server";
import { SxCandleResponse } from "utils/newTypes";

const API_BASE_URL = "https://api.stellar.expert/explorer/public/asset";
const API_KEY = process.env.SXX_API_KEY;

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

    const data: SxCandleResponse[] = await response.json();

    // Transform the data to include the `close` value as the next candle's open
    const transformedData = data.map((record: SxCandleResponse, index: number, array) => {
      // Get the open value of the next candle (if it exists)
      const nextCandleOpen = index < array.length - 1 ? array[index + 1].open : record.open;

      return {
        time: record.time, // Unix timestamp
        open: record.open, // Open price
        high: record.high, // High price
        low: record.low, // Low price
        close: nextCandleOpen, // Close is the next candle's open
        baseVolume: record.baseVolume, // Base volume
        quoteVolume: record.quoteVolume, // Quote volume
        tradesCount: record.tradesCount // Trades count
      };
      /*
        time: record[0], // Unix timestamp
        open: record[1], // Open price
        high: record[2], // High price
        low: record[3], // Low price
        close: nextCandleOpen, // Close is the next candle's open
        baseVolume: record[4], // Base volume
        quoteVolume: record[5], // Quote volume
        tradesCount: record[6] // Trades count
      };
      */
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching candle data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
