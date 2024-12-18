"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { signIn } from "@/utils/auth";
import Link from "next/link";

export default function SocialAuth() {
  const searchParams = useSearchParams();
  const currentUrl = usePathname();
  const router = useRouter();

  const segments = currentUrl.split("/");
  const provider = segments.pop() || segments.pop(); // "google" or "discord"
  const code = searchParams.get("code");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!code || !provider) {
      setError("Missing code or provider");
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await signIn("social", { redirect: false, provider, code });
        if (!res) {
          setError("Social login failed with unknown error.");
        } else if (res.ok) {
          router.push("/profile");
          return; // Stop further execution after successful redirect
        } else {
          setError(res.error || "Social login failed");
        }
      } catch (e) {
        setError("An error occurred during authentication.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [code, provider, router]);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="grid gap-6">
        {isLoading ? (
          <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
            <h1 className="text-lg font-semibold">Authenticating...</h1>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : error ? (
          <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
            <h1 className="text-lg font-semibold">An error occurred while authenticating</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="mt-4">
              <Link
                href={`/api/auth/oauth/start?provider=${provider}`}
                className="text-primary hover:underline"
              >
                Retry Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
            <h1 className="text-lg font-semibold">Successfully authenticated!</h1>
          </div>
        )}
      </div>
    </div>
  );
}
