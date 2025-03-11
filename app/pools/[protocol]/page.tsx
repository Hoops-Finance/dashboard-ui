import { useMemo } from "react";
import { useDataContext } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ProtocolLogo } from "@/components/protocol-logo";
import { formatDollarAmount, formatPercentage } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircleWarning } from "lucide-react";
import { PoolsTable } from "@/components/PoolsTable";
import { TopPools } from "@/components/TopPools";
import { STABLECOIN_IDS, AllowedPeriods } from "@/utils/utilities";
import { fetchCoreData, fetchPeriodDataFromServer } from "@/services/serverData.service";
import { GlobalMetrics } from "../../../utils/types";
export async function generateStaticParams() {
  // Return an array of objects with protocol param for each protocol
  return PROTOCOLS.map((protocol) => ({
    protocol: protocol.toLowerCase(),
  }));
}

// Set revalidation to once per day (in seconds)
export const revalidate = 86400; // 24 hours

const PROTOCOLS = ["soroswap", "aquarius", "blend", "phoenix", "aqua"] as const;
type Protocol = (typeof PROTOCOLS)[number];

const PROTOCOL_INFO: Record<
  Protocol,
  {
    name: string;
    description: string;
    logo: string;
    links: { name: string; url: string }[];
  }
> = {
  soroswap: {
    name: "Soroswap",
    description:
      "Soroswap is a decentralized exchange protocol built on the Stellar network, offering automated market making and liquidity provision services.",
    logo: "/images/protocols/soroswap.svg",
    links: [
      { name: "Website", url: "https://soroswap.finance" },
      { name: "Docs", url: "https://docs.soroswap.finance" },
    ],
  },
  aquarius: {
    name: "Aquarius",
    description:
      "Aqua Network is a decentralized finance platform on the Stellar network, offering tools for liquidity awards, trading, and governance.",
    logo: "/images/protocols/aqua.svg",
    links: [
      { name: "Website", url: "https://aquarius.finance" },
      { name: "Documentation", url: "https://docs.aquarius.finance" },
    ],
  },
  aqua: {
    name: "Aquarius",
    description:
      "Aqua Network is a decentralized finance platform on the Stellar network, offering tools for liquidity awards, trading, and governance.",
    logo: "/images/protocols/aqua.svg",
    links: [
      { name: "Website", url: "https://aquarius.finance" },
      { name: "Documentation", url: "https://docs.aquarius.finance" },
    ],
  },
  blend: {
    name: "Blend",
    description: `Blend is a decentralized finance protocol on the Stellar network, enabling lending, borrowing, and yield farming.`,
    logo: "/images/protocols/blend.svg",
    links: [
      { name: "Website", url: "https://blend.finance" },
      { name: "Docs", url: "https://docs.blend.finance" },
    ],
  },
  phoenix: {
    name: "Phoenix",
    description:
      "Phoenix is a decentralized automated market maker on the stellar network with liquidity pools and rewards.",
    logo: "/images/protocols/phoenix.svg",
    links: [
      { name: "Website", url: "https://phoenix.finance" },
      { name: "Documentation", url: "https://docs.phoenix.finance" },
    ],
  },
};

function getProtocolStats(pools: import("@/utils/types").PoolRiskApiResponseObject[]) {
  if (!pools.length) {
    return {
      tvl: 0,
      volume24h: 0,
      poolCount: 0,
      averageApy: 0,
    };
  }

  const tvl = pools.reduce((sum, pool) => sum + parseFloat(pool.totalValueLocked), 0);
  const volume24h = pools.reduce((sum, pool) => sum + parseFloat(pool.volume), 0);
  const poolCount = pools.length;
  const averageApy =
    pools.reduce((sum, pool) => {
      const apr = parseFloat(pool.apr.replace("%", ""));
      return sum + apr;
    }, 0) / poolCount;

  return { tvl, volume24h, poolCount, averageApy };
}

export default async function ProtocolPage({ params }: { params: Promise<{ protocol: string }> }) {
  //const { poolRiskData, period, loading, pairs, tokens } = useDataContext();
  const { pairs, tokens } = await fetchCoreData();
  // need to get periods from the user, need dynamic periods.
  const period = "14d";
  const { poolRiskData, globalMetrics } = await fetchPeriodDataFromServer(period);
  const { protocol } = await params;
  console.log(protocol);
  const isValidProtocol = PROTOCOLS.includes(protocol.toLowerCase() as Protocol);
  const protocolInfo = isValidProtocol ? PROTOCOL_INFO[protocol as Protocol] : null;
  if (!protocolInfo) {
    throw new Error("Invalid protocol specified.");
  }
  // Filter pools by protocol - server side compatible implementation
  const mappedProtocol = protocol === "aquarius" ? "aqua" : protocol;
  const protocolPools = poolRiskData.filter(
    (pool) => pool.protocol.toLowerCase() === mappedProtocol.toLowerCase()
  );

  const stats = getProtocolStats(protocolPools);

  if (!isValidProtocol) {
    return (
      <main className="container mx-auto p-4 space-y-8">
        <Alert variant="destructive" role="alert">
          <MessageCircleWarning className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>Invalid protocol specified.</AlertDescription>
        </Alert>
      </main>
    );
  }
  /*
  if (loading) {
    return <main className="container mx-auto p-4 space-y-8">Loading pools data...</main>;
  }
*/
  return (
    <main className="container mx-auto p-4 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground">
        <Link href="/" className="flex items-center hover:text-foreground" aria-label="Home">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 11l9-9 9 9M9 21V9c0-.58.24-1.12.66-1.53L12 5.13l2.34 2.34c.42.41.66.95.66 1.53v12" />
          </svg>
        </Link>
        <span>/</span>
        <Link href="/pools" className="hover:text-foreground">
          Pools
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium" aria-current="page">
          {protocolInfo.name}
        </span>
      </nav>

      <div className="grid gap-8">
        {/* Protocol Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex items-center justify-center" aria-hidden="true">
                <ProtocolLogo logo={protocolInfo.logo} name={protocolInfo.name} />
              </div>
              <div>
                <CardTitle>{protocolInfo.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  {protocolInfo.description}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="stat-card">
          <Card>
            <CardHeader className="card-header">
              <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDollarAmount(stats.tvl)}</div>
              <p className="text-xs text-muted-foreground">Across {stats.poolCount} pools</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="card-header">
              <CardTitle className="text-sm font-medium">Volume ({period.toUpperCase()})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDollarAmount(stats.volume24h)}</div>
              <p className="text-xs text-muted-foreground">Last {period.toUpperCase()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="card-header">
              <CardTitle className="text-sm font-medium">Active Pools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.poolCount}</div>
              <p className="text-xs text-muted-foreground">Total pools</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="card-header">
              <CardTitle className="text-sm font-medium">Average APY ({period.toUpperCase()})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(stats.averageApy)}
              </div>
              <p className="text-xs text-muted-foreground">Across all pools</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Pools for this protocol */}
        <TopPools
          data={protocolPools}
          pairs={pairs}
          tokens={tokens}
          stablecoinIds={STABLECOIN_IDS}
          period={period}
        />

        {/* Pools Table Section */}
        <section aria-label="Pools data" className="space-y-4">
          <PoolsTable data={protocolPools} pairs={pairs} tokens={tokens} />
        </section>
      </div>
    </main>
  );
}
