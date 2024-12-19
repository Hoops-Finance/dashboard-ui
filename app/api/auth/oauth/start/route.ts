import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider");
  const state = searchParams.get("state"); // csrfToken from frontend

  if (!provider) {
    return NextResponse.json({ error: "Missing provider" }, { status: 400 });
  }
  if (!state) {
    return NextResponse.json({ error: "Missing state (csrfToken)" }, { status: 400 });
  }

  let authUrl = "";

  if (provider === "google") {
    const clientId = process.env.AUTH_GOOGLE_ID || "";
    const redirectUri = process.env.AUTH_GOOGLE_REDIRECT_URI || "";
    const scope = "email profile";
    const responseType = "code";
    const prompt = "consent";

    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&prompt=${prompt}&state=${encodeURIComponent(state)}`;
  } else if (provider === "discord") {
    const clientId = process.env.AUTH_DISCORD_ID || "";
    const redirectUri = process.env.AUTH_DISCORD_REDIRECT_URI || "";
    const scope = "identify email";
    const responseType = "code";

    authUrl = `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;
  } else {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  return NextResponse.redirect(authUrl);
}
