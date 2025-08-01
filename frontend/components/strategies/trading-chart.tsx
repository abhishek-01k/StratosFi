'use client'

import React, { useEffect, useRef } from 'react'
import { CandlestickSeries, createChart, IChartApi, ISeriesApi } from 'lightweight-charts'
import { useStrategies } from '@/context/StrategiesContext'

interface TradingChartProps {
    height?: number
    data?: {
        time: number;
        open: number;
        high: number;
        low: number;
        close: number;
    }[]
}

export const TradingChart: React.FC<TradingChartProps> = ({
    height = 400,
    data
}) => {

    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

    const { fromToken, toToken } =
        useStrategies()

    useEffect(() => {
        if (!chartContainerRef.current || !data || data.length === 0) return

        const chart = createChart(chartContainerRef.current, {
            height,
            autoSize: true,
            layout: {
                background: { color: 'transparent' },
                textColor: '#d1d5db',
            },
            grid: {
                vertLines: { color: 'transparent' },
                horzLines: { color: 'transparent' },
            },
            crosshair: {
                mode: 1,
            },
            leftPriceScale: {
                borderColor: '#374151',
                scaleMargins: {
                    top: 0.3,
                    bottom: 0.3,
                },
            },
            rightPriceScale: {
                visible: false,
            },
            timeScale: {
                borderColor: '#374151',
                timeVisible: true,
                secondsVisible: false,
            },
        })

        chartRef.current = chart

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#22c55e',
            wickDownColor: '#ef4444',
            wickUpColor: '#22c55e',
            priceScaleId: 'left',
        })

        chart.priceScale('left').applyOptions({ visible: true })

        seriesRef.current = candlestickSeries

        const ohlcData = data.map((point) => ({
            time: point.time as any,
            open: point.open,
            high: point.high,
            low: point.low,
            close: point.close,
        }))

        candlestickSeries.setData(ohlcData)

        chart.timeScale().fitContent()

        return () => {
            if (chartRef.current) {
                chartRef.current.remove()
            }
        }
    }, [height, data])

    // Handle case when data is undefined or empty
    if (!data || data.length === 0) {
        return (
            <div className="bg-card rounded-lg border">
                <div className="border-b p-4">
                    <h3 className="text-lg font-semibold">{fromToken.symbol}/{toToken.symbol}</h3>
                </div>
                <div className="flex items-center justify-center p-8 text-center">
                    <div className="text-muted-foreground">
                        <p className="text-lg font-medium">Chart data not available</p>
                        <p className="mt-1 text-sm">Trading data is currently unavailable for this pair</p>
                    </div>
                </div>
            </div>
        )
    }

    let percentChange: number | null = null
    if (data.length >= 2) {
        const prev = data[data.length - 2].close
        const last = data[data.length - 1].close
        if (prev !== 0) {
            percentChange = ((last - prev) / prev) * 100
        }
    }

    return (
        <div className="bg-card rounded-lg border">
            <div className="border-b p-4">
                <h3 className="text-lg font-semibold">{fromToken.symbol}/{toToken.symbol}</h3>
                <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
                    <span className="text-green-500">{data[data.length - 1].close}</span>
                    {percentChange !== null && (
                        <span className={percentChange >= 0 ? "text-green-500" : "text-red-500"}>
                            {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
                        </span>
                    )}
                </div>
            </div>
            <div ref={chartContainerRef} className="p-4" style={{ minWidth: 400 }} />
        </div>
    )
}