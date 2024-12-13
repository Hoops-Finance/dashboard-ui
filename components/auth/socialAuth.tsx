"use client";

// library imports
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function SocialAuth() {
  const searchParams = useSearchParams();
  const currentUrl = usePathname();
  const segments = currentUrl.split("/");
  const provider = segments.pop() || segments.pop();

  let socialLogin = process.env.GOOGLE_OAUTH_FLOW_URL || "";

  switch (provider) {
    case "google":
      socialLogin = process.env.GOOGLE_OAUTH_FLOW_URL || "";
      break;
    case "discord":
      socialLogin = process.env.DISCORD_OAUTH_FLOW_URL || "";
      break;
  }

  const router = useRouter();

  const [authSuccess, setAuthSuccess] = useState(true);
  const [tokenStatus, setTokenStatus] = useState(false);

  useEffect(() => {
    // check query string for authentication code
    if (authSuccess || tokenStatus) {
      const code = searchParams.get("code");
      if (!tokenStatus && authSuccess) {
        if (code) {
          const decodeCode = decodeURIComponent(code);
          authenticateUser(decodeCode);
        } else {
          router.push("/auth/login");
        }
      } else if (tokenStatus) {
        // Redirect to previous page or home page
        const next = searchParams.get("next") || "/";
        router.push(next);
      } else {
        router.push("/auth/login");
      }
    }
  }, [tokenStatus, authSuccess, router, searchParams]);

  const authenticateUser = async (code: string) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: code, type: "social" })
      });

      if (res.ok) {
        setTokenStatus(true);
        window.location.href = "/profile";
      } else {
        // handle error state here
        setAuthSuccess(false);
      }
    } catch (error) {
      setAuthSuccess(false);
    }
  };

  return (
    <>
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            {authSuccess ? (
              <div>
                <h1>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      stroke-width="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </h1>
              </div>
            ) : (
              <div>
                <h1> An error occurred while attempting to authenticate your account with Google or Discord </h1>
                <div>
                  <div>
                    <Link href={socialLogin}>Please try again</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
