import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { AuthResult } from "@/utils/types";

interface OauthLinkRequest {
  provider: string;
  code: string;
  state: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { provider, code, state } = (await req.json()) as OauthLinkRequest;

  const res = await fetch(`${process.env.AUTH_API_URL}/auth/oauth/link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${process.env.AUTH_API_KEY}`,
      Authorization: `Bearer ${session.user.accessToken}`
    },
    body: JSON.stringify({ provider, code, state })
  });

  const data = (await res.json()) as AuthResult;
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json(data);
}
