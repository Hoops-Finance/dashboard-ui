// Copyright 2024 - Hoops Finance - All rights reserved.
/* This unified route decides whether to login or link based on the user’s session. If no session, it calls the backend’s /auth/oauth/login endpoint. If session exists, it calls /auth/oauth/link.*/

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";

interface ExchangeRequest {
  provider: string;
  code: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const { provider, code } = await req.json() as ExchangeRequest;

  if (!provider || !code) {
    return NextResponse.json({ error: "Missing provider or code" }, { status: 400 });
  }

  // Determine mode based on session presence
  const isLoggedIn = !!session?.user?.accessToken;

  const url = isLoggedIn
    ? `${process.env.AUTH_API_URL}/auth/oauth/link`
    : `${process.env.AUTH_API_URL}/auth/oauth/login`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${process.env.AUTH_API_KEY}`,
      ...(isLoggedIn && { "Authorization": `Bearer ${session.user.accessToken}` })
    },
    body: JSON.stringify({ provider: provider, code: code })
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  // Expected successful response: { success: true, accessToken, refreshToken, email, id }
  // We transform it in utils/auth.ts, no need here, just return as is.
  // Add fields the frontend expects (name, avatar, premium_subscription):
  const userData = {
    id: data.id,
    email: data.email,
    name: data.email.split("@")[0] || "User",
    avatar: null,
    premium_subscription: false,
    accessToken: data.accessToken ?? data.token, // backend might return token or accessToken, handle both
    refreshToken: data.refreshToken
  };

  return NextResponse.json(userData, { status: 200 });
}
