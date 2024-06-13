import Navbar from '../components/Navbar';
import TopWidget from '../components/TopWidget';
import DataTable from '../components/DataTable';

const data = [
  {
    marketIcon: '/icons/native-AQUA.png',
    market: 'XLM - AQUA',
    totalValueLocked: '$119.90k',
    volume24hr: '$13.1k',
    fees24hr: '$423',
    apr: '342.1%',
    utilization: '67.3%',
    riskScore: '42%',
  },
  {
    marketIcon: '/icons/USDC-EURC.png',
    market: 'USDC - EURC',
    totalValueLocked: '$95.68k',
    volume24hr: '$21.4k',
    fees24hr: '$550',
    apr: '646.1%',
    utilization: '52.1%',
    riskScore: '56%',
  },
  {
    marketIcon: '/icons/AQUA-XTAR.png',
    market: 'AQUA - XTAR',
    totalValueLocked: '$4.15k',
    volume24hr: '$126',
    fees24hr: '$11',
    apr: '20.1%',
    utilization: '34.2%',
    riskScore: '32%',
  },
  {
    marketIcon: '/icons/native-AQUA.png',
    market: 'XLM - AQUA',
    totalValueLocked: '$82.12k',
    volume24hr: '$1.3k',
    fees24hr: '$241',
    apr: '12.4%',
    utilization: '58.9%',
    riskScore: '38%',
  },
  {
    marketIcon: '/icons/native-NGNC.png',
    market: 'XLM - NGNC',
    totalValueLocked: '$147.21k',
    volume24hr: '$32.4k',
    fees24hr: '$647',
    apr: '548.8%',
    utilization: '71.4%',
    riskScore: '62%',
  },
];

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="flex flex-col items-center justify-start p-6 bg-white">
        <TopWidget />
        <div className="w-full max-w-screen-2xl mt-6">
          <DataTable data={data} />
        </div>
      </main>
    </div>
  );
}
