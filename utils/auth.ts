import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { useSession as originalUseSession } from "next-auth/react";
import { decode as authJsDecode } from "next-auth/jwt"

import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { UserType, UserResponseType } from "@/types/user";

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
          const email = typeof credentials?.username === 'string' ? credentials.username : "";
          const password = typeof credentials?.password === 'string' ? credentials.password : "";

          if (!email || !password) return null;

          const userResponse = await fetchCredentialsUser(`${process.env.AUTH_API_URL}/auth/signin`, email, password);
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
        const provider = typeof credentials?.provider === 'string' ? credentials.provider : "";
        const code = typeof credentials?.code === 'string' ? credentials.code : "";
        const state = typeof credentials?.state === 'string' ? credentials.state : "";
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
      // On initial login, store the tokens from `authorize()`.
      if (user) {
        token.id = user.id as string;
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
        console.log('access token invalid');
        const refreshedToken = await refreshAccessToken(token);
        if (!refreshedToken.error) {
          token.accessToken = refreshedToken.accessToken;
          token.refreshToken = refreshedToken.refreshToken;
        }
      }
      return token;
}
export async function verifyAccessToken(token: JWT): Promise<boolean>{
  console.log('trying claims');
  const accessTokenClaim = async (token:string) => {
    try {
      return await authJsDecode({
        token: token,
        secret: process.env.JWT_SECRET!,
        salt: process.env.SALT_SECRET!,
      });
    } catch (error) {
      console.error('Error decoding token', error);
      return false;
    }
  };
  const at = await accessTokenClaim(token.accessToken);
  const rt = await accessTokenClaim(token.refreshToken);
  console.log('jwt claims', accessTokenClaim);
  /*
  jwt claims {
    sub: '677ef99b3ad02e8c8731779b',
    iat: 1736388976, // issued at
    exp: 1736399776, // expiration
    jti: '054b5842-69f8-49ec-8f1d-0fc847ba2c20'
    }
  */
  const currentTime = Math.floor(Date.now() / 1000);
  if (!at || !rt) {
    return false;
  } else if (!at.exp || !rt.exp) {
    return false;
  } else if (token.exp && token.exp < currentTime) {
    return false;
  } else if (at.exp < currentTime || rt.exp < currentTime) {
    return false;
  } else {
    return true
  }
}

interface tokenValidationResponse {
  success: boolean;
  error?: string;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const res = await fetch(`${process.env.AUTH_API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': `${process.env.AUTH_API_KEY}`,
    },
    body: JSON.stringify({ refreshToken: token.refreshToken }),
  });

  if (!res.ok) {
    return { ...token, error: "RefreshAccessTokenError" };
  }

  const data = await res.json();
  if (!data.success || !data.token || !data.refreshToken) {
    return { ...token, error: "RefreshAccessTokenError" };
  }

  return {
    ...token,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken
  };
}

async function fetchCredentialsUser(url: string, email: string, password: string): Promise<UserResponseType | null> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${process.env.AUTH_API_KEY}`,
    },
    body: JSON.stringify({ email: email, password: password }),
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json() as {
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    email?: string;
    id?: string;
  };

  if (!data.success || !data.accessToken || !data.refreshToken || !data.email || !data.id) {
    return null;
  }

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
}

interface SocialUserResponse {
  success: boolean;
  user?: UserResponseType;
  error?: string;
}

async function fetchSocialUser(
  provider: string,
  code: string,
  state: string
): Promise<SocialUserResponse> {
  console.log("[fetchSocialUser] Starting exchange logic...");

  // 1) Check if the user is logged in
  const session = await auth();
  const isLoggedIn = !!session?.user?.accessToken;
  console.log("[fetchSocialUser] isLoggedIn?", isLoggedIn);

  // 2) Determine the URL based on login or linking
  const url = isLoggedIn
    ? `${process.env.AUTH_API_URL}/auth/oauth/link`
    : `${process.env.AUTH_API_URL}/auth/oauth/login`;

  console.log(`[fetchSocialUser] Calling express backend at ${url} with provider/code/state:`, provider, code, state);

  // 3) Prepare headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": `${process.env.AUTH_API_KEY}`,
  };

  if (isLoggedIn && session?.user?.accessToken) {
    headers["Authorization"] = `Bearer ${session.user.accessToken}`;
  }

  // 4) Make the request
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ provider, code, state }),
    });

    const data = await res.json();
    console.log("[fetchSocialUser] Express backend responded with:", data);

    if (!res.ok) {
      console.error("[fetchSocialUser] Backend responded with error:", data);
      return {
        success: false,
        error: data.error || "Error communicating with backend.",
      };
    }

    // 5) Validate the response structure
    if (!data.id || !data.email) {
      console.error("[fetchSocialUser] Missing user data in backend response:", data);
      return {
        success: false,
        error: data.error || "Backend response missing required user data",
      };
    }

    // 6) Construct the user object
    const userData: UserResponseType = {
      id: data.id,
      email: data.email,
      name: data.name || data.email.split("@")[0],
      avatar: data.avatar || "",
      premium_subscription: false,
      accessToken: data.accessToken ?? data.token,
      refreshToken: data.refreshToken,
      sub_id: "",
    };

    console.log("[fetchSocialUser] Completed user data:", userData);
    return {
      success: true,
      user: userData,
    };
  } catch (error) {
    console.error("[fetchSocialUser] Error during fetch:", error);
    return {
      success: false,
      error: (error as Error).message || "An unexpected error occurred",
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
