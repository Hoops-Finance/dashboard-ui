import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { UserProfile } from "@/utils/types";

export async function GET(req: NextRequest) {
  // 1) Check NextAuth session
  const session = await auth();
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    console.log('in the profile api route')
    const res = await fetch(`${process.env.AUTH_API_URL}/auth/user_profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        "x-api-key": process.env.AUTH_API_KEY || "",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to fetch user profile", details: text },
        { status: 500 }
      );
    }

    const data = await res.json() as UserProfile;
    console.log('data', data)
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/userprofile] Error fetching profile:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
