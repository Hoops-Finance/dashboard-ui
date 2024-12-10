import { PoolRiskApiResponseObject } from "./newTypes";

export const fetchPoolData = async (
  setPoolsData: (data: PoolRiskApiResponseObject[]) => void, 
  setLoading: (value: boolean) => void, 
  period: string
) => {
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
    setPoolsData([]);
  } finally {
    setLoading(false);
  }
};
