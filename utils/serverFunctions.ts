"use server";

import { UserProfile } from "@/utils/types"; // Or wherever your `UserProfile` interface is exported
/**
 * getServerProfile:
 * Calls `GET /auth/user_profile` on the unified backend, returning the sanitized user profile.
 * 
 * @param accessToken The user's `session.user.accessToken` from NextAuth
 * @returns A `UserProfile` object or null on error.
 */
export async function getServerProfile(accessToken: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${process.env.AUTH_API_URL}/auth/user_profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-api-key": `${process.env.AUTH_API_KEY}`,
      },
      // No body needed for GET
    });

    if (!res.ok) {
      console.error("[getServerProfile] /auth/user_profile call failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    // Expecting shape: { _id, email, createdAt, updatedAt, emails[], linkedAccounts[] }
    return data;
  } catch (err) {
    console.error("[getServerProfile] Error fetching user profile:", err);
    return null;
  }
}

export async function signInServer(credentials: { email: string; password: string }) {
    const { signIn } = await import("@/utils/auth");
    const result = await signIn("credentials", {
      redirect: false,
      username: credentials.email,
      password: credentials.password
    });
    console.log('sign in result from server', result);
    return result;
  }
  