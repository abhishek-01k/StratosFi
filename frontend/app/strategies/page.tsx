"use client"

import React, { useState } from "react"
import { useStrategies } from "@/context/StrategiesContext"
import { useChartData } from "@/hooks/useChartData"
import { TradingChart } from "@/components/strategies/trading-chart"
import TokenPairComponent from "@/components/strategies/TokenPairComponent"
import SelectStrategyComponent from "@/components/strategies/SelectStrategyComponent"

export default function StrategiesPage() {
    const {
        fromToken,
        toToken,
        period,
    } = useStrategies()

    const { data, isLoading, error } = useChartData({
        fromToken: fromToken.address,
        toToken: toToken.address,
        period,
    })

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="mx-auto max-w-7xl">
                <h1 className="mb-8 text-3xl font-bold">Trading Strategies</h1>

                <div className="grid gap-8 lg:grid-cols-2">
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="space-y-6">
                            <TradingChart height={500} data={data} />
                        </div>
                    )}

                    <div className="space-y-6">
                        <TokenPairComponent />
                        <SelectStrategyComponent />
                    </div>
                </div>
            </div>
        </div>
    )
}
