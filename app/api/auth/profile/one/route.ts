import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { UserProfile } from "@/utils/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const res = await fetch(`${process.env.AUTH_API_URL}/auth/profile`, {
    headers: {
      "x-api-key": `${process.env.AUTH_API_KEY}`,
      Authorization: `Bearer ${session.user.accessToken}`
    }
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const data = (await res.json()) as UserProfile;
  return NextResponse.json(data, { status: 200 });
}
