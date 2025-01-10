import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { AuthResult, OauthProviders } from "@/utils/types";

interface OauthDelinkRequest {
  provider: OauthProviders;
}

export async function POST(req: NextRequest) {
  console.log("[OAUTH-DELINK] POST /api/auth/oauth/delink");
  const session = await auth();
  if (!session?.user.accessToken) {
    console.log("[OAUTH-DELINK] Not authenticated");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { provider } = (await req.json()) as OauthDelinkRequest;
  console.log(`[OAUTH-DELINK] Requesting to delink provider=${provider}`);

  const res = await fetch(`${process.env.AUTH_API_URL}/auth/oauth/delink`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${process.env.AUTH_API_KEY}`,
      Authorization: `Bearer ${session.user.accessToken}`
    },
    body: JSON.stringify({ provider })
  });

  const data = (await res.json()) as AuthResult;
  console.log(`[OAUTH-DELINK] Response: ${JSON.stringify(data)}`);

  if (res.ok) {
    if (!data.success) {
      return NextResponse.json(data, { status: 400 });
    }
    return NextResponse.json(data, { status: 200 });
  }

  return NextResponse.json(data, { status: res.status });
}
