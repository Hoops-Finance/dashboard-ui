import { generateMetadata as generateBaseMetadata } from "@/lib/metadata";
import PoolPage, { generatePairRoutes } from "./PoolPage";
import { Metadata } from "next";

interface PageProps {
  params: {
    protocol: string;
    pair: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return generateBaseMetadata({
    title: `${params.protocol} - ${params.pair} Pool`,
    description: `View and analyze the ${params.protocol} ${params.pair} pool on Hoops Finance`
  });
}

export { generatePairRoutes };

export default function Page({ params }: PageProps) {
  return <PoolPage params={Promise.resolve(params)} />;
}
