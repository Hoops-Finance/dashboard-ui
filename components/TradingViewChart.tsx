"use client";
import { UTCTimestamp } from "lightweight-charts";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType } from "lightweight-charts";

export function TradingViewChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // We'll store whether <html> has class="dark" in local state.
  // Then we recreate or update the chart if this changes.
  const [isDark, setIsDark] = useState(false);

  // On mount, we check if .dark is present, then set up a MutationObserver
  // to watch for changes to <html>'s "class" attribute.
  useEffect(() => {
    function checkDarkMode() {
      const html = document.documentElement;
      const dark = html.classList.contains("dark");
      setIsDark(dark);
    }

    // Initial check
    checkDarkMode();

    // Watch for <html> class changes:
    const observer = new MutationObserver(() => {
      checkDarkMode();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: isDark ? "#0D0D0D" : "#FFFFFF",
        },
        textColor: isDark ? "#E5E5E5" : "#1A1A1A",
      },
      grid: {
        vertLines: {
          color: isDark ? "#1F1F1F" : "#E6E6E6",
        },
        horzLines: {
          color: isDark ? "#1F1F1F" : "#E6E6E6",
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: 600,
      crosshair: {
        vertLine: {
          color: isDark ? "#404040" : "#B3B3B3",
          width: 1,
          style: 0,
          labelBackgroundColor: isDark ? "#1F1F1F" : "#FFFFFF",
        },
        horzLine: {
          color: isDark ? "#404040" : "#B3B3B3",
          width: 1,
          style: 0,
          labelBackgroundColor: isDark ? "#1F1F1F" : "#FFFFFF",
        },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#22C55E", // Emerald-400
      downColor: "#EF4444", // Red-400
      borderVisible: false,
      wickUpColor: "#22C55E", // Emerald-400
      wickDownColor: "#EF4444", // Red-400
    });

    // Generate 90 days of realistic-looking data
    const generateData = () => {
      const data = [];
      let currentPrice = 1.25;
      const volatility = 0.02;
      const baseTimestamp = Math.floor(new Date("2024-01-01").getTime() / 1000);

      for (let i = 0; i < 90; i++) {
        const timestamp = (baseTimestamp + i * 86400) as UTCTimestamp;
        const change = (Math.random() - 0.5) * volatility;
        const open = currentPrice;
        const close = currentPrice * (1 + change);
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);

        data.push({
          time: timestamp,
          open: parseFloat(open.toFixed(4)),
          high: parseFloat(high.toFixed(4)),
          low: parseFloat(low.toFixed(4)),
          close: parseFloat(close.toFixed(4)),
        });

        currentPrice = close;
      }
      return data.sort((a, b) => a.time - b.time);
    };

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: isDark ? "#3B82F6" : "#60A5FA", // Blue colors
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
      /*
      ,
      priceScaleMargins: {
        top: 0.8,
        bottom: 0,
      },
      */
    });

    const data = generateData();
    candlestickSeries.setData(data);

    // Generate matching volume data
    const volumeData = data.map((item) => ({
      time: item.time,
      value: Math.random() * 100000,
      color:
        item.close >= item.open
          ? "#22C55E44" // Emerald-400 with opacity
          : "#EF444444", // Red-400 with opacity
    }));
    volumeSeries.setData(volumeData);

    // Add moving averages
    const ma20Series = chart.addLineSeries({
      color: isDark ? "#3B82F6" : "#60A5FA", // Blue colors
      lineWidth: 2,
      priceLineVisible: false,
    });

    const ma50Series = chart.addLineSeries({
      color: isDark ? "#D97706" : "#F59E0B", // Yellow colors
      lineWidth: 2,
      priceLineVisible: false,
    });

    // Calculate and set moving averages
    interface CandleData {
      time: UTCTimestamp;
      open: number;
      high: number;
      low: number;
      close: number;
    }

    const calculateMA = (data: CandleData[], period: number) => {
      const maData = [];
      for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
        maData.push({
          time: data[i].time,
          value: sum / period,
        });
      }
      return maData;
    };

    ma20Series.setData(calculateMA(data, 20));
    ma50Series.setData(calculateMA(data, 50));

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      chart.remove();
      window.removeEventListener("resize", handleResize);
    };
  }, [isDark]);

  return (
    <div className="w-full h-[600px] bg-background rounded-lg border border-border">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
