'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';

interface TokenData {
  _id: string;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
  issuer: string;
  logoUrl?: string; // Assuming the API might provide this
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.v1.xlm.services/tokens'); // Use your proxy API route
      const result = await response.json();
      if (Array.isArray(result)) {
        setTokens(result);
      } else {
        setTokens([]); // Handle non-array response
      }
    } catch (error) {
      console.error('Error fetching tokens data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <Navbar />
      <main className="flex flex-col items-center justify-start p-6">
        <h1 className="text-3xl font-bold mb-6">Tokens</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="table-auto w-full max-w-screen-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-4 py-2">Logo</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Symbol</th>
                <th className="px-4 py-2">Decimals</th>
                <th className="px-4 py-2">Issuer</th>
                <th className="px-4 py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token._id} className="border-b border-gray-300 dark:border-gray-600">
                  <td className="border px-4 py-2">
                    {token.logoUrl ? (
                      <img src={token.logoUrl} alt={token.name} className="h-8 w-8" />
                    ) : (
                      'No Logo'
                    )}
                  </td>
                  <td className="border px-4 py-2">{token.name}</td>
                  <td className="border px-4 py-2">{token.symbol}</td>
                  <td className="border px-4 py-2">{token.decimals}</td>
                  <td className="border px-4 py-2">{token.issuer}</td>
                  <td className="border px-4 py-2">
                    {token.price !== undefined ? `$${token.price}` : '$0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
