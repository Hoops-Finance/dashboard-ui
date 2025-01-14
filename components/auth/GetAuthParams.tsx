"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";

interface ParamsResult {
  isLogin: boolean;
  errorParam: string;
  oauthEmail?: string;
  oauthProvider?: string;
  oauthCode?: string;
}

function InternalModeSetter({
  onParamsLoadedAction
}: {
  onParamsLoadedAction: (res: ParamsResult) => void;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    // Check if `?mode=login`
    const modeParam = searchParams.get("mode");
    const errorParam = searchParams.get("error") ?? "";

    // By default, isLogin = (mode=login)
    let isLogin = modeParam === "login";

    // If no `?mode=login` is present, but the pathname includes /login, let's default to true
    if (!modeParam && pathname && pathname.toLowerCase().includes("login")) {
      isLogin = true;
    }

    let oauthEmail = "";
    let oauthProvider = "";
    let oauthCode = "";

    // If the errorParam starts with "NO_ACCOUNT", parse out the extra data
    if (errorParam.startsWith("NO_ACCOUNT")) {
      const parts = errorParam.split("|")[1]; // e.g. "email=xxx&provider=xxx&code=xxx"
      const qp = new URLSearchParams(parts);
      oauthEmail = qp.get("email") ?? "";
      oauthProvider = qp.get("provider") ?? "";
      oauthCode = qp.get("code") ?? "";
    }

    onParamsLoadedAction({
      isLogin,
      errorParam,
      oauthEmail,
      oauthProvider,
      oauthCode
    });
  }, [searchParams, pathname, onParamsLoadedAction]);

  return null;
}

/**
 * GetAuthParams:
 * This component determines whether the user is in login or signup mode based on
 * the 'mode' param, the path (e.g. /account/login), and the 'error' param.
 * Once the params are processed, it calls `onParamsLoadedAction` to pass the results.
 */
export default function GetAuthParams({
  onParamsLoadedAction
}: {
  onParamsLoadedAction: (res: ParamsResult) => void;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InternalModeSetter onParamsLoadedAction={onParamsLoadedAction} />
    </Suspense>
  );
}
