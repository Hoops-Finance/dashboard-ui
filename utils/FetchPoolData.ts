import { PoolRiskApiResponseObject } from "./newTypes";

export async function fetchPoolData() {
  try {
    const res = await fetch('/api/pools', {
      next: { revalidate: 60 }
    });

    if (!res.ok) throw new Error('Failed to fetch pool data');
    return res.json();
  } catch (error) {
    console.error('Error fetching pool data:', error);
    return null;
  }
}
