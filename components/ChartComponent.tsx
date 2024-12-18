"use client";

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, UTCTimestamp, SeriesType, ISeriesApi, ColorType, ChartOptions, DeepPartial, PriceFormatBuiltIn } from "lightweight-charts";
import { ema, calcMACD, calcRSI, calcSMA, calcBollinger } from "@/utils/indicators";
import type { CandleDataPoint, VolumeDataPoint } from "@/utils/utilities";
import { ChartToolbar } from './ChartToolbar';

interface ChartProps {
  candleData: CandleDataPoint[];
  volumeData: VolumeDataPoint[];
}

export default function ChartComponent({ candleData, volumeData }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const [chartStyle, setChartStyle] = useState<'candlestick'|'line'|'area'>('candlestick');
  const [showMACD, setShowMACD] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [inverted, setInverted] = useState(false);

  const mainSeriesRef = useRef<ISeriesApi<SeriesType>|null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram">|null>(null);
  const macdSeriesRef = useRef<ISeriesApi<"Line">|null>(null);
  const macdSignalSeriesRef = useRef<ISeriesApi<"Line">|null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line">|null>(null);
  const smaSeriesRef = useRef<ISeriesApi<"Line">|null>(null);
  const emaSeriesRef = useRef<ISeriesApi<"Line">|null>(null);
  const bollUpperRef = useRef<ISeriesApi<"Line">|null>(null);
  const bollMiddleRef = useRef<ISeriesApi<"Line">|null>(null);
  const bollLowerRef = useRef<ISeriesApi<"Line">|null>(null);

  const finalCandleData = inverted ? candleData.map(d=>{
    const invOpen=1/d.open;
    const invClose=1/d.close;
    const invHigh=1/d.low;
    const invLow=1/d.high;
    return {time:d.time, open:invOpen, high:invHigh, low:invLow, close:invClose};
  }) : candleData;

  // Helper function to extend indicator data across entire dataset
  // If indicator is computed from startIndex to end, replicate the first computed value backward.
  function extendFullData(
    candles: CandleDataPoint[],
    values: number[]
  ): { time: UTCTimestamp; value: number }[] {
    const total = candles.length;
    const computedLen = values.length;
    if (computedLen === 0) return []; // no data
    const startIndex = total - computedLen;
    const firstVal = values[0];
    const full: { time:UTCTimestamp; value:number }[] = [];
    for (let i=0; i<total; i++) {
      const time = candles[i].time as UTCTimestamp;
      if (i<startIndex) {
        full.push({ time, value: firstVal });
      } else {
        full.push({ time, value: values[i-startIndex] });
      }
    }
    return full;
  }

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
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
          top:0.1,
          bottom:0.3,
        },
      },
      handleScroll: {
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
        mouseWheel: true,
      },
      handleScale: {
        axisDoubleClickReset:{time:true,price:false}, // no vertical reset
        axisPressedMouseMove:{time:true,price:true}, // no vertical scale by dragging price axis
        mouseWheel:false, // allow horizontal zoom
        pinch:false // no pinch zoom
      },
      kineticScroll:{
        touch:false,
        mouse:false,
      },
      trackingMode:{
        exitMode:1,
      },
      layout:{
        textColor:'#D9D9D9',
        background:{type:ColorType.Solid,color:'#000000'},
        fontSize:12,
        fontFamily:'Arial',
        attributionLogo:true // must be true
      },
      rightPriceScale:{
        borderVisible:true,
        borderColor:'#2c2c3e',
        entireTextOnly:false,
        visible:true,
        ticksVisible:true,
        minimumWidth:70,
        autoScale:true,
        mode:0,
        invertScale:false,
        alignLabels:true,
        scaleMargins:{top:0.1,bottom:0.3},
      },
      leftPriceScale:{
        visible:false,
        autoScale:false,
        mode:0,
        invertScale:false,
        alignLabels:true,
        borderVisible:false,
        borderColor:'#2c2c3e',
        entireTextOnly:false,
        ticksVisible:true,
        minimumWidth:50,
        scaleMargins:{top:0.1,bottom:0.3},
      },
      timeScale:{
        borderVisible:false,
        rightOffset:0,
        barSpacing:6,
        minBarSpacing:1,
        fixLeftEdge:true, // no blank space on left
        fixRightEdge:true, // no blank space on right
        lockVisibleTimeRangeOnResize:true,
        rightBarStaysOnScroll:true,
        borderColor:'#2c2c3e',
        visible:true,
        timeVisible:true,
        secondsVisible:false,
        shiftVisibleRangeOnNewBar:true,
        ticksVisible:true,
        allowShiftVisibleRangeOnWhitespaceReplacement:true,
        uniformDistribution:false,
        minimumHeight:0,
        allowBoldLabels:true,
      },
      grid:{
        vertLines:{color:'#2c2c3e',style:0,visible:true},
        horzLines:{color:'#2c2c3e',style:0,visible:true},
      },
      crosshair:{
        mode:1,
        vertLine:{
          color:'#758696',width:1,style:0,visible:true,labelVisible:true,
          labelBackgroundColor:'#121212'
        },
        horzLine:{
          color:'#758696',width:1,style:0,visible:true,labelVisible:true,
          labelBackgroundColor:'#121212'
        },
      },
      localization:{
        dateFormat:'yyyy/MM/dd',
        locale:'en-US',
      },
      autoSize:true,
      watermark:{
        visible:false,
        color:'',
        text:'',
        fontSize:0,
        fontFamily:'',
        fontStyle:'',
        horzAlign:'center',
        vertAlign:'center',
      },
      width: container.clientWidth,
      height: container.clientHeight,
    };
    const chartInstance = createChart(container, chartOptions);
    chartRef.current = chartInstance;

    const handleResize = () => {
      if (chartRef.current && container) {
        chartRef.current.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    [mainSeriesRef, volumeSeriesRef, macdSeriesRef, macdSignalSeriesRef, rsiSeriesRef, smaSeriesRef, emaSeriesRef, bollUpperRef, bollMiddleRef, bollLowerRef].forEach(ref => {
      if (ref.current) {
        chart.removeSeries(ref.current);
        ref.current = null;
      }
    });

    if (finalCandleData.length === 0 || volumeData.length === 0) {
      return;
    }

    // Price format with 7 decimals
    const priceFormat: DeepPartial<PriceFormatBuiltIn> = { type: 'price', precision: 7, minMove: 0.0000001 };

    // Main Series
    let mainSeries: ISeriesApi<SeriesType>;
    if (chartStyle === 'candlestick') {
      mainSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderDownColor: '#ef5350',
        borderUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        wickUpColor: '#26a69a',
        priceFormat
      });
      mainSeries.setData(finalCandleData);
    } else if (chartStyle === 'line') {
      const lineData = finalCandleData.map(d => ({ time: d.time, value: d.close }));
      mainSeries = chart.addLineSeries({ color: '#2196f3', lineWidth: 2, crosshairMarkerVisible: true, priceFormat });
      mainSeries.setData(lineData);
    } else {
      const areaData = finalCandleData.map(d => ({ time: d.time, value: d.close }));
      mainSeries = chart.addAreaSeries({
        topColor: 'rgba(33,150,243,0.4)',
        bottomColor: 'rgba(33,150,243,0.0)',
        lineColor: '#2196f3',
        lineWidth: 2,
        priceFormat
      });
      mainSeries.setData(areaData);
    }
    mainSeries.priceScale().applyOptions({autoScale: false, scaleMargins: { top: 0.1, bottom: 0.4} });
    mainSeriesRef.current = mainSeries;

    // Volume Series
    const volSeries = chart.addHistogramSeries({
      color: '#26a69a', 
      priceFormat: { type: 'volume' }, 
      priceScaleId: ''
    });
    volSeries.priceScale().applyOptions({ scaleMargins: { top: 0.75, bottom: 0 } });
    volSeries.setData(volumeData);
    volumeSeriesRef.current = volSeries;

    const closes = finalCandleData.map(d => d.close);

    // MACD
    if (showMACD && closes.length > 0) {
      const { macd, signal } = calcMACD(closes);
      if (macd.length > 0 && signal.length > 0) {
        const macdData = extendFullData(finalCandleData, macd);
        const signalData = extendFullData(finalCandleData, signal);

        const macdLine = chart.addLineSeries({ color: '#e91e63', lineWidth: 1, priceScaleId: 'macd' });
        macdLine.priceScale().applyOptions({ autoScale: false, scaleMargins: { top: 0.1, bottom: 0.4 } });
        macdLine.setData(macdData);
        macdSeriesRef.current = macdLine;

        const sigLine = chart.addLineSeries({ color: '#ffa726', lineWidth: 1, priceScaleId: 'macd' });
        sigLine.priceScale().applyOptions({ autoScale: false, scaleMargins: { top: 0.1, bottom: 0.4 } });
        sigLine.setData(signalData);
        macdSignalSeriesRef.current = sigLine;
      }
    }

    // RSI
    if (showRSI && closes.length > 0) {
      const rsiVals = calcRSI(closes);
      if (rsiVals.length > 0) {
        const rsiData = extendFullData(finalCandleData, rsiVals);
        const rsiLine = chart.addLineSeries({ color: '#ab47bc', lineWidth: 1, priceScaleId: 'rsi' });
        rsiLine.priceScale().applyOptions({ autoScale: false, scaleMargins: { top: 0.1, bottom: 0.3 } });
        rsiLine.setData(rsiData);
        rsiSeriesRef.current = rsiLine;
      }
    }

    // SMA
    if (showSMA && closes.length > 20) {
      const smaVals = calcSMA(closes, 20);
      if (smaVals.length > 0) {
        const smaData = extendFullData(finalCandleData, smaVals);
        const smaLine = chart.addLineSeries({ color: '#00BCD4', lineWidth: 2, priceScaleId: 'sma'});
        smaLine.priceScale().applyOptions({ autoScale: false, scaleMargins: { top: 0.1, bottom: 0.3 } });
        smaLine.setData(smaData);
        smaSeriesRef.current = smaLine;
      }
    }

    // EMA
    if (showEMA && closes.length > 20) {
      const emaVals = ema(closes, 20);
      if (emaVals.length > 0) {
        const emaData = extendFullData(finalCandleData, emaVals);
        const emaLine = chart.addLineSeries({ color: '#8BC34A', lineWidth: 2, priceScaleId: 'ema' });
        emaLine.priceScale().applyOptions({ autoScale: false, scaleMargins: { top: 0.1, bottom: 0.3 } });
        emaLine.setData(emaData);
        emaSeriesRef.current = emaLine;
      }
    } 

    // Bollinger Bands
    if (showBollinger && closes.length > 20) {
      const { upper, middle, lower } = calcBollinger(closes, 20, 2);
      if (upper.length > 0 && middle.length > 0 && lower.length > 0) {
        const upperData = extendFullData(finalCandleData, upper);
        const midData = extendFullData(finalCandleData, middle);
        const lowerData = extendFullData(finalCandleData, lower);

        const upperLine = chart.addLineSeries({ color: '#1E90FF', lineWidth: 1, priceScaleId: 'boll3' });
        upperLine.priceScale().applyOptions({ autoScale: false, scaleMargins: { top: 0.1, bottom: 0.3 } });
        upperLine.setData(upperData);
        bollUpperRef.current = upperLine;

        const midLine = chart.addLineSeries({ color: '#FFD700', lineWidth: 1, priceScaleId: 'boll' });
        midLine.priceScale().applyOptions({ autoScale: false, scaleMargins: { top: 0.1, bottom: 0.3 } });
        midLine.setData(midData);
        bollMiddleRef.current = midLine;

        const lowerLine = chart.addLineSeries({ color: '#1E90FF', lineWidth: 1, priceScaleId: 'boll1' });
        lowerLine.priceScale().applyOptions({ autoScale: false, scaleMargins: { top: 0.1, bottom: 0.3 } });
        lowerLine.setData(lowerData);
        bollLowerRef.current = lowerLine;
      }
    }

    chart.timeScale().fitContent();

    // Show only the last 100 candles by default if we have more than 100
    const totalCandles = finalCandleData.length;
    if (totalCandles > 100) {
      const fromIndex = totalCandles - 100;
      const fromTime = finalCandleData[fromIndex].time as UTCTimestamp;
      const toTime = finalCandleData[totalCandles - 1].time as UTCTimestamp;
      chart.timeScale().setVisibleRange({ from: fromTime, to: toTime });
    }

  }, [chartStyle, finalCandleData, volumeData, showMACD, showRSI, showSMA, showEMA, showBollinger, inverted]);

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor:'black' }}>
      <ChartToolbar
        inverted={inverted}
        setInverted={setInverted}
        chartStyle={chartStyle}
        setChartStyle={setChartStyle}
        showMACD={showMACD} setShowMACD={setShowMACD}
        showRSI={showRSI} setShowRSI={setShowRSI}
        showSMA={showSMA} setShowSMA={setShowSMA}
        showEMA={showEMA} setShowEMA={setShowEMA}
        showBollinger={showBollinger} setShowBollinger={setShowBollinger}
      />

      <div ref={chartContainerRef} className="w-full h-full relative flex-1"></div>
    </div>
  );
}
