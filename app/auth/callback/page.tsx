// Copyright 2024 - Hoops Finance - All rights reserved.
/*  This page uses SocialAuth which calls signIn("social", { provider, code }). */

import { Suspense } from 'react';
import SocialAuth from "@/components/auth/socialAuth";

export default function SocialAuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SocialAuth />
    </Suspense>
  );
}
