import { NextRequest, NextResponse } from "next/server";
import httpStatus from "http-status";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider");
  const state = searchParams.get("state"); // csrfToken from frontend

  if (!provider) {
    return NextResponse.json({ error: "Missing provider" }, { status: httpStatus.NOT_ACCEPTABLE });
  }
  if (!state) {
    return NextResponse.json({ error: "Missing state (csrfToken)" }, { status: httpStatus.PRECONDITION_REQUIRED });
  }

  let authUrl = "";

  if (provider === "google") {
    const clientId = process.env.AUTH_GOOGLE_ID ?? "";
    const redirectUri = process.env.AUTH_GOOGLE_REDIRECT_URI ?? "";
    console.log(redirectUri);

    const scope = "email profile";
    const responseType = "code";
    const prompt = "consent";

    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&prompt=${prompt}&state=${encodeURIComponent(state)}`;

    console.log(`[OAUTH-START] Google auth URL: ${authUrl}`);
  } else if (provider === "discord") {
    if (!process.env.AUTH_DISCORD_ID || !process.env.AUTH_DISCORD_REDIRECT_URI) {
      console.log("no env apparently");
      console.log(!process.env.AUTH_DISCORD_ID);
      console.log(!process.env.AUTH_DISCORD_REDIRECT_URI);
      throw new Error("Missing Discord OAuth configuration");
    } else {
      const clientId = process.env.AUTH_DISCORD_ID;
      const redirectUri = process.env.AUTH_DISCORD_REDIRECT_URI;
      const scope = "identify email";
      const responseType = "code";
      console.log(redirectUri);
      authUrl = `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;
      console.log(`[OAUTH-START] Discord auth URL: ${authUrl}`);
    }
  } else {
    return NextResponse.json({ error: "Unknown provider" }, { status: httpStatus.NOT_IMPLEMENTED });
  }

  return NextResponse.redirect(authUrl);
}
