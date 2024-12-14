// library imports
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// types imports
import type { NextAuthConfig, Session, User } from "next-auth";
import type { UserType, UserResponseType } from "../types/user";
import { AdapterUser } from "next-auth/adapters";
import { CredentialsType, SocialCredentialsType } from "../types/login";
import { JWT } from "next-auth/jwt";

// Modify NextAuth types with custom properties
declare module "next-auth" {
  interface User extends UserType {}
}

declare module "next-auth/adapters" {
  interface AdapterUser extends UserType {}
}

declare module "next-auth/jwt" {
  interface JWT extends UserType {}
}

const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      authorize: async (credentials) => {
        try {
          const user = await fetchUser(
            `${process.env.AUTH_API_URL}/auth/signin`,
            {
              email:
                typeof credentials.username === "string"
                  ? credentials.username
                  : "",
              password:
                typeof credentials.password === "string"
                  ? credentials.password
                  : "",
            }
          );

          return user ? createUser(user) : null;
        } catch (error) {
          console.error("Error during authentication", error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "social",
      name: "Custom Social Login",
      authorize: async (credentials) => {
        try {
          const callbackUrl = (credentials.callbackUrl || "").toString();
          const segments = new URL(callbackUrl).pathname.split('/');
          const provider = segments.pop() || segments.pop();

          const oauth_link_request = await fetch(`${process.env.AUTH_API_URL}/auth/oauth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": `${process.env.AUTH_API_KEY}`,
            },
            body: JSON.stringify({ provider: provider, code: credentials.authCode })
          });

          const user = await oauth_link_request.json();

          if (oauth_link_request.ok && user) {
            return user ? createUser(user) : null;
          }
          return null
        } catch (error) {
          console.error("Error during authentication", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User }) {
      // Add the user properties to the token after signing in
      if (user) {
        token.id = user.id as string;
        token.avatar = user.avatar;
        token.name = user.name;
        token.email = user.email;
        token.premiumSubscription = user.premiumSubscription;
        token.accessToken = user.accessToken;
        token.subId = user.subId;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Create a user object with token properties
      const userObject: AdapterUser = {
        id: token.id,
        avatar: token.avatar,
        name: token.name,
        premiumSubscription: token.premiumSubscription,
        accessToken: token.accessToken,
        subId: token.subId,
        refreshToken: token.refreshToken,
        email: token.email ? token.email : "", // Ensure email is not undefined
        emailVerified: null, // Required property, set to null if not used
      };

      // Add the user object to the session
      session.user = userObject;

      return session;
    },
  },
  pages: {
    signIn: "/auth/login", // Custom sign-in page
    // error: "/auth/error", // Custom error page
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;

// Function to authenticate and fetch user details
async function fetchUser(
  url: string,
  body: CredentialsType | SocialCredentialsType
) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${process.env.AUTH_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const user = await res.json();

    if (res.ok && user) {
      return user;
    } else {
      console.error(`Failed to fetch user: ${res.status} ${res.statusText}`);
      return null;
    }
  } catch (error) {
    console.error(`Error during fetch: ${error}`);
    return null;
  }
}

// Function to create a user object
function createUser(user: UserResponseType) {
  const userObject: UserType = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    premiumSubscription: user.premium_subscription,
    accessToken: user.accessToken,
    refreshToken: user.refreshToken, // add refresh token here
    subId: "", //add subId from the auth service here
  };

  return userObject;
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);