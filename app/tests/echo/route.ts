import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  return NextResponse.json({
    host: req.headers.get("host"),
    xForwardedHost: req.headers.get("x-forwarded-host"),
    xForwardedProto: req.headers.get("x-forwarded-proto"),
    cookieSeen: req.headers.get("cookie")?.slice(0, 120) ?? "",
  });
}