import { useQuery } from '@tanstack/react-query'

export interface ChartDataParams {
    fromToken: string
    toToken: string
    period?: string
    chainId?: string
}

async function fetchChartData({ fromToken, toToken, period = '3600', chainId = '1' }: ChartDataParams) {
    const params = new URLSearchParams({
        fromToken,
        toToken,
        period,
        chainId,
    })
    const res = await fetch(`/api/1inch/charts?${params.toString()}`)
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.description || 'Failed to fetch chart data')
    }
    const response = await res.json()
    return response.data
}

export { fetchChartData }

export function useChartData(params: ChartDataParams) {
    return useQuery({
        queryKey: ['chartData', params],
        queryFn: () => fetchChartData(params),
        enabled: !!params.fromToken && !!params.toToken,
    })
} 