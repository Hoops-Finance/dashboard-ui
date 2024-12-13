//component imports
import SocialAuth from "@/components/auth/socialAuth";
import { Suspense } from "react";

function SocialAuthPage() {
  return <SocialAuth />;
}

export default function SuspenseWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SocialAuthPage />
    </Suspense>
  );
}
