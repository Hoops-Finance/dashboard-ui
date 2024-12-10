"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Period options
const PERIODS = [
  { value: '24h', label: '24H Period' },
  { value: '7d', label: '7D Period' },
  { value: '14d', label: '14D Period' },
  { value: '30d', label: '30D Period' },
  { value: '90d', label: '90D Period' },
  { value: '180d', label: '180D Period' },
  { value: '360d', label: '360D Period' }
] as const;

export function PeriodSelector({ currentPeriod }: { currentPeriod: string }) {
  return (
    <Select
      defaultValue={currentPeriod}
      onValueChange={(value) => {
        const url = new URL(window.location.href);
        url.searchParams.set('period', value);
        window.location.href = url.toString();
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        {PERIODS.map(period => (
          <SelectItem key={period.value} value={period.value}>
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 