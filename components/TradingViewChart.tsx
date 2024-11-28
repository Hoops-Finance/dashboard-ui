"use client"

import { useEffect, useRef } from 'react'
import { createChart, ColorType } from 'lightweight-charts'
import { useTheme } from "@/components/ThemeContext"

export function TradingViewChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!chartContainerRef.current) return

    const isDark = theme === 'dark'

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: isDark ? '#0D0D0D' : '#FFFFFF'
        },
        textColor: isDark ? '#E5E5E5' : '#1A1A1A',
      },
      grid: {
        vertLines: { 
          color: isDark ? '#1F1F1F' : '#E6E6E6'
        },
        horzLines: { 
          color: isDark ? '#1F1F1F' : '#E6E6E6'
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: 600,
      crosshair: {
        vertLine: {
          color: isDark ? '#404040' : '#B3B3B3',
          width: 1,
          style: 0,
          labelBackgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
        },
        horzLine: {
          color: isDark ? '#404040' : '#B3B3B3',
          width: 1,
          style: 0,
          labelBackgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
        }
      }
    })

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22C55E',     // Emerald-400
      downColor: '#EF4444',   // Red-400
      borderVisible: false,
      wickUpColor: '#22C55E', // Emerald-400
      wickDownColor: '#EF4444', // Red-400
    })

    // Generate 90 days of realistic-looking data
    const generateData = () => {
      const data = []
      let currentPrice = 1.25
      const volatility = 0.02
      const baseTimestamp = Math.floor(new Date('2024-01-01').getTime() / 1000)

      for (let i = 0; i < 90; i++) {
        const timestamp = baseTimestamp + (i * 86400)
        const change = (Math.random() - 0.5) * volatility
        const open = currentPrice
        const close = currentPrice * (1 + change)
        const high = Math.max(open, close) * (1 + Math.random() * 0.01)
        const low = Math.min(open, close) * (1 - Math.random() * 0.01)

        data.push({
          time: timestamp,
          open: parseFloat(open.toFixed(4)),
          high: parseFloat(high.toFixed(4)),
          low: parseFloat(low.toFixed(4)),
          close: parseFloat(close.toFixed(4)),
        })

        currentPrice = close
      }
      return data.sort((a, b) => a.time - b.time)
    }

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: isDark ? '#3B82F6' : '#60A5FA', // Blue colors
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    })

    const data = generateData()
    
    // Generate matching volume data
    const volumeData = data.map(item => ({
      time: item.time,
      value: Math.random() * 100000 + 50000,
      color: item.close >= item.open 
        ? '#22C55E44' // Emerald-400 with opacity
        : '#EF444444'  // Red-400 with opacity
    }))

    candlestickSeries.setData(data)
    volumeSeries.setData(volumeData)

    // Add moving averages
    const ma20Series = chart.addLineSeries({
      color: isDark ? '#3B82F6' : '#60A5FA', // Blue colors
      lineWidth: 2,
      priceLineVisible: false,
    })

    const ma50Series = chart.addLineSeries({
      color: isDark ? '#D97706' : '#F59E0B', // Yellow colors
      lineWidth: 2,
      priceLineVisible: false,
    })

    // Calculate and set moving averages
    const calculateMA = (data: any[], period: number) => {
      const maData = []
      for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0)
        maData.push({
          time: data[i].time,
          value: sum / period,
        })
      }
      return maData
    }

    ma20Series.setData(calculateMA(data, 20))
    ma50Series.setData(calculateMA(data, 50))

    // Handle resize
    const handleResize = (container: HTMLElement) => {
      if (chartContainerRef.current) {
        chart.resize(container.clientWidth, container.clientHeight)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      chart.remove()
      window.removeEventListener('resize', handleResize)
    }
  }, [theme]) // Re-create chart when theme changes

  return (
    <div className="w-full h-[600px] bg-background rounded-lg border border-border">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  )
} 