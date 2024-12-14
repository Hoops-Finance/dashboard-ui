/* This component reads the provider and code from the URL, then calls signIn("social"). The utils/auth.ts will use the /api/auth/oauth/exchange route to finalize login or link. */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { signIn } from "@/utils/auth";

export default function SocialAuth() {
  const searchParams = useSearchParams();
  const currentUrl = usePathname();
  const router = useRouter();

  const segments = currentUrl.split("/");
  const provider = segments.pop() || segments.pop(); // "google" or "discord"
  const code = searchParams.get("code");

  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!code || !provider) {
      setError("Missing code or provider");
      return;
    }

    (async () => {
      const res = await signIn("social", { redirect: false, provider, code });
      if (!res) {
        setError("Social login failed with unknown error.");
        return;
      }
      if (res.ok) {
        router.push("/profile");
      } else {
        // If NO_ACCOUNT scenario, NextAuth will redirect to signup with error param automatically
        // If other error, display it
        setError(res.error || "Social login failed");
      }
    })();
  }, [code, provider, router]);

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
            <h1 className="text-lg font-semibold">An error occurred while authenticating</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="grid gap-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
          <h1 className="text-lg font-semibold">Authenticating...</h1>
        </div>
      </div>
    </div>
  );
}
