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
  
  // Use NEXTAUTH_URL if available, otherwise construct from headers
  const baseUrl = process.env.NEXTAUTH_URL || 
    (() => {
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || process.env.NEXT_PUBLIC_BASE_URL;
      const protocol = req.headers.get("x-forwarded-proto") || "https";
      return `${protocol}://${host}`;
    })();

  console.log(`[OAUTH-CALLBACK] Provider: ${provider}, Code: ${code}, State: ${returnedState}, BaseURL: ${baseUrl}`);

  if (!provider || !code || !returnedState) {

    return NextResponse.redirect(new URL("/signup?error=MissingCodeOrState", baseUrl));
  }

  const cookieStore = await cookies();
  const rawCookie = cookieStore.get("__Host-authjs.csrf-token")?.value ??   // production cookie
  cookieStore.get("authjs.csrf-token")?.value ?? "";      // fallback for dev
  console.log(`[OAUTH-CALLBACK] RAW COOKIESTORE: ${JSON.stringify(cookieStore.getAll())}`);

  console.log(`[OAUTH-CALLBACK] CSRF Cookie: ${rawCookie}`);
// decode the csrf token
  if (!rawCookie) {
    return NextResponse.redirect(new URL("/signup?error=MissingCsrfCookie", baseUrl));
  }

  const decodedCookie = decodeURIComponent(rawCookie);
  console.log(`[OAUTH-CALLBACK] Decoded CSRF Cookie: ${decodedCookie}`);

  const [cookieToken] = decodedCookie.split("|");
  console.log(`[OAUTH-CALLBACK] Cookie Token: ${cookieToken}`);
  console.log(`[OAUTH-CALLBACK] Returned State: ${returnedState}`);
  console.log(`[OAUTH-CALLBACK] Token lengths - Cookie: ${cookieToken?.length}, State: ${returnedState?.length}`);
  console.log(`[OAUTH-CALLBACK] Tokens match: ${cookieToken === returnedState}`);
  
  if (!cookieToken || cookieToken !== returnedState) {
    console.log(`[OAUTH-CALLBACK] CSRF token mismatch - Cookie: '${cookieToken}', State: '${returnedState}'`);
    return NextResponse.redirect(new URL("/signup?error=InvalidState", baseUrl));
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
          return NextResponse.redirect(new URL(`/signup?error=${error}`, baseUrl));
        }
      }
      
      // If there's no error, consider the authentication successful
      // This avoids the issue when signInResult exists but doesn't have a specific URL
      console.log("[OAUTH-CALLBACK] Authentication successful, redirecting to profile");
      return NextResponse.redirect(new URL("/profile", baseUrl));
    }
    
    // If we don't have a result, something went wrong
    console.error("[OAUTH-CALLBACK] No result from signIn");
    return NextResponse.redirect(new URL("/signup?error=AuthenticationFailed", baseUrl));
    
  } catch (err) {
    console.error("[OAUTH-CALLBACK] Error during social authentication:", err);
    
    // Handle specific auth errors
    if (err instanceof AuthError) {
      return NextResponse.redirect(new URL(`/signup?error=${encodeURIComponent(err.message)}`, baseUrl));
    }
    
    // Generic error handler
    return NextResponse.redirect(new URL("/signup?error=AuthenticationFailed", baseUrl));
  }
}
