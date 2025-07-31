import { useQuery } from '@tanstack/react-query'

export interface OrdersDataParams {
    address: string
    page?: string
    limit?: string
    chainId?: string
}

async function fetchOrdersData({
    address,
    page = '1',
    limit = '100',
    chainId = '1'
}: OrdersDataParams) {
    const params = new URLSearchParams({
        address,
        page,
        limit,
        chainId,
    })
    const res = await fetch(`/api/1inch/orders?${params.toString()}`)
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.description || 'Failed to fetch orders data')
    }
    const response = await res.json()
    return response
}

export { fetchOrdersData }

export function useOrdersData(params: OrdersDataParams) {
    return useQuery({
        queryKey: ['ordersData', params],
        queryFn: () => fetchOrdersData(params),
        enabled: !!params.address,
        refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    })
} 