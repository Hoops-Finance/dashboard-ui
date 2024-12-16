"use client";

import React, { useEffect, useRef, useMemo } from 'react';
import { createChart, IChartApi, UTCTimestamp, SeriesType, ISeriesApi, ColorType, ChartOptions, Time } from "lightweight-charts";
import { ema, calcMACD, calcRSI, calcSMA, calcBollinger } from "@/utils/indicators";

type Candle = { time: UTCTimestamp; open:number; high:number; low:number; close:number };
type Volume = { time:UTCTimestamp; value:number; color:string };

interface ChartProps {
  candleData: Candle[];
  volumeData: Volume[];
  chartStyle: 'candlestick' | 'line' | 'area';
  showMACD: boolean;
  showRSI: boolean;
  showSMA: boolean;
  showEMA: boolean;
  showBollinger: boolean;
  inverted: boolean;
}

export default function ChartComponent({
  candleData,
  volumeData,
  chartStyle,
  showMACD,
  showRSI,
  showSMA,
  showEMA,
  showBollinger,
  inverted
}: ChartProps) {

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Series refs
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

  // Compute final candle data if inverted
  const finalCandleData = useMemo(()=>{
    if(!inverted) return candleData;
    return candleData.map(d=>{
      const invOpen=1/d.open;
      const invClose=1/d.close;
      const invHigh=1/d.low;
      const invLow=1/d.high;
      return {time:d.time, open:invOpen, high:invHigh, low:invLow, close:invClose};
    });
  },[candleData,inverted]);

  // Create chart once
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
          bottom:0.1,
        },
      },
      handleScroll: {
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
        mouseWheel: true,
      },
      handleScale: {
        axisDoubleClickReset:{time:true,price:true},
        axisPressedMouseMove:{time:true,price:true},
        mouseWheel:true,
        pinch:true,
      },
      kineticScroll:{
        touch:true,
        mouse:true,
      },
      trackingMode:{
        exitMode:1,
      },
      layout:{
        textColor:'#D9D9D9',
        background:{type:ColorType.Solid,color:'#1e1e2f'},
        fontSize:12,
        fontFamily:'Arial',
        attributionLogo:false,
      },
      rightPriceScale:{
        borderVisible:false,
        borderColor:'#2c2c3e',
        entireTextOnly:false,
        visible:true,
        ticksVisible:true,
        minimumWidth:50,
        autoScale:true,
        mode:0,
        invertScale:false,
        alignLabels:true,
        scaleMargins:{top:0.1,bottom:0.1},
      },
      leftPriceScale:{
        visible:false,
        autoScale:true,
        mode:0,
        invertScale:false,
        alignLabels:true,
        borderVisible:false,
        borderColor:'#2c2c3e',
        entireTextOnly:false,
        ticksVisible:true,
        minimumWidth:50,
        scaleMargins:{top:0.1,bottom:0.1},
      },
      timeScale:{
        borderVisible:false,
        rightOffset:5,
        barSpacing:6,
        minBarSpacing:1,
        fixLeftEdge:false,
        fixRightEdge:false,
        lockVisibleTimeRangeOnResize:false,
        rightBarStaysOnScroll:false,
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
      chartRef.current=null;
    };
  }, []);

  // Update series when data or props change
  useEffect(() => {
    const chart = chartRef.current;
    if(!chart) return;

    // Remove old series
    [mainSeriesRef, volumeSeriesRef, macdSeriesRef, macdSignalSeriesRef, rsiSeriesRef, smaSeriesRef, emaSeriesRef, bollUpperRef, bollMiddleRef, bollLowerRef].forEach(ref=>{
      if(ref.current){
        chart.removeSeries(ref.current);
        ref.current=null;
      }
    });

    if(finalCandleData.length===0 || volumeData.length===0){
      return;
    }

    // Main series
    let mainSeries:ISeriesApi<SeriesType>;
    if (chartStyle==='candlestick'){
      mainSeries=chart.addCandlestickSeries({
        upColor:'#26a69a',
        downColor:'#ef5350',
        borderDownColor:'#ef5350',
        borderUpColor:'#26a69a',
        wickDownColor:'#ef5350',
        wickUpColor:'#26a69a',
      });
      mainSeries.setData(finalCandleData);
    } else if (chartStyle==='line') {
      const lineData=finalCandleData.map(d=>({time:d.time,value:d.close}));
      mainSeries=chart.addLineSeries({color:'#2196f3',lineWidth:2,crosshairMarkerVisible:true});
      mainSeries.setData(lineData);
    } else {
      const areaData=finalCandleData.map(d=>({time:d.time,value:d.close}));
      mainSeries=chart.addAreaSeries({
        topColor:'rgba(33,150,243,0.4)',
        bottomColor:'rgba(33,150,243,0.0)',
        lineColor:'#2196f3',
        lineWidth:2,
      });
      mainSeries.setData(areaData);
    }
    mainSeries.priceScale().applyOptions({scaleMargins:{top:0.1,bottom:0.4}});
    mainSeriesRef.current=mainSeries;

    // Volume series
    const volSeries=chart.addHistogramSeries({
      color:'#26a69a',priceFormat:{type:'volume'},priceScaleId:''
    });
    volSeries.priceScale().applyOptions({scaleMargins:{top:0.7,bottom:0}});
    volSeries.setData(volumeData);
    volumeSeriesRef.current=volSeries;

    const closes=finalCandleData.map(d=>d.close);

    // MACD
    if(showMACD && closes.length>0){
      const {macd,signal}=calcMACD(closes);
      if(macd.length>0 && signal.length>0){
        const startIndex=finalCandleData.length - macd.length;
        const macdData=macd.map((v,i)=>({time:finalCandleData[startIndex+i].time,value:v}));
        const signalData=signal.map((v,i)=>({time:finalCandleData[startIndex+(macd.length - signal.length)+i].time,value:v}));

        const macdLine=chart.addLineSeries({color:'#e91e63',lineWidth:1,priceScaleId:'macd'});
        macdLine.priceScale().applyOptions({autoScale:true,scaleMargins:{top:0.3,bottom:0.3}});
        macdLine.setData(macdData);
        macdSeriesRef.current=macdLine;

        const sigLine=chart.addLineSeries({color:'#ffa726',lineWidth:1,priceScaleId:'macd'});
        sigLine.setData(signalData);
        macdSignalSeriesRef.current=sigLine;
      }
    }

    // RSI
    if(showRSI && closes.length>0){
      const rsiVals=calcRSI(closes);
      if(rsiVals.length>0){
        const startIndex=finalCandleData.length - rsiVals.length;
        const rsiData=rsiVals.map((v,i)=>({time:finalCandleData[startIndex+i].time,value:v}));
        const rsiLine=chart.addLineSeries({color:'#ab47bc',lineWidth:1,priceScaleId:'rsi'});
        rsiLine.priceScale().applyOptions({autoScale:true,scaleMargins:{top:0.3,bottom:0.3}});
        rsiLine.setData(rsiData);
        rsiSeriesRef.current=rsiLine;
      }
    }

    // SMA (20-period)
    if(showSMA && closes.length>20){
      const smaVals=calcSMA(closes,20);
      const startIndex=finalCandleData.length - smaVals.length;
      const smaData=smaVals.map((v,i)=>({time:finalCandleData[startIndex+i].time,value:v}));
      const smaLine=chart.addLineSeries({color:'#00BCD4',lineWidth:2});
      smaLine.setData(smaData);
      smaSeriesRef.current=smaLine;
    }

    // EMA (20-period)
    if(showEMA && closes.length>20){
      const emaVals=ema(closes,20);
      const startIndex=finalCandleData.length - emaVals.length;
      const emaData=emaVals.map((v,i)=>({time:finalCandleData[startIndex+i].time,value:v}));
      const emaLine=chart.addLineSeries({color:'#8BC34A',lineWidth:2});
      emaLine.setData(emaData);
      emaSeriesRef.current=emaLine;
    }

    // Bollinger Bands (20-period, multiplier=2)
    if(showBollinger && closes.length>20){
      const {upper,middle,lower}=calcBollinger(closes,20,2);
      if(upper.length>0 && middle.length>0 && lower.length>0){
        // Note: upper,middle,lower arrays start after period-1 bars
        const startIndex=finalCandleData.length - upper.length; 
        // Because calcBollinger returns arrays aligned with data.length (minus period-1)
        const upperData=upper.map((v,i)=>({time:finalCandleData[startIndex+i].time,value:v}));
        const midData=middle.map((v,i)=>({time:finalCandleData[startIndex+i].time,value:v}));
        const lowerData=lower.map((v,i)=>({time:finalCandleData[startIndex+i].time,value:v}));

        const upperLine=chart.addLineSeries({color:'#FF5722',lineWidth:1});
        upperLine.setData(upperData);
        bollUpperRef.current=upperLine;

        const midLine=chart.addLineSeries({color:'#FF5722',lineWidth:1, lineStyle:0});
        midLine.setData(midData);
        bollMiddleRef.current=midLine;

        const lowerLine=chart.addLineSeries({color:'#FF5722',lineWidth:1});
        lowerLine.setData(lowerData);
        bollLowerRef.current=lowerLine;
      }
    }

    chart.timeScale().fitContent();
  }, [chartStyle, finalCandleData, volumeData, showMACD, showRSI, showSMA, showEMA, showBollinger, inverted]);

  return <div className="w-full h-full" ref={chartContainerRef}></div>;
}
