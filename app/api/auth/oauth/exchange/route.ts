import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";

interface ExchangeRequest {
  provider: string;
  code: string;
  state?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  const { provider, code, state } = await req.json() as ExchangeRequest;

  if (!provider || !code || !state) {
    return NextResponse.json({ error: "Missing provider, code or state" }, { status: 400 });
  }

  const isLoggedIn = !!session?.user?.accessToken;

  const url = isLoggedIn
    ? `${process.env.AUTH_API_URL}/auth/oauth/link`
    : `${process.env.AUTH_API_URL}/auth/oauth/login`;

  const headers: Record<string,string> = {
    "Content-Type": "application/json",
    "x-api-key": `${process.env.AUTH_API_KEY}`
  };
  if (isLoggedIn && session.user.accessToken) {
    headers["Authorization"] = `Bearer ${session.user.accessToken}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ provider, code, state })
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const userData = {
    id: data.id,
    email: data.email,
    name: data.email.split("@")[0] || "User",
    avatar: null,
    premium_subscription: false,
    accessToken: data.accessToken ?? data.token,
    refreshToken: data.refreshToken
  };

  return NextResponse.json(userData, { status: 200 });
}
