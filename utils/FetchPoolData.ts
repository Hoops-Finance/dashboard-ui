import { PoolRiskApiResponseObject } from "./newTypes";
export const fetchPoolData = async (setPoolsData: (data: PoolRiskApiResponseObject[]) => void, setLoading: (value: boolean) => void, period: string) => {
  try {
    setLoading(true);
    const response = await fetch(`/api/getstatistics?period=${period}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: PoolRiskApiResponseObject[] = await response.json();
    setPoolsData(result);
  } catch (error) {
    console.error("Error fetching pools data:", error);
  } finally {
    setLoading(false);
  }
};

export async function fetchPoolData1() {
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
