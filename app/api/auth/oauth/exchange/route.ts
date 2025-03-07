import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { AuthResult, OAuthLoginRequest } from "@/utils/types";

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log(`[OAUTH-EXCHANGE] POST /api/auth/oauth/exchange`);
  console.log(`[OAUTH-EXCHANGE] Request body: ${JSON.stringify(req.body)}`);
  const session = await auth();
  const { provider, code, state } = (await req.json()) as OAuthLoginRequest;

  if (!provider || !code || !state) {
    return NextResponse.json({ error: "Missing provider, code or state" }, { status: 400 });
  }

  const isLoggedIn = !!session?.user.accessToken;
  const url = isLoggedIn
    ? `${process.env.AUTH_API_URL}/auth/oauth/link`
    : `${process.env.AUTH_API_URL}/auth/oauth/login`;

  console.log(`Exchange request to ${url} with provider ${provider} and code ${code}`);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": `${process.env.AUTH_API_KEY}`,
  };
  if (isLoggedIn && session.user.accessToken) {
    headers.Authorization = `Bearer ${session.user.accessToken}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ provider, code, state }),
  });

  const data = (await res.json()) as AuthResult;
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const userData = {
    id: data.id,
    email: data.email,
    name: data.email?.split("@")[0] ?? "User",
    avatar: null,
    premium_subscription: false,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };

  return NextResponse.json(userData, { status: 200 });
}
