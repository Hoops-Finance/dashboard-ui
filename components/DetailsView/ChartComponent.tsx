"use client";

import React, { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi, TimeScaleOptions, ChartOptions, DeepPartial } from "lightweight-charts";
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
      mode: 0
    },
    timeScale: {
      borderColor: theme === "dark" ? "#777777" : "#cccccc",
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 0, // Aligns candles close to the edge
      fixLeftEdge: true // Ensures alignment starts from the left
    } as TimeScaleOptions,
    leftPriceScale: {
      visible: true, // Ensure the price scale adjusts properly
      borderColor: theme === "dark" ? "#777777" : "#cccccc"
    },
    rightPriceScale: {
      visible: false // Optional, depending on your layout
    }
  });

  // Initialize the chart on mount
  useEffect(() => {
    if (chartContainerRef.current) {
      console.log("Initializing chart...");
      chartRef.current = createChart(chartContainerRef.current, getChartOptions(theme));

      const candlestickSeries = chartRef.current.addCandlestickSeries({
        priceFormat: {
          type: "price",
          precision: 7,
          minMove: 0.0000001
        }
      });

      if (lineSeries[0]?.data?.length > 0) {
        candlestickSeries.setData(lineSeries[0].data);
        seriesRefs.current.push(candlestickSeries);
      }

      // Make the chart fit its content and adjust candle spacing
      chartRef.current.timeScale().fitContent();

      // Adjust candle width dynamically to scale with display size
      chartRef.current.applyOptions({
        timeScale: {
          barSpacing: Math.max(chartContainerRef.current.clientWidth / 100, 6) // Dynamically set spacing
        }
      });

      // Handle resizing
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.resize(chartContainerRef.current.clientWidth, 400);
          chartRef.current.applyOptions({
            timeScale: {
              barSpacing: Math.max(chartContainerRef.current.clientWidth / 100, 6) // Recalculate spacing on resize
            }
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

  return <div ref={chartContainerRef} className="relative w-full h-96 p-0 m-0" />;
};

export default ChartComponent;
