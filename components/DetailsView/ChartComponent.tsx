"use client";

import React, { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi, TimeScaleOptions, ChartOptions, DeepPartial, HorzAlign, VertAlign } from "lightweight-charts";
import { useTheme } from "../ThemeContext"; // Import the theme context
import { CandleData } from "utils/newTypes";

interface LineSeriesData {
  name: string;
  data: CandleData[];
  color: string;
}

interface ChartComponentProps {
  lineSeries: LineSeriesData[]; // Array of line series data
}

const ChartComponent: React.FC<ChartComponentProps> = ({ lineSeries }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<ISeriesApi<"Candlestick" | "Line">[]>([]);
  const { theme } = useTheme(); // Access the current theme

  // Function to configure chart options based on the theme
  const getChartOptions = (theme: string): DeepPartial<ChartOptions> => ({
    width: chartContainerRef.current?.clientWidth || 0,
    height: 400,
    layout: {
      background: { color: theme === "dark" ? "#2B2B2B" : "#ffffff" },
      textColor: theme === "dark" ? "#D9D9D9" : "#000000"
    },
    grid: {
      vertLines: { color: theme === "dark" ? "#4E4E4E" : "#e1e1e1" },
      horzLines: { color: theme === "dark" ? "#4E4E4E" : "#e1e1e1" }
    },
    crosshair: {
      mode: 0 // Normal crosshair
    },
    timeScale: {
      borderColor: theme === "dark" ? "#777777" : "#cccccc",
      timeVisible: true,
      secondsVisible: false
    } as TimeScaleOptions,
    watermark: {
      visible: true,
      color: theme === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
      text: "Powered by TradingView",
      fontSize: 12,
      horzAlign: "left" as HorzAlign, // Fixing the error by using HorzAlign enum
      vertAlign: "bottom" as VertAlign // Fixing the error by using VertAlign enum
    }
  });

  // Initialize the chart on mount
  useEffect(() => {
    if (chartContainerRef.current) {
      console.log("Initializing chart...");
      chartRef.current = createChart(chartContainerRef.current, getChartOptions(theme));

      // Add candlestick series initially
      if (lineSeries[0]?.data?.length > 0) {
        console.log("Adding candlestick series with data:", lineSeries[0].data);
        const candlestickSeries = chartRef.current.addCandlestickSeries();
        candlestickSeries.setData(lineSeries[0].data);
        seriesRefs.current.push(candlestickSeries);
      }

      // Add any overlay series if available
      lineSeries.slice(1).forEach((line, index) => {
        if (line?.data?.length > 0) {
          console.log(`Adding line series ${index + 1} with data:`, line.data);
          const lineSeriesInstance = chartRef.current!.addLineSeries({
            color: line.color,
            lineWidth: 2,
            priceLineVisible: false,
            title: line.name
          });
          lineSeriesInstance.setData(line.data);
          seriesRefs.current.push(lineSeriesInstance);
        }
      });

      // Handle chart resizing
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          console.log("Resizing chart to width:", chartContainerRef.current.clientWidth);
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth
          });
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chartRef.current?.remove();
      };
    }
  }, [lineSeries, theme]);
  // Empty dependency array ensures this runs once on mount

  // Update the chart when lineSeries changes
  useEffect(() => {
    if (chartRef.current) {
      console.log("Updating chart with new series data:", lineSeries);

      // Add or update candlestick series
      if (lineSeries[0]?.data?.length > 0) {
        if (seriesRefs.current[0]) {
          console.log("Updating candlestick series data...");
          const candlestickSeries = seriesRefs.current[0] as ISeriesApi<"Candlestick">;
          candlestickSeries.setData(lineSeries[0].data);
        } else {
          console.log("Adding candlestick series...");
          const candlestickSeries = chartRef.current.addCandlestickSeries();
          candlestickSeries.setData(lineSeries[0].data);
          seriesRefs.current.push(candlestickSeries);
        }
      }

      // Add or update overlay line series
      lineSeries.slice(1).forEach((line, index) => {
        if (line?.data?.length > 0) {
          if (seriesRefs.current[index + 1]) {
            console.log(`Updating line series ${index + 1}...`);
            const lineSeriesInstance = seriesRefs.current[index + 1] as ISeriesApi<"Line">;
            lineSeriesInstance.setData(line.data);
          } else {
            console.log(`Adding line series ${index + 1}...`);
            const newLineSeries = chartRef.current!.addLineSeries({
              color: line.color,
              lineWidth: 2,
              priceLineVisible: false,
              title: line.name
            });
            newLineSeries.setData(line.data);
            seriesRefs.current.push(newLineSeries);
          }
        }
      });
    }
  }, [lineSeries]);

  // Update chart options when the theme changes
  useEffect(() => {
    if (chartRef.current) {
      console.log(`Updating chart options for ${theme} theme...`);
      chartRef.current.applyOptions(getChartOptions(theme));
    }
  }, [theme]);

  return <div ref={chartContainerRef} className="w-full h-96" />;
};

export default ChartComponent;
