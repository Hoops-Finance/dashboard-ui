'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface ParamsResult {
  isLogin: boolean;
  errorParam: string;
  oauthEmail?: string;
  oauthProvider?: string;
  oauthCode?: string;
}

function InternalModeSetter({ onParamsLoadedAction }: { onParamsLoadedAction: (res: ParamsResult) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const errorParam = searchParams.get('error') || '';
    const isLogin = (mode === 'login');

    let oauthEmail = '';
    let oauthProvider = '';
    let oauthCode = '';

    if (errorParam.startsWith('NO_ACCOUNT')) {
      const parts = errorParam.split('|')[1]; // e.g. "email=xxx&provider=xxx&code=xxx"
      const qp = new URLSearchParams(parts);
      oauthEmail = qp.get('email') || '';
      oauthProvider = qp.get('provider') || '';
      oauthCode = qp.get('code') || '';
    }

    onParamsLoadedAction({
      isLogin,
      errorParam,
      oauthEmail,
      oauthProvider,
      oauthCode
    });
  }, [searchParams, onParamsLoadedAction]);

  return null;
}

/**
 * GetAuthParams:
 * This component determines whether the user is in login or signup mode based on
 * the 'mode' and 'error' URL search parameters. It also handles the NO_ACCOUNT scenario.
 * It uses `useSearchParams()`, which requires being wrapped in Suspense.
 * Once the params are processed, it calls `onParamsLoaded` to pass the results to the parent.
 */
export default function GetAuthParams({ onParamsLoadedAction }: { onParamsLoadedAction: (res: ParamsResult) => void }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InternalModeSetter onParamsLoadedAction={onParamsLoadedAction} />
    </Suspense>
  );
}
