import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";

interface updateUserResponse {
    success: boolean;
    metadata: string;
};
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { name, phoneNumber, avatar } = (await req.json()) as {
    name?: string;
    phoneNumber?: string;
    avatar?: string;
  };

  const res = await fetch(`${process.env.AUTH_API_URL}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${process.env.AUTH_API_KEY}`,
      Authorization: `Bearer ${session.user.accessToken}`
    },
    body: JSON.stringify({ name, phoneNumber, avatar })
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const data = await res.json() as updateUserResponse;
  return NextResponse.json(data, { status: 200 });
}
