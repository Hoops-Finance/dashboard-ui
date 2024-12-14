import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";

interface OauthDelinkRequest {
  provider: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { provider } = await req.json() as OauthDelinkRequest;

  const res = await fetch(`${process.env.AUTH_API_URL}/auth/oauth/delink`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${process.env.AUTH_API_KEY}`,
      "Authorization": `Bearer ${session.user.accessToken}`
    },
    body: JSON.stringify({ provider: provider })
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json(data);
}
