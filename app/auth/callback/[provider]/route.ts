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
    return NextResponse.redirect(new URL("/signup?error=MissingCodeOrState", "https://app.hoops.finance"));
  }

  const cookieStore = await cookies();
  console.log(cookieStore);
  const testcook = cookieStore.getAll();
  console.log("Testcook");
  console.log(testcook);
  const rawCookie = cookieStore.get("__Host-authjs.csrf-token");
  console.log("THE RAW COOKIE");
  console.log(rawCookie);
  rawCookie?.value && console.log(`[OAUTH-CALLBACK] Raw CSRF Cookie: ${rawCookie.value}`);
  console.log(`[OAUTH-CALLBACK] CSRF Cookie: ${rawCookie}`);

  if (!rawCookie) {
    return NextResponse.redirect(new URL("/signup?error=MissingCsrfCookie", "https://app.hoops.finance"));
  }
//https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?client_id=1097562416208-5t4tg72fg11h5earre857qtvo4ch0tlc.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fapp.hoops.finance%2Fauth%2Fcallback%2Fgoogle&response_type=code&scope=email%20profile&prompt=consent&state=43dc5611575f2b668b68ecdb90065198e7f26cd78203043a829b512a390dd883&service=lso&o2v=2&ddm=1&flowName=GeneralOAuthFlow


  const decodedCookie = decodeURIComponent(rawCookie.value);
  console.log(`[OAUTH-CALLBACK] Decoded CSRF Cookie: ${decodedCookie}`);

  const [csrfCookieValue] = decodedCookie.split("|");
  console.log(`[OAUTH-CALLBACK] CSRF Cookie Value: ${csrfCookieValue}`);
  const cookieToken = decodeURIComponent(csrfCookieValue);

  console.log(`[OAUTH-CALLBACK] Cookie Token: ${cookieToken}`);
  console.log(`[OAUTH-CALLBACK] Returned State: ${returnedState}`);
  if (!cookieToken || cookieToken !== returnedState) {
    return NextResponse.redirect(new URL("/signup?error=InvalidState", "https://app.hoops.finance"));
  }

  console.log(`[OAUTH-CALLBACK] TRYING TO LOGIN`);

  let redirectUrl;
  try {
    redirectUrl = await signIn("social", {
      redirect: false,
      provider,
      code,
      state: returnedState
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.redirect(new URL(`/signup?error=${encodeURIComponent(err.message)}`, "https://app.hoops.finance"));
    }
  }

  console.log("[OAUTH-CALLBACK] signIn('social') returned URL:", redirectUrl);
  if (!redirectUrl) {
    throw new Error("Failed to retrieve redirect URL from signIn");
  }
//  console.log("calling session in the authcallback");
//  const session = await auth();
//  console.log("called session in the auth callback");
//  console.log(session);
//  const isLoggedIn = !!session?.user.accessToken;
//  console.log(`[OAUTH-CALLBACK] User is logged in: ${isLoggedIn}`);
//  if (!isLoggedIn) {
//    return NextResponse.redirect(new URL(`/signup?error=UnknownFailure`, "https://app.hoops.finance"));
//  }
  return NextResponse.redirect(new URL("/profile", "https://app.hoops.finance"));
}
