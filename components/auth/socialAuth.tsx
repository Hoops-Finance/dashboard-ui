"use client";

// library imports
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function SocialAuth() {
  const socialLogin = process.env.DISCORD_OAUTH_FLOW_URL || "";

  const router = useRouter();
  const searchParams = useSearchParams();

  const [authSuccess, setAuthSuccess] = useState(true);
  const [tokenStatus, setTokenStatus] = useState(false);

  useEffect(() => {
    // check query string for authentication code
    if (authSuccess || tokenStatus) {
      const url = window.location.href;
      const code = url.match(/\?code=(.*)/);
      if (!tokenStatus && authSuccess) {
        if (code) {
          authenticateUser(code[1]);
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
  }, [tokenStatus, authSuccess]);

  const authenticateUser = async (code: string) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: code, type: "social" }),
      });

      if (res.ok) {
        setTokenStatus(true);
        window.location.href = '/profile';
      } else {
        // handle error state here
        setAuthSuccess(false);
      }
    } catch (error) {
      // handle error state here
      setAuthSuccess(false);
    }
  };

  return (
    <>
      <div>
        {authSuccess ? (
          <div>
            <h1>Authenticating...</h1>
          </div>
        ) : (
          <div>
            <h1>
              {" "}
              An error occurred while attempting to authenticate your account
              with Google or Discord{" "}
            </h1>

            <div>
              <div>
                <Link href={socialLogin}>Please try again</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
