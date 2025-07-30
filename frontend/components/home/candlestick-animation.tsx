import React, { useEffect, useState } from 'react';

interface Candle {
    id: number;
    open: number;
    high: number;
    low: number;
    close: number;
    x: number;
    isGreen: boolean;
}

const CandleStickAnimation = () => {
    const [candles, setCandles] = useState<Candle[]>([]);
    const [currentPrice, setCurrentPrice] = useState(1850);

    // Generate initial candles
    useEffect(() => {
        const initialCandles: Candle[] = [];
        let price = 1800;

        for (let i = 0; i < 40; i++) {
            const open = price;
            const volatility = Math.random() * 60 - 30; // -30 to +30
            const close = Math.max(1500, Math.min(2200, open + volatility));
            const high = Math.max(open, close) + Math.random() * 20;
            const low = Math.min(open, close) - Math.random() * 20;

            initialCandles.push({
                id: i,
                open,
                high: Math.max(high, Math.max(open, close)),
                low: Math.min(low, Math.min(open, close)),
                close,
                x: i * 15,
                isGreen: close > open
            });

            price = close;
        }

        setCandles(initialCandles);
        setCurrentPrice(price);
    }, []);

    // Animate candles
    useEffect(() => {
        const interval = setInterval(() => {
            setCandles(prevCandles => {
                const newCandles = [...prevCandles];

                // Update existing candles with slight movements
                newCandles.forEach((candle, index) => {
                    if (Math.random() < 0.3) { // 30% chance to update each candle
                        const volatility = (Math.random() - 0.5) * 10;
                        const newClose = Math.max(1500, Math.min(2200, candle.close + volatility));
                        const newHigh = Math.max(candle.open, newClose) + Math.random() * 15;
                        const newLow = Math.min(candle.open, newClose) - Math.random() * 15;

                        newCandles[index] = {
                            ...candle,
                            close: newClose,
                            high: Math.max(newHigh, Math.max(candle.open, newClose)),
                            low: Math.min(newLow, Math.min(candle.open, newClose)),
                            isGreen: newClose > candle.open
                        };
                    }
                });

                // Add new candle and remove old one
                const lastCandle = newCandles[newCandles.length - 1];
                const newOpen = lastCandle.close;
                const volatility = (Math.random() - 0.5) * 40;
                const newClose = Math.max(1500, Math.min(2200, newOpen + volatility));
                const newHigh = Math.max(newOpen, newClose) + Math.random() * 20;
                const newLow = Math.min(newOpen, newClose) - Math.random() * 20;

                const newCandle: Candle = {
                    id: Date.now(),
                    open: newOpen,
                    high: Math.max(newHigh, Math.max(newOpen, newClose)),
                    low: Math.min(newLow, Math.min(newOpen, newClose)),
                    close: newClose,
                    x: (newCandles.length) * 15,
                    isGreen: newClose > newOpen
                };

                // Shift all candles left and add new one
                const shiftedCandles = newCandles.slice(1).map(candle => ({
                    ...candle,
                    x: candle.x - 15
                }));

                setCurrentPrice(newClose);
                return [...shiftedCandles, newCandle];
            });
        }, 800);

        return () => clearInterval(interval);
    }, []);

    const maxPrice = Math.max(...candles.map(c => c.high));
    const minPrice = Math.min(...candles.map(c => c.low));
    const priceRange = maxPrice - minPrice;

    const getY = (price: number) => {
        return 300 - ((price - minPrice) / priceRange) * 280;
    };

    return (
        <div className="relative w-full max-w-2xl">
            {/* Chart Container */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-8 shadow-2xl backdrop-blur-sm">

                {/* Chart SVG */}
                <div className="relative h-80 overflow-hidden rounded-xl bg-slate-900/50">
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 600 320"
                        className="absolute inset-0"
                    >
                        {/* Grid Lines */}
                        <defs>
                            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />

                        {/* Price Line */}
                        <path
                            d={`M 0 ${getY(candles[0]?.close || 1800)} ${candles.map((candle, i) =>
                                `L ${candle.x} ${getY(candle.close)}`
                            ).join(' ')}`}
                            fill="none"
                            stroke="rgba(59, 130, 246, 0.5)"
                            strokeWidth="2"
                            className="animate-pulse"
                        />

                        {/* Candlesticks */}
                        {candles.map((candle) => (
                            <g key={candle.id} className="transition-all duration-300">
                                {/* Wick */}
                                <line
                                    x1={candle.x}
                                    y1={getY(candle.high)}
                                    x2={candle.x}
                                    y2={getY(candle.low)}
                                    stroke={candle.isGreen ? '#10b981' : '#ef4444'}
                                    strokeWidth="1"
                                    opacity="0.8"
                                />

                                {/* Body */}
                                <rect
                                    x={candle.x - 6}
                                    y={getY(Math.max(candle.open, candle.close))}
                                    width="12"
                                    height={Math.abs(getY(candle.open) - getY(candle.close)) || 2}
                                    fill={candle.isGreen ? '#10b981' : '#ef4444'}
                                    opacity="0.9"
                                    rx="1"
                                    className="transition-all duration-300 hover:opacity-100"
                                />
                            </g>
                        ))}

                        {/* Glow Effects */}
                        <defs>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                    </svg>

                    {/* Floating Price Indicator */}
                    <div
                        className="absolute right-4 rounded-lg bg-green-500 px-3 py-1 text-sm font-bold text-white shadow-lg transition-all duration-300"
                        style={{
                            top: `${(getY(currentPrice) / 320) * 100}%`,
                            transform: 'translateY(-50%)'
                        }}
                    >
                        ${currentPrice.toFixed(2)}
                    </div>
                </div>

                {/* Trading Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                    {[
                        { label: '24h Volume', value: '$2.4B', color: 'text-blue-400' },
                        { label: '24h High', value: `$${Math.max(...candles.map(c => c.high)).toFixed(2)}`, color: 'text-green-400' },
                        { label: '24h Low', value: `$${Math.min(...candles.map(c => c.low)).toFixed(2)}`, color: 'text-red-400' }
                    ].map((stat, index) => (
                        <div key={stat.label} className="text-center">
                            <div className="mb-1 text-xs text-slate-400">{stat.label}</div>
                            <div className={`font-bold ${stat.color}`}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Glow Effect */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/5 to-green-500/5 blur-xl"></div>
            </div>

            {/* Floating Elements */}
            {[
                { top: '10%', left: '15%', delay: 0, color: 'bg-green-400' },
                { top: '25%', right: '10%', delay: 1000, color: 'bg-blue-400' },
                { bottom: '20%', left: '20%', delay: 2000, color: 'bg-purple-400' },
                { bottom: '15%', right: '15%', delay: 1500, color: 'bg-pink-400' }
            ].map((pos, index) => (
                <div
                    key={index}
                    className={`absolute size-2 ${pos.color} animate-float rounded-full opacity-60`}
                    style={{
                        ...pos,
                        animationDelay: `${pos.delay}ms`,
                        animationDuration: '4s'
                    }}
                ></div>
            ))}
        </div>
    );
};

export default CandleStickAnimation;