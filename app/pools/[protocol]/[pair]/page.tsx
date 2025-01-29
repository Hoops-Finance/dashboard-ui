import { generateMetadata as generateBaseMetadata } from "@/lib/metadata";
import PoolPage from "./PoolPage";
import { Metadata } from "next";

interface PageProps {
  params: {
    protocol: string;
    pair: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const protocol = decodeURIComponent(params.protocol);
  const pair = decodeURIComponent(params.pair);

  return generateBaseMetadata({
    title: `${protocol} - ${pair} Pool`,
    description: `View and analyze the ${protocol} ${pair} pool on Hoops Finance`
  });
}

export default function Page({ params }: PageProps) {
  const protocol = decodeURIComponent(params.protocol);
  const pair = decodeURIComponent(params.pair);

  return <PoolPage protocol={protocol} pair={pair} />;
}
