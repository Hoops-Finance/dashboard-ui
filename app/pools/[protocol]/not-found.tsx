import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-xl font-semibold">Protocol Not Found</h2>
      <p className="text-muted-foreground">
        The protocol you&apos;re looking for doesn&apos;t exist or isn&apos;t supported.
      </p>
      <Button asChild>
        <Link href="/pools">
          View All Protocols
        </Link>
      </Button>
    </div>
  );
} 