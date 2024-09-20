import { PoolData } from "./types";

export const fetchPoolData = async (setPoolsData: (data: PoolData[]) => void, setLoading: (value: boolean) => void, period: string) => {
  try {
    setLoading(true);
    const response = await fetch(`/api/getstatistics?period=${period}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: PoolData[] = await response.json();
    setPoolsData(result);
  } catch (error) {
    console.error("Error fetching pools data:", error);
  } finally {
    setLoading(false);
  }
};
