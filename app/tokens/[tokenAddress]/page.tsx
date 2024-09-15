'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../../components/Navbar';

interface TokenPair {
  pairId: string;
  price: number;
}

interface TokenDetails {
  _id: string;
  symbol: string;
  name: string;
  pairs: TokenPair[];
}

export default function TokenDetailsPage() {
  const router = useRouter();
  const { tokenAddress } = router.query;
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tokenAddress) {
      fetchTokenDetails(tokenAddress as string);
    }
  }, [tokenAddress]);

  const fetchTokenDetails = async (address: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.v1.xlm.services/tokens/${address}`);
      const result = await response.json();
      setTokenDetails(result);
    } catch (error) {
      console.error('Error fetching token details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main className="flex flex-col items-center justify-start p-6">
        <h1 className="text-2xl font-bold mb-6">Token Details</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          tokenDetails && (
            <div className="w-full max-w-screen-lg">
              <h2 className="text-xl font-bold mb-4">
                {tokenDetails.name} ({tokenDetails.symbol})
              </h2>
              <h3 className="text-lg font-semibold mb-2">Tradable Markets:</h3>
              <ul>
                {tokenDetails.pairs.map((pair) => (
                  <li key={pair.pairId} className="mb-2">
                    <a href={`/pairs/${pair.pairId}`} className="text-blue-500 hover:underline">
                      Pair ID: {pair.pairId} - Price: {pair.price}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </main>
    </div>
  );
}
