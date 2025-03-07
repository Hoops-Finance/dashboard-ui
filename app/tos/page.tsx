import { TOS } from "@/components/TOS";

export const metadata = {
  title: "Terms of Service - Hoops Finance",
};

export default function TosPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-6 space-y-4 text-foreground text-sm">
      <TOS />
    </div>
  );
}
