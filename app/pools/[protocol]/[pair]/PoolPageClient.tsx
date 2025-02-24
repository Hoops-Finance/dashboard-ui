// /app/pools/[protocol]/[pairid]/PoolPageClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { ChevronRight, Copy, ExternalLink, Plus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import "./pools.css";
// Props provided by the server component.

interface StatCardProps {
  title: string;
  value: string | number;
  tooltip?: string;
  icon?: ReactNode;
}

const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

export function BackToPoolsButtonClient() {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("BackToPoolsBtn")} // referencing the .BackToPoolsBtn style
      onClick={() => {
        router.push("/pools");
      }}
    >
      <ChevronRight className="IconSmallPrimary rotate-180" aria-hidden="true" />
      Back to Pools
    </Button>
  );
}

export function PoolHeaderButtonsClient({ protocol, market }: { protocol: string; market: string }) {
  return (
    <div className="FlexItemsCenterGap3">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => void handleCopy(window.location.href)}
      >
        <Share2 className="IconSmallPrimary" aria-hidden="true" />
        Share
      </Button>
      <Button
        variant="default"
        size="sm"
        className="gap-2"
        onClick={() => window.open(`https://app.${protocol}.finance/pool/${market}`, "_blank")}
      >
        <Plus className="IconSmallPrimary" aria-hidden="true" />
        Add Liquidity
      </Button>
    </div>
  );
}

export function ProtocolBadgesClient({ protocol }: { protocol: string }) {
  const router = useRouter();
  const protocolPath = protocol === "aqua" ? "aquarius" : protocol;
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalizeInline",
        protocol === "soroswap" && "ProtocolBadgeSoroswap",
        protocol === "blend" && "ProtocolBadgeBlend",
        protocol === "phoenix" && "ProtocolBadgePhoenix",
        protocol === "aqua" && "ProtocolBadgeAqua",
      )}
      onClick={() => {
        router.push(`/pools/${protocolPath}`);
      }}
    >
      {getProtocolDisplay(protocol)}
    </Badge>
  );
}

export function PoolContractButtonsClient({ contractId }: { contractId: string }) {
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => void navigator.clipboard.writeText(contractId)}
        aria-label="Copy contract address"
      >
        <Copy className="IconSmallPrimary" aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() =>
          window.open(`https://stellar.expert/explorer/public/contract/${contractId}`, "_blank")
        }
        aria-label="View on Explorer"
      >
        <ExternalLink className="IconSmallPrimary" aria-hidden="true" />
      </Button>
    </>
  );
}

const getProtocolDisplay = (protocol: string): string =>
  protocol.toLowerCase() === "aqua"
    ? "Aquarius"
    : protocol.charAt(0).toUpperCase() + protocol.slice(1).toLowerCase();
