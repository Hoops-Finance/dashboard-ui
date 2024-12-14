
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { useSession as originalUseSession } from "next-auth/react";

import type { NextAuthConfig, Session } from "next-auth";
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
  }
}

const authOptions: NextAuthConfig = {
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
            console.error("Unknown error during credentials authentication");
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
      },
      authorize: async (credentials) => {
        const provider = typeof credentials?.provider === 'string' ? credentials.provider : "";
        const code = typeof credentials?.code === 'string' ? credentials.code : "";

        if (!provider || !code) {
          console.error("Missing provider or code for social login");
          return null;
        }

        try {
          const userResponse = await fetchSocialUser("/api/auth/oauth/exchange", provider, code);
          return userResponse ? createUser(userResponse) : null;
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Error during social authentication:", error.message);
          } else {
            console.error("Unknown error during social authentication");
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
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
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        avatar: token.avatar,
        premiumSubscription: token.premiumSubscription,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        subId: token.subId,
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
    sub_id: ""
  };
}

async function fetchSocialUser(localUrl: string, provider: string, code: string): Promise<UserResponseType | null> {
  const res = await fetch(localUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: provider, code: code }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (data && data.message === "No account for this OAuth email" && data.email) {
      throw new Error(`NO_ACCOUNT|email=${data.email}&provider=${provider}&code=${code}`);
    }
    console.error("OAuth login/link failed:", data);
    return null;
  }

  const data = await res.json() as {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    premium_subscription: boolean;
    accessToken: string;
    refreshToken: string;
  };

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    avatar: data.avatar || "",
    premium_subscription: data.premium_subscription,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    sub_id: ""
  };
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
