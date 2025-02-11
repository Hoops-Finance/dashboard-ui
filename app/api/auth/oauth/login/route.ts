import { AuthResult, OAuthLoginRequest } from "@/utils/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { provider, code, state } = (await req.json()) as OAuthLoginRequest;

  const res = await fetch(`${process.env.AUTH_API_URL}/auth/oauth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${process.env.AUTH_API_KEY}`,
    },
    body: JSON.stringify({ provider, code, state }),
  });

  const data = (await res.json()) as AuthResult;

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json({
    id: data.id,
    email: data.email,
    name: data.email?.split("@")[0] ?? "User",
    avatar: null,
    premium_subscription: false,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
}
