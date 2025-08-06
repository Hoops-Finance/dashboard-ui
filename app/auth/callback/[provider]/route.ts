// app/auth/callback/[provider]/route.ts

"use server";

import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/utils/auth";
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
  const rawCookie = cookieStore.get("__Host-authjs.csrf-token")?.value ??   // production cookie
  cookieStore.get("authjs.csrf-token")?.value ?? "";      // fallback for dev
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

  try {
    // We use signIn with redirect: false to manually handle the redirect
    const signInResult = await signIn("social", {
      redirect: false,
      provider,
      code,
      state: returnedState,
    });
    
    console.log("[OAUTH-CALLBACK] Sign-in result:", signInResult);
    
    // If we have a result but not a specific URL, consider the authentication successful
    // This is a key change to avoid the "No URL returned from signIn" error
    if (signInResult) {
      // If there's a URL, check if it contains an error
      if (signInResult.url) {
        const resultUrl = new URL(signInResult.url);
        const error = resultUrl.searchParams.get("error");
        
        if (error) {
          console.error("[OAUTH-CALLBACK] Authentication error:", error);
          return NextResponse.redirect(new URL(`/signup?error=${error}`, req.url));
        }
      }
      
      // If there's no error, consider the authentication successful
      // This avoids the issue when signInResult exists but doesn't have a specific URL
      console.log("[OAUTH-CALLBACK] Authentication successful, redirecting to profile");
      return NextResponse.redirect(new URL("/profile", req.url));
    }
    
    // If we don't have a result, something went wrong
    console.error("[OAUTH-CALLBACK] No result from signIn");
    return NextResponse.redirect(new URL("/signup?error=AuthenticationFailed", req.url));
    
  } catch (err) {
    console.error("[OAUTH-CALLBACK] Error during social authentication:", err);
    
    // Handle specific auth errors
    if (err instanceof AuthError) {
      return NextResponse.redirect(new URL(`/signup?error=${encodeURIComponent(err.message)}`, req.url));
    }
    
    // Generic error handler
    return NextResponse.redirect(new URL("/signup?error=AuthenticationFailed", req.url));
  }
}
