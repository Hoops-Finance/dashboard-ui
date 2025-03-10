import { MetricsResponse } from "@/utils/types";
import { NextRequest, NextResponse } from "next/server";
import httpStatus from "http-status";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period");
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_DATA_URI}/getmetrics?period=${period}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { Authorization: process.env.API_KEY ?? "" },
      cache: "no-store", // Ensure no caching
    });

    if (!response.ok) {
      throw new Error(`${response.status}`);
    }

    const data = (await response.json()) as MetricsResponse;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching metrics from API:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics from API" },
      { status: httpStatus.SERVICE_UNAVAILABLE },
    );
  }
}
