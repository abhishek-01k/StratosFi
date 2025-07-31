import { useQuery } from '@tanstack/react-query'

export interface PortfolioDataParams {
    address: string
    chainId?: string
}

async function fetchPortfolioData({ address, chainId = '137' }: PortfolioDataParams) {
    const params = new URLSearchParams({
        address,
        chainId,
    })
    const res = await fetch(`/api/1inch/portfolio?${params.toString()}`)
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.description || 'Failed to fetch portfolio data')
    }
    const response = await res.json()
    return response
}

export { fetchPortfolioData }

export function usePortfolioData(params: PortfolioDataParams) {
    return useQuery({
        queryKey: ['portfolioData', params],
        queryFn: () => fetchPortfolioData(params),
        enabled: !!params.address && !!params.chainId,
    })
} 