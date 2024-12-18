'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface ParamsResult {
  isLogin: boolean;
  errorParam: string;
  oauthEmail?: string;
  oauthProvider?: string;
  oauthCode?: string;
}

function InternalModeSetter({ onParamsLoaded }: { onParamsLoaded: (res: ParamsResult) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const errorParam = searchParams.get('error') || '';
    const isLogin = (mode === 'login');

    let oauthEmail = '';
    let oauthProvider = '';
    let oauthCode = '';

    if (errorParam.startsWith('NO_ACCOUNT')) {
      const parts = errorParam.split('|')[1]; // email=xxx&provider=xxx&code=xxx
      const qp = new URLSearchParams(parts);
      oauthEmail = qp.get('email') || '';
      oauthProvider = qp.get('provider') || '';
      oauthCode = qp.get('code') || '';
    }

    onParamsLoaded({
      isLogin,
      errorParam,
      oauthEmail,
      oauthProvider,
      oauthCode
    });
  }, [searchParams, onParamsLoaded]);

  return null;
}

/**
 * GetLoginFromParams:
 * This component determines whether the user is in login or signup mode based on
 * the 'mode' and 'error' URL search parameters. It also handles the NO_ACCOUNT scenario.
 * It uses `useSearchParams()`, which requires being wrapped in Suspense.
 * Once the params are processed, it calls `onParamsLoaded` to pass the results to the parent.
 */
export default function GetLoginFromParams({ onParamsLoaded }: { onParamsLoaded: (res: ParamsResult) => void }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InternalModeSetter onParamsLoaded={onParamsLoaded} />
    </Suspense>
  );
}
