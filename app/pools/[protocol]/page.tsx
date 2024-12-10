import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

// Define available protocols
const PROTOCOLS = ['soroswap', 'aquarius', 'blend', 'phoenix'] as const
type Protocol = typeof PROTOCOLS[number]

interface Pool {
  id: string;
  name: string;
  liquidity: string;
  volume: string;
  apy: string;
}

interface ProtocolInfo {
  name: string;
  description: string;
  logo: string;
  links: {
    name: string;
    url: string;
  }[];
}

// Protocol-specific information
const PROTOCOL_INFO: Record<Protocol, ProtocolInfo> = {
  soroswap: {
    name: "Soroswap",
    description: "Soroswap is a decentralized exchange protocol built on the Stellar network, offering automated market making and liquidity provision services.",
    logo: "/images/protocols/soroswap.svg",
    links: [
      { name: "Website", url: "https://soroswap.finance" },
      { name: "Docs", url: "https://docs.soroswap.finance" },
    ]
  },
  aquarius: {
    name: "Aquarius",
    description: "Aquarius is a lending and borrowing protocol on Stellar, enabling users to earn interest on deposits and borrow assets.",
    logo: "/images/protocols/aquarius.svg",
    links: [
      { name: "Website", url: "https://aquarius.finance" },
      { name: "Documentation", url: "https://docs.aquarius.finance" },
    ]
  },
  blend: {
    name: "Blend",
    description: "Blend is a decentralized exchange aggregator that sources liquidity from multiple DEXes to provide the best trading rates.",
    logo: "/images/protocols/blend.svg",
    links: [
      { name: "Website", url: "https://blend.finance" },
      { name: "Docs", url: "https://docs.blend.finance" },
    ]
  },
  phoenix: {
    name: "Phoenix",
    description: "Phoenix is a decentralized perpetual exchange protocol built on Stellar, offering leveraged trading with deep liquidity.",
    logo: "/images/protocols/phoenix.svg",
    links: [
      { name: "Website", url: "https://phoenix.finance" },
      { name: "Documentation", url: "https://docs.phoenix.finance" },
    ]
  }
}

async function getProtocolPools(protocol: Protocol): Promise<Pool[]> {
  // Replace with your actual API endpoint
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protocols/${protocol}/pools`, {
    next: { revalidate: 60 } // Revalidate every minute
  });
  
  if (!res.ok) throw new Error('Failed to fetch pools');
  return res.json();
}

export default async function ProtocolPage({ 
  params 
}: { 
  params: { protocol: string } 
}) {
  // Validate protocol parameter
  if (!PROTOCOLS.includes(params.protocol as Protocol)) {
    notFound();
  }

  const protocol = params.protocol as Protocol;
  const protocolInfo = PROTOCOL_INFO[protocol];
  const pools = await getProtocolPools(protocol);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4">
          <img 
            src={protocolInfo.logo} 
            alt={`${protocolInfo.name} logo`} 
            className="w-12 h-12"
          />
          <div>
            <CardTitle>{protocolInfo.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Protocol Overview
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {protocolInfo.description}
          </p>
          <div className="flex gap-4">
            {protocolInfo.links.map((link) => (
              <Button
                key={link.url}
                variant="outline"
                asChild
              >
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {link.name}
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Pools</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pool Name</TableHead>
                <TableHead className="text-right">Liquidity</TableHead>
                <TableHead className="text-right">Volume (24h)</TableHead>
                <TableHead className="text-right">APY</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pools.map((pool) => (
                <TableRow key={pool.id}>
                  <TableCell>{pool.name}</TableCell>
                  <TableCell className="text-right">{pool.liquidity}</TableCell>
                  <TableCell className="text-right">{pool.volume}</TableCell>
                  <TableCell className="text-right">{pool.apy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
