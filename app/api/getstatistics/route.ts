// /app/api/getstatistics/[route].tsx
import { NextRequest, NextResponse } from "next/server";
import { PoolRiskApiResponseObject } from "@/utils/types"; // Adjust the import path
import httpStatus from "http-status";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period");
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_DATA_URI}/getstatistics?period=${period}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { Authorization: process.env.API_KEY ?? "" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as PoolRiskApiResponseObject[];
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data from API:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from API" },
      { status: httpStatus.SERVICE_UNAVAILABLE },
    );
  }
}
