"use client";

import { useState, useCallback } from "react";
import AuthForm from "@/components/auth/AuthForm";
import GetAuthParams from "@/components/auth/GetAuthParams";

/**
 * /app/(shared)/auth/page.tsx
 * This is our single "shared" auth page that can handle both login and signup
 * depending on what GetAuthParams returns. We store the result in local state,
 * then pass it to <AuthForm>.
 */
export default function SharedAuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [errorParam, setErrorParam] = useState("");
  const [oauthEmail, setOauthEmail] = useState("");
  const [oauthProvider, setOauthProvider] = useState("");
  const [oauthCode, setOauthCode] = useState("");

  // Called once the query params are read:
  const handleParamsLoaded = useCallback((res: { isLogin: boolean; errorParam: string; oauthEmail?: string; oauthProvider?: string; oauthCode?: string }) => {
    setIsLogin(res.isLogin);
    setErrorParam(res.errorParam);
    if (res.oauthEmail) setOauthEmail(res.oauthEmail);
    if (res.oauthProvider) setOauthProvider(res.oauthProvider);
    if (res.oauthCode) setOauthCode(res.oauthCode);
  }, []);

  return (
    <div className="page-container flex items-center justify-center">
      {/* Let GetAuthParams read and parse URL query, storing results in our states */}
      <GetAuthParams onParamsLoadedAction={handleParamsLoaded} />

      {/* Now that we have isLogin, errorParam, etc., pass to AuthForm */}
      <AuthForm isLogin={isLogin} errorParam={errorParam} oauthEmail={oauthEmail} oauthProvider={oauthProvider} oauthCode={oauthCode} recaptchaSiteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY} />
    </div>
  );
}
