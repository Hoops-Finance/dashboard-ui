"use client";

import AuthForm from "@/components/auth/AuthForm";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react'

export default function LoginPage() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error') || "";
  const oauthEmail = searchParams.get('oauthEmail') || "";
  const oauthProvider = searchParams.get('provider') || "";
  const oauthCode = searchParams.get('code') || "";

  return (
    <Suspense>

    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      <AuthForm
        isLogin={true}
        errorParam={errorParam}
        oauthEmail={oauthEmail || undefined}
        oauthProvider={oauthProvider || undefined}
        oauthCode={oauthCode || undefined}
        recaptchaSiteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
      />
    </div>
    </Suspense>

  );
}
