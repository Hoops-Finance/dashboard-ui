import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import httpStatus from "http-status";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: httpStatus.UNAUTHORIZED });
  }

  const { name } = (await req.json()) as { name: string };

  const res = await fetch(`${process.env.AUTH_API_URL}/auth/apikey/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${process.env.AUTH_API_KEY}`,
      Authorization: `Bearer ${session.user.accessToken}`
    },
    body: JSON.stringify({ name })
  });

  const data = (await res.json()) as { success: boolean; key: string };
  if (!res.ok) {
    return new NextResponse(JSON.stringify(data), { status: res.status });
  }
  return new NextResponse(JSON.stringify(data), { status: res.status });
}
