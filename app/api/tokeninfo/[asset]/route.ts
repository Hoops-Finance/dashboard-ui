// /app/api/tokeninfo/[asset]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AssetDetails } from "@/utils/types";
import httpStatus from "http-status";

const API_BASE_URL = `${process.env.SXX_API_BASE}/explorer/public/asset`;
const API_KEY = process.env.SXX_API_KEY; // Ensure this is set in your .env.local

export async function GET(request: NextRequest, { params }: { params: { asset: string } }) {
  const { asset } = params;

  if (!asset) {
    return NextResponse.json(
      { error: "Asset parameter is required." },
      { status: httpStatus.BAD_REQUEST },
    );
  }
  let assetId;
  if (asset.toLowerCase() === "xlm" || asset.toLowerCase() === "native") {
    assetId = "XLM";
  } else if (asset.includes(":")) {
    assetId = asset.replace(/:/g, "-");
  } else {
    assetId = asset;
  }
  const fetchUrl = `${API_BASE_URL}/${assetId}`;

  try {
    const response = await fetch(fetchUrl, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const data = (await response.json()) as AssetDetails;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching token info:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: httpStatus.INTERNAL_SERVER_ERROR },
    );
  }
}
