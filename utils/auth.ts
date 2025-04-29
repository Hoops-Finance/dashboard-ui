import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { useSession as originalUseSession } from "next-auth/react";
import { decode as authJsDecode } from "next-auth/jwt";

import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { UserType, UserResponseType } from "@/types/user";
import { AuthResult } from "./types";

declare module "next-auth" {
  interface User extends UserType {
    id?: string;
    name?: string | null;
    email?: string | null;
    emailVerified?: Date | null;
    avatar: string | null;
    premiumSubscription: boolean;
    accessToken: string;
    refreshToken: string;
    subId: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
      premiumSubscription: boolean;
      accessToken: string;
      refreshToken: string;
      subId: string;
      emailVerified?: Date | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    premiumSubscription: boolean;
    accessToken: string;
    refreshToken: string;
    subId: string;
    exp?: number;
    error?: string;
  }
}

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const email = typeof credentials.username === "string" ? credentials.username : "";
          const password = typeof credentials.password === "string" ? credentials.password : "";

          if (!email || !password) return null;

          const userResponse = await fetchCredentialsUser(
            `${process.env.AUTH_API_URL}/auth/signin`,
            email,
            password,
          );
          return userResponse ? createUser(userResponse) : null;
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Error during credentials authentication:", error.message);
          } else {
            console.error("Unknown error during credentials authentication", error);
          }
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "social",
      name: "Social OAuth",
      credentials: {
        provider: { label: "Provider", type: "text" },
        code: { label: "Code", type: "text" },
        state: { label: "State", type: "text" },
        // baseurl: { label: "Base URL", type: "text" },
      },
      authorize: async (credentials) => {
        const provider = typeof credentials.provider === "string" ? credentials.provider : "";
        const code = typeof credentials.code === "string" ? credentials.code : "";
        const state = typeof credentials.state === "string" ? credentials.state : "";
        console.log("[NextAuth:Social] Received provider/code/state:", provider, code, state);

        if (!provider || !code) {
          console.error("Missing provider or code for social login");
          return null;
        }
        try {
          const response = await fetchSocialUser(provider, code, state);
          console.log("[NextAuth:Social] fetchSocialUser result:", response);

          if (!response.success || !response.user) {
            console.error("[NextAuth:Social] Social authentication failed:", response.error);
            return null; // Return null or handle error appropriately (e.g., throw or redirect)
          }

          // Create and return user
          return createUser(response.user);
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("[NextAuth:Social] Error during social authentication:", error.message);
          } else {
            console.error("[NextAuth:Social] Unknown error during social authentication:", error);
          }
          return null; // Return null or handle error appropriately
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Only try to set token properties if user exists (during sign in)
      if (user) {
        token.id = user.id ?? "";
        token.avatar = user.avatar;
        token.name = user.name ?? "";
        token.email = user.email ?? "";
        token.premiumSubscription = user.premiumSubscription;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.subId = user.subId;
      }
      return validateAuthorization(token);
    },

    async session({ session, token }) {
      const validAccess = await validateAuthorization(token);
      session.user = {
        id: validAccess.id,
        avatar: validAccess.avatar,
        name: validAccess.name,
        email: validAccess.email,
        premiumSubscription: validAccess.premiumSubscription,
        accessToken: validAccess.accessToken,
        refreshToken: validAccess.refreshToken,
        subId: validAccess.subId,
        emailVerified: null,
      };

      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/signup",
  },
  session: {
    strategy: "jwt",
  },
};

export async function validateAuthorization(token: JWT): Promise<JWT> {
  const validAccess = await verifyAccessToken(token);
  if (!validAccess) {
    console.log("access token invalid", token);
    const refreshedToken = await refreshAccessToken(token);
    if (!refreshedToken.error) {
      token.accessToken = refreshedToken.accessToken;
      token.refreshToken = refreshedToken.refreshToken;
    } else {
      // ADDED: Log more detail about the refresh error
      console.error(
        "[validateAuthorization] Failed to refresh access token. Server responded with error:",
        refreshedToken.error,
      );
    }
  }
  return token;
}

export async function verifyAccessToken(token: JWT): Promise<boolean> {
  console.log("trying claims");
  const decodeToken = async (jwe: string) => {
    try {
      if (!process.env.JWT_SECRET || !process.env.SALT_SECRET) {
        throw new Error("Missing JWT_SECRET / SALT_SECRET in environment");
      }
      return await authJsDecode({
        token: jwe,
        secret: process.env.JWT_SECRET,
        salt: process.env.SALT_SECRET,
      });
    } catch (error) {
      // ADDED: Additional context for decode errors
      console.error("[verifyAccessToken] Error decoding token =>", error);
      return false;
    }
  };
  const at = await decodeToken(token.accessToken);
  const rt = await decodeToken(token.refreshToken);
  const currentTime = Math.floor(Date.now() / 1000);
  /*
  jwt claims {
    sub: '677ef99b3ad02e8c8731779b',
    iat: 1736388976, // issued at
    exp: 1736399776, // expiration
    jti: '054b5842-69f8-49ec-8f1d-0fc847ba2c20'
    }
  */
  if (!at || !rt) return false;
  if (!at.exp || !rt.exp) return false;
  if (token.exp && token.exp < currentTime) return false;
  if (at.exp < currentTime || rt.exp < currentTime) return false;

  return true;
}

interface tokenValidationResponse {
  success: boolean;
  error?: string;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  let res: Response;
  try {
    res = await fetch(`${process.env.AUTH_API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${process.env.AUTH_API_KEY}`,
      },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });
  } catch (err) {
    // ADDED: More logging if the fetch itself fails (e.g. ECONNREFUSED)
    console.error("[refreshAccessToken] fetch failed =>", err);
    return { ...token, error: "FetchError" };
  }

  if (!res.ok) {
    // ADDED: Log the status and text for better debugging
    const text = await res.text().catch(() => "Unknown body");
    console.error("[refreshAccessToken] refresh call failed with status:", res.status, text);
    return { ...token, error: "RefreshAccessTokenError" };
  }

  const data = (await res.json().catch(() => ({}))) as AuthResult;
  console.log("[refreshAccessToken] refresh endpoint responded:", data);

  if (!data.success || !data.refreshToken) {
    console.error("[refreshAccessToken] Missing success or refreshToken in response:", data);
    return { ...token, error: "RefreshAccessTokenError" };
  }

  return {
    ...token,
    accessToken: data.accessToken ?? token.accessToken,
    refreshToken: data.refreshToken,
  };
}

async function fetchCredentialsUser(
  url: string,
  email: string,
  password: string,
): Promise<UserResponseType | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${process.env.AUTH_API_KEY}`,
      },
      body: JSON.stringify({ email: email, password: password }),
    });

    // Get the response data
    const data = await res.json() as AuthResult;
    
    if (!res.ok) {
      // Extract error message from response if available
      const errorMessage = data.error || `Authentication failed with status: ${res.status}`;
      console.error("Authentication error:", errorMessage);
      // Throw error with message to be handled by NextAuth
      throw new Error(errorMessage);
    }
    
    console.log("fetchCredentialsUser");
    console.log("fetchCredentialsUser", data);
    
    if (!data.success || !data.accessToken || !data.refreshToken || !data.email || !data.id) {
      throw new Error("Invalid response format from authentication server");
    }
    
    // todo: unifiy the types better.
    return {
      id: data.id,
      name: data.email.split("@")[0],
      email: data.email,
      avatar: "",
      premium_subscription: false,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      sub_id: "",
    };
  } catch (error) {
    console.error("Error in fetchCredentialsUser:", error);
    throw error; // Re-throw to be handled by NextAuth
  }
}

interface SocialUserResponse {
  success: boolean;
  user?: UserResponseType;
  error?: string;
}

async function fetchSocialUser(
  provider: string,
  code: string,
  state: string,
): Promise<SocialUserResponse> {
  console.log("[fetchSocialUser] Starting exchange logic...");

  // For OAuth login flow, we should always use the login endpoint
  // We don't need to check for an existing session as this is a fresh login attempt
  const url = `${process.env.AUTH_API_URL}/auth/oauth/login`;

  console.log(
    `[fetchSocialUser] Calling express backend at ${url} with provider/code/state:`,
    provider,
    code,
    state,
  );

  // Prepare headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": `${process.env.AUTH_API_KEY}`,
  };

  // Make the request
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ provider, code, state }),
    });

    const data = (await res.json()) as AuthResult;
    console.log("[fetchSocialUser] Express backend responded with:", data);

    if (!res.ok) {
      console.error("[fetchSocialUser] Backend responded with error:", data);
      return {
        success: false,
        error: data.error ?? `Error communicating with backend. Status: ${res.status}`,
      };
    }

    // Validate the response structure
    if (!data.id || !data.email) {
      console.error("[fetchSocialUser] Missing user data in backend response:", data);
      return {
        success: false,
        error: data.error ?? "Backend response missing required user data",
      };
    }

    if (!data.accessToken || !data.refreshToken) {
      console.error("[fetchSocialUser] Missing tokens in backend response:", data);
      return {
        success: false,
        error: data.error ?? "Backend response missing required tokens",
      };
    }

    // Construct the user object
    const userData: UserResponseType = {
      id: data.id,
      email: data.email,
      name: data.email.split("@")[0],
      avatar: "", // needs implemented
      premium_subscription: false,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      sub_id: "",
    };

    console.log("[fetchSocialUser] Completed user data:", userData);
    return {
      success: true,
      user: userData,
    };
  } catch (error: unknown) {
    let message;
    if (error instanceof Error) {
      message = error.message;
    } else {
      message = String(error);
    }
    console.error("[fetchSocialUser] Error during fetch:", message);
    return {
      success: false,
      error: message,
    };
  }
}

function createUser(user: UserResponseType): UserType {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    premiumSubscription: user.premium_subscription,
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
    subId: user.sub_id || "",
    emailVerified: null,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
export const useSession = originalUseSession;
