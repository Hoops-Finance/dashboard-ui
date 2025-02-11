// app/auth/callback/[provider]/route.ts

"use server";

import { NextRequest, NextResponse } from "next/server";
import { auth, signIn } from "@/utils/auth";
import { cookies } from "next/headers";
import { AuthError } from "next-auth";

/**
 * Handles the OAuth callback for a given provider.
 *
 * This function processes the OAuth callback request, validates the state and CSRF token,
 * and attempts to sign in the user using the provided authorization code.
 *
 * @param req - The incoming request object.
 * @param context - The context object containing route parameters.
 * @returns A redirect response to the appropriate URL based on the outcome of the authentication process.
 *
 * @throws Will throw an error if the redirect URL from `signIn` is not retrieved.
 */
export async function GET(req: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");

  console.log(`[OAUTH-CALLBACK] Provider: ${provider}, Code: ${code}, State: ${returnedState}`);

  if (!provider || !code || !returnedState) {
    return NextResponse.redirect(new URL("/signup?error=MissingCodeOrState", req.url));
  }

  const cookieStore = await cookies();
  const rawCookie = cookieStore.get("authjs.csrf-token")?.value ?? "";
  console.log(`[OAUTH-CALLBACK] CSRF Cookie: ${rawCookie}`);

  if (!rawCookie) {
    return NextResponse.redirect(new URL("/signup?error=MissingCsrfCookie", req.url));
  }

  const decodedCookie = decodeURIComponent(rawCookie);
  console.log(`[OAUTH-CALLBACK] Decoded CSRF Cookie: ${decodedCookie}`);

  const [csrfCookieValue] = decodedCookie.split("|");
  console.log(`[OAUTH-CALLBACK] CSRF Cookie Value: ${csrfCookieValue}`);
  const cookieToken = decodeURIComponent(csrfCookieValue);

  console.log(`[OAUTH-CALLBACK] Cookie Token: ${cookieToken}`);
  console.log(`[OAUTH-CALLBACK] Returned State: ${returnedState}`);
  if (!cookieToken || cookieToken !== returnedState) {
    return NextResponse.redirect(new URL("/signup?error=InvalidState", req.url));
  }

  console.log(`[OAUTH-CALLBACK] TRYING TO LOGIN`);

  let redirectUrl;
  try {
    //  @typescript-eslint/no-unsafe-assignment - This is safe, as signIn will return a string
    redirectUrl = (await signIn("social", {
      redirect: false,
      provider,
      code,
      state: returnedState,
    })) as string;
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.redirect(new URL(`/signup?error=${encodeURIComponent(err.message)}`, req.url));
    }
  }

  console.log("[OAUTH-CALLBACK] signIn('social') returned URL:", redirectUrl);
  if (!redirectUrl) {
    throw new Error("Failed to retrieve redirect URL from signIn");
  }
  console.log("calling session in the authcallback");
  const session = await auth();
  console.log("called session in the auth callback");
  const isLoggedIn = !!session?.user.accessToken;
  console.log(`[OAUTH-CALLBACK] User is logged in: ${isLoggedIn}`);
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL(`/signup?error=UnknownFailure`, req.url));
  }
  return NextResponse.redirect(new URL("/profile", req.url));
}
