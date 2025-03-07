import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { ApiKeyListResponse } from "@/utils/types";
import httpStatus from "http-status";
export async function GET(req: NextRequest) {
  console.log(`[APIKEY-LIST] GET /api/developer/apikey/list`);
  const session = await auth();

  if (!session?.user.accessToken) {
    console.log("attempt to access keys unauthenticated.");
    return NextResponse.json({ error: "Not authenticated" }, { status: httpStatus.UNAUTHORIZED });
  }

  const res = await fetch(`${process.env.AUTH_API_URL}/auth/apikey/list`, {
    headers: {
      "x-api-key": `${process.env.AUTH_API_KEY}`,
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  });
  if (!res.ok) {
    console.log("error fetching keys:", res.status);
    return NextResponse.json({ error: "Failed to fetch keys" }, { status: res.status });
  }
  const data = (await res.json()) as ApiKeyListResponse;
  console.log("data from apikey list:", data);
  if (!data.keys) {
    console.log("no keys found");
    return NextResponse.json({ error: "No keys found" }, { status: httpStatus.NO_CONTENT });
  }
  if (!data.success) {
    console.log("other api error:", data.message);
    return NextResponse.json({ error: data.message }, { status: httpStatus.UNPROCESSABLE_ENTITY });
  }
  return new NextResponse(JSON.stringify(data), { status: res.status });
}
