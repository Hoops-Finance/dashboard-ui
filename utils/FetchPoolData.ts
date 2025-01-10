import { PoolRiskApiResponseObject } from "./types";
export const fetchPoolData = async (setPoolsData: (data: PoolRiskApiResponseObject[]) => void, setLoading: (value: boolean) => void, period: string): Promise<void> => {
  try {
    setLoading(true);
    const response = await fetch(`/api/getstatistics?period=${period}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = (await response.json()) as PoolRiskApiResponseObject[];
    setPoolsData(result);
  } catch (error) {
    console.error("Error fetching pools data:", error);
  } finally {
    setLoading(false);
  }
};

export async function fetchPoolData1(): Promise<PoolRiskApiResponseObject[] | null> {
  try {
    const res = await fetch("/api/pools", {
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch pool data");
    }
    const data = (await res.json()) as PoolRiskApiResponseObject[];
    return data;
  } catch (error) {
    console.error("Error fetching pool data:", error);
    return null;
  }
}
