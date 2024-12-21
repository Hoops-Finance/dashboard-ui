"use client";

import { useEffect, useRef, FC } from "react";
import { createChart, IChartApi, ISeriesApi, TimeScaleOptions, ChartOptions, DeepPartial, HorzAlign, VertAlign, ColorType } from "lightweight-charts";
import { useTheme } from "@/contexts/ThemeContext"; // Import the theme context
import { CandleData } from "utils/newTypes";

interface LineSeriesData {
  name: string;
  data: CandleData[];
  color: string;
}

interface ChartComponentProps {
  lineSeries: LineSeriesData[]; // Array of line series data
}

const ChartComponent: FC<ChartComponentProps> = ({ lineSeries }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<ISeriesApi<"Candlestick" | "Line">[]>([]);
  const { theme } = useTheme(); // Access the current theme
  const chartOptions: ChartOptions = {
    overlayPriceScales: {
      mode: 0,
      invertScale: false,
      alignLabels: true,
      borderVisible: false,
      borderColor: '#2c2c3e',
      entireTextOnly: false,
      ticksVisible: true,
      minimumWidth: 50,
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
    handleScroll: {
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: false,
      mouseWheel: true,
    },
    handleScale: {
      axisDoubleClickReset: { time:true, price:true },
      axisPressedMouseMove: { time:true, price:true },
      mouseWheel: true,
      pinch: true,
    },
    kineticScroll: {
      touch: true,
      mouse: true,
    },
    trackingMode: {
      exitMode: 1,
    },
    layout: {
      textColor: '#D9D9D9',
      background: { type: ColorType.Solid, color: '#1e1e2f' },
      fontSize: 12,
      fontFamily: 'Arial',
      attributionLogo: false,
    },
    rightPriceScale: {
      borderVisible: false,
      borderColor: '#2c2c3e',
      entireTextOnly: false,
      visible: true,
      ticksVisible: true,
      minimumWidth: 50,
      autoScale: true,
      mode: 0,
      invertScale: false,
      alignLabels: true,
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
    leftPriceScale: {
      visible: false,
      autoScale: true,
      mode: 0,
      invertScale: false,
      alignLabels: true,
      borderVisible: false,
      borderColor: '#2c2c3e',
      entireTextOnly: false,
      ticksVisible: true,
      minimumWidth: 50,
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
    timeScale: {
      borderVisible: false,
      rightOffset: 5,
      barSpacing: 6,
      minBarSpacing: 1,
      fixLeftEdge: false,
      fixRightEdge: false,
      lockVisibleTimeRangeOnResize: false,
      rightBarStaysOnScroll: false,
      borderColor: '#2c2c3e',
      visible: true,
      timeVisible: true,
      secondsVisible: false,
      shiftVisibleRangeOnNewBar: true,
      ticksVisible: true,
      allowShiftVisibleRangeOnWhitespaceReplacement: true,
      uniformDistribution: false,
      minimumHeight: 0,
      allowBoldLabels: true,
    },
    grid: {
      vertLines: { color: '#2c2c3e', style: 0, visible: true },
      horzLines: { color: '#2c2c3e', style: 0, visible: true },
    },
    crosshair: {
      mode: 1,
      vertLine: {
        color: '#758696', width: 1, style: 0, visible: true, labelVisible: true,
        labelBackgroundColor: '#121212' // Provide a valid color
      },
      horzLine: {
        color: '#758696', width: 1, style: 0, visible: true, labelVisible: true,
        labelBackgroundColor: '#121212' // Provide a valid color here too
      },
    },
    localization: {
      dateFormat: 'yyyy/MM/dd',
      locale: 'en-US',
    },
    autoSize: true,
    watermark: {
      visible: false,
      color: '',
      text: '',
      fontSize: 0,
      fontFamily: '',
      fontStyle: '',
      horzAlign: 'center',
      vertAlign: 'center',
    },
    width: chartContainerRef.current?.clientWidth || 0,
    height: chartContainerRef.current?.clientHeight || 0,
  };
  // Function to configure chart options based on the theme
  const getChartOptions = (theme: string): DeepPartial<ChartOptions> => (
    
    {
      overlayPriceScales: {
        mode: 0,
        invertScale: false,
        alignLabels: true,
        borderVisible: false,
        borderColor: '#2c2c3e',
        entireTextOnly: false,
        ticksVisible: true,
        minimumWidth: 50,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      handleScroll: {
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
        mouseWheel: true,
      },
      handleScale: {
        axisDoubleClickReset: { time:true, price:true },
        axisPressedMouseMove: { time:true, price:true },
        mouseWheel: true,
        pinch: true,
      },
      kineticScroll: {
        touch: true,
        mouse: true,
      },
      trackingMode: {
        exitMode: 1,
      },
      layout: {
        textColor: '#D9D9D9',
        background: { type: ColorType.Solid, color: '#1e1e2f' },
        fontSize: 12,
        fontFamily: 'Arial',
        attributionLogo: false,
      },
      rightPriceScale: {
        borderVisible: false,
        borderColor: '#2c2c3e',
        entireTextOnly: false,
        visible: true,
        ticksVisible: true,
        minimumWidth: 50,
        autoScale: true,
        mode: 0,
        invertScale: false,
        alignLabels: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      leftPriceScale: {
        visible: false,
        autoScale: true,
        mode: 0,
        invertScale: false,
        alignLabels: true,
        borderVisible: false,
        borderColor: '#2c2c3e',
        entireTextOnly: false,
        ticksVisible: true,
        minimumWidth: 50,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderVisible: false,
        rightOffset: 5,
        barSpacing: 6,
        minBarSpacing: 1,
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: false,
        rightBarStaysOnScroll: false,
        borderColor: '#2c2c3e',
        visible: true,
        timeVisible: true,
        secondsVisible: false,
        shiftVisibleRangeOnNewBar: true,
        ticksVisible: true,
        allowShiftVisibleRangeOnWhitespaceReplacement: true,
        uniformDistribution: false,
        minimumHeight: 0,
        allowBoldLabels: true,
      },
      grid: {
        vertLines: { color: '#2c2c3e', style: 0, visible: true },
        horzLines: { color: '#2c2c3e', style: 0, visible: true },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#758696', width: 1, style: 0, visible: true, labelVisible: true,
          labelBackgroundColor: '#121212' // Provide a valid color
        },
        horzLine: {
          color: '#758696', width: 1, style: 0, visible: true, labelVisible: true,
          labelBackgroundColor: '#121212' // Provide a valid color here too
        },
      },
      localization: {
        dateFormat: 'yyyy/MM/dd',
        locale: 'en-US',
      },
      autoSize: true,
      watermark: {
        visible: false,
        color: '',
        text: '',
        fontSize: 0,
        fontFamily: '',
        fontStyle: '',
        horzAlign: 'center',
        vertAlign: 'center',
      },
      width: chartContainerRef.current?.clientWidth || 0,
      height: chartContainerRef.current?.clientHeight || 0,
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
