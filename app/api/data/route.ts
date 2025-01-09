import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const [marketsRes, pairsRes, tokensRes] = await Promise.all([fetch("https://api.hoops.finance/markets"), fetch("https://api.hoops.finance/pairs"), fetch("https://api.hoops.finance/tokens")]);

    if (!marketsRes.ok || !pairsRes.ok || !tokensRes.ok) {
      return NextResponse.json({ error: "Failed to fetch data from backend" }, { status: 500 });
    }

    const [marketsData, pairsData, tokensData] = await Promise.all([marketsRes.json(), pairsRes.json(), tokensRes.json()]);

    // Return combined result
    return NextResponse.json(
      {
        markets: marketsData,
        pairs: pairsData,
        tokens: tokensData
      },
      {
        headers: { "Cache-Control": "no-store" }
      }
    );
  } catch (error: unknown) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
