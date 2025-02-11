import { Privacy } from "@/components/Privacy";

export const metadata = {
  title: "Privacy Policy - Hoops Finance",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-6 space-y-4 text-foreground text-sm">
      <Privacy />
    </div>
  );
}
