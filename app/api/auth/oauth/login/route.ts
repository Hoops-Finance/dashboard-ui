import { NextRequest, NextResponse } from "next/server";

interface OAuthLoginRequest {
  provider: string;
  code: string;
}

interface OAuthLoginSuccessResponse {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  premium_subscription: boolean;
  accessToken: string;
  refreshToken: string;
}

export async function POST(req: NextRequest) {
  const { provider, code } = (await req.json()) as OAuthLoginRequest;

  const res = await fetch(`${process.env.AUTH_API_URL}/auth/oauth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${process.env.AUTH_API_KEY}`,
    },
    body: JSON.stringify({ provider, code }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Expect { success: false, message: "No account for this OAuth email", email: "..."} if no account
    return NextResponse.json(data, { status: res.status });
  }

  // data should contain { success: true, token, refreshToken, ... } plus at least email and id
  // Transform for createUser format in auth.ts:
  return NextResponse.json({
    id: data.id,
    email: data.email,
    name: data.email?.split("@")[0] || "User",
    avatar: null,
    premium_subscription: false,
    accessToken: data.token,
    refreshToken: data.refreshToken
  } as OAuthLoginSuccessResponse);
}
