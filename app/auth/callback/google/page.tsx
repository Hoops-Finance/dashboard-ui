import { Suspense } from 'react';
import SocialAuth from "@/components/auth/socialAuth";

export default function SocialAuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SocialAuth />
    </Suspense>
  );
}
