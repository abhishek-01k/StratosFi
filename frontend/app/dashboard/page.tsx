'use client'

import { useAccount, useReadContract } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VolatilityOracleABI, AdvancedStrategyRouterABI } from '@/util/contracts/abis'
import { getContractAddress } from '@/util/contracts/addresses'
import { Activity, TrendingUp, Shield, AlertTriangle, BarChart3, Users, DollarSign, Clock, Loader2, RefreshCw } from 'lucide-react'
import { usePortfolioData } from '@/hooks/usePortfolioData'
import { useOrdersData } from '@/hooks/useOrdersData'

const VOLATILITY_CATEGORIES = ['LOW', 'NORMAL', 'HIGH', 'EXTREME']
const VOLATILITY_COLORS = ['text-green-600', 'text-blue-600', 'text-orange-600', 'text-red-600']

export default function DashboardPage() {
  const { address, isConnected, chainId } = useAccount()

  const { data: portfolioData, isLoading: loadingPortfolioData, error: portfolioError } = usePortfolioData({
    address: address || '',
    chainId: chainId?.toString() || ''
  })

  const { data: ordersData, isLoading: loadingOrdersData, error: ordersError } = useOrdersData({
    address: address || '',
    chainId: chainId?.toString() || '1',
    page: '1',
    limit: '10'
  })

  // Mock token addresses for demo
  const tokenAddress = '0x0000000000000000000000000000000000000000';

  const { data: riskMetrics } = useReadContract({
    address: getContractAddress(1, 'volatilityOracle'),
    abi: VolatilityOracleABI,
    functionName: 'getRiskMetrics',
  })

  const { data: volatilityCategory } = useReadContract({
    address: getContractAddress(1, 'volatilityOracle'),
    abi: VolatilityOracleABI,
    functionName: 'getVolatilityCategory',
  })

  const { data: userStats } = useReadContract({
    address: getContractAddress(1, 'advancedStrategyRouter'),
    abi: AdvancedStrategyRouterABI,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
  })

  const { data: protocolFee } = useReadContract({
    address: getContractAddress(1, 'advancedStrategyRouter'),
    abi: AdvancedStrategyRouterABI,
    functionName: 'protocolFeeRate',
  })

  // Map volatility category string to index
  let volatilityCategoryIndex = 1 // default to NORMAL
  if (volatilityCategory === 'LOW') volatilityCategoryIndex = 0
  else if (volatilityCategory === 'NORMAL') volatilityCategoryIndex = 1
  else if (volatilityCategory === 'HIGH') volatilityCategoryIndex = 2
  else if (volatilityCategory === 'EXTREME') volatilityCategoryIndex = 3

  const volatilityCategoryName = VOLATILITY_CATEGORIES[volatilityCategoryIndex]
  const volatilityCategoryColor = VOLATILITY_COLORS[volatilityCategoryIndex]

  // Extract risk score from risk metrics
  const riskScore = riskMetrics?.riskScore


  if (!isConnected) {
    return (
      <div className="container py-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your trading activity and market conditions
            </p>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="text-muted-foreground mb-4 size-12" />
              <h3 className="mb-2 text-lg font-semibold">Wallet Not Connected</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Please connect your wallet to view your dashboard and trading activity.
              </p>
              <p className="text-muted-foreground text-center text-sm">
                You&apos;ll be able to see your portfolio data, trading history, and market insights once connected.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your trading activity and market conditions
          </p>
        </div>

        {/* Loading State */}
        {(loadingPortfolioData || loadingOrdersData) && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="text-primary size-6 animate-spin" />
                <span className="text-muted-foreground">Loading your data...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <DollarSign className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingPortfolioData ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : portfolioError ? (
                  <span className="text-sm text-red-500">Error</span>
                ) : portfolioData?.totalValue ? (
                  `$${(Number(portfolioData.totalValue) / 1e18).toFixed(2)}`
                ) : (
                  '$0.00'
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                Total portfolio value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Activity className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingOrdersData ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : ordersError ? (
                  <span className="text-sm text-red-500">Error</span>
                ) : ordersData?.orders ? (
                  ordersData.orders.filter((order: any) => order.status === 'open').length
                ) : (
                  '0'
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                Open limit orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <TrendingUp className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingOrdersData ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : ordersError ? (
                  <span className="text-sm text-red-500">Error</span>
                ) : ordersData?.orders ? (
                  ordersData.orders.length
                ) : (
                  '0'
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                Total orders placed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Shield className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingOrdersData ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : ordersError ? (
                  <span className="text-sm text-red-500">Error</span>
                ) : ordersData?.orders ? (
                  `${((ordersData.orders.filter((order: any) => order.status === 'filled').length / ordersData.orders.length) * 100).toFixed(1)}%`
                ) : (
                  '0%'
                )}
              </div>
              <p className="text-muted-foreground text-xs">
                Order success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protocol Fee</CardTitle>
              <Shield className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {protocolFee ? `${Number(protocolFee) / 100}%` : '0.1%'}
              </div>
              <p className="text-muted-foreground text-xs">
                Current fee rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Market Conditions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5" />
                Market Volatility
              </CardTitle>
              <CardDescription>
                Current market conditions and risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Volatility Category:</span>
                <span className={`font-bold ${volatilityCategoryColor}`}>
                  {volatilityCategoryName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Risk Score:</span>
                <span className="font-medium">
                  {riskScore ? `${Number(riskScore)} / 1000` : '0 / 1000'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Risk Level</span>
                  <span>{riskScore ? `${(Number(riskScore) / 10).toFixed(0)}%` : '0%'}</span>
                </div>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                  <div
                    className={`h-full transition-all ${Number(riskScore) < 250 ? 'bg-green-600' :
                      Number(riskScore) < 500 ? 'bg-blue-600' :
                        Number(riskScore) < 750 ? 'bg-orange-600' :
                          'bg-red-600'
                      }`}
                    style={{ width: `${riskScore ? Number(riskScore) / 10 : 0}%` }}
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-muted-foreground text-sm">
                  {volatilityCategoryIndex === 0 && "Market is stable. Good conditions for standard trading."}
                  {volatilityCategoryIndex === 1 && "Normal market conditions. All strategies available."}
                  {volatilityCategoryIndex === 2 && "High volatility detected. Consider using protective strategies."}
                  {volatilityCategoryIndex === 3 && "Extreme volatility! Use caution when trading."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5" />
                Strategy Recommendations
              </CardTitle>
              <CardDescription>
                Suggested strategies based on current conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {volatilityCategoryIndex <= 1 && (
                  <>
                    <div className="flex items-start gap-2">
                      <TrendingUp className="text-primary mt-0.5 size-4" />
                      <div>
                        <p className="font-medium">TWAP Orders</p>
                        <p className="text-muted-foreground text-sm">
                          Ideal for large orders in stable conditions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="text-primary mt-0.5 size-4" />
                      <div>
                        <p className="font-medium">Concentrated Liquidity</p>
                        <p className="text-muted-foreground text-sm">
                          Maximize returns with tight ranges
                        </p>
                      </div>
                    </div>
                  </>
                )}
                {volatilityCategoryIndex >= 2 && (
                  <>
                    <div className="flex items-start gap-2">
                      <Shield className="text-primary mt-0.5 size-4" />
                      <div>
                        <p className="font-medium">Options Hedging</p>
                        <p className="text-muted-foreground text-sm">
                          Protect positions with put options
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 size-4 text-orange-600" />
                      <div>
                        <p className="font-medium">Wider Liquidity Ranges</p>
                        <p className="text-muted-foreground text-sm">
                          Use wider ranges to avoid impermanent loss
                        </p>
                      </div>
                    </div>
                  </>
                )}
                <div className="border-t pt-3">
                  <p className="text-muted-foreground text-sm">
                    Position size recommendation: <span className="font-medium">
                      {volatilityCategoryIndex === 0 ? '100-150%' :
                        volatilityCategoryIndex === 1 ? '75-100%' :
                          volatilityCategoryIndex === 2 ? '50-75%' :
                            '25-50%'}
                    </span> of normal
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Breakdown */}
        {portfolioData && !loadingPortfolioData && !portfolioError && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5" />
                Portfolio Breakdown
              </CardTitle>
              <CardDescription>
                Your current token holdings and their values
              </CardDescription>
            </CardHeader>
            <CardContent>
              {portfolioData.portfolios && portfolioData.portfolios.length > 0 ? (
                <div className="space-y-4">
                  {portfolioData.portfolios.map((portfolio: any, index: number) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-semibold">{portfolio.name || `Portfolio ${index + 1}`}</h4>
                        <span className="text-muted-foreground text-sm">
                          ${(Number(portfolio.totalValue) / 1e18).toFixed(2)}
                        </span>
                      </div>
                      {portfolio.tokens && portfolio.tokens.length > 0 ? (
                        <div className="space-y-2">
                          {portfolio.tokens.slice(0, 5).map((token: any, tokenIndex: number) => (
                            <div key={tokenIndex} className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span className="bg-primary size-2 rounded-full"></span>
                                {token.symbol || 'Unknown'}
                              </span>
                              <span>${(Number(token.value) / 1e18).toFixed(2)}</span>
                            </div>
                          ))}
                          {portfolio.tokens.length > 5 && (
                            <p className="text-muted-foreground text-center text-xs">
                              +{portfolio.tokens.length - 5} more tokens
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No tokens found</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-4 text-center">
                  No portfolio data available
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Your latest trading orders and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingOrdersData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-primary size-6 animate-spin" />
              </div>
            ) : ordersError ? (
              <div className="py-8 text-center">
                <AlertTriangle className="mx-auto mb-2 size-8 text-red-500" />
                <p className="text-sm text-red-500">Failed to load orders</p>
              </div>
            ) : ordersData?.orders && ordersData.orders.length > 0 ? (
              <div className="space-y-4">
                {ordersData.orders.slice(0, 5).map((order: any, index: number) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className={`size-3 rounded-full ${order.status === 'filled' ? 'bg-green-500' :
                        order.status === 'open' ? 'bg-blue-500' :
                          order.status === 'cancelled' ? 'bg-red-500' :
                            'bg-gray-500'
                        }`}></div>
                      <div>
                        <p className="text-sm font-medium">
                          {order.makerAsset} → {order.takerAsset}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {order.makerAmount} {order.makerAsset}
                      </p>
                      <p className={`text-xs ${order.status === 'filled' ? 'text-green-600' :
                        order.status === 'open' ? 'text-blue-600' :
                          order.status === 'cancelled' ? 'text-red-600' :
                            'text-gray-600'
                        }`}>
                        {order.status?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
                {ordersData.orders.length > 5 && (
                  <p className="text-muted-foreground text-center text-sm">
                    Showing 5 of {ordersData.orders.length} orders
                  </p>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Activity className="text-muted-foreground mx-auto mb-2 size-8" />
                <p className="text-muted-foreground text-sm">No orders found</p>
                <p className="text-muted-foreground text-xs">Start trading to see your order history</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}