'use client'

import { useAccount, useContractRead } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VolatilityOracleABI, AdvancedStrategyRouterABI } from '@/util/contracts/abis'
import { getContractAddress } from '@/util/contracts/addresses'
import { Activity, TrendingUp, Shield, AlertTriangle, BarChart3, Users, DollarSign, Clock } from 'lucide-react'

const VOLATILITY_CATEGORIES = ['LOW', 'NORMAL', 'HIGH', 'EXTREME']
const VOLATILITY_COLORS = ['text-green-600', 'text-blue-600', 'text-orange-600', 'text-red-600']

export default function DashboardPage() {
  const { address, isConnected } = useAccount()

  // Mock token addresses for demo
  const tokenAddress = '0x0000000000000000000000000000000000000000'

  const { data: riskScore } = useContractRead({
    address: getContractAddress(1, 'volatilityOracle'),
    abi: VolatilityOracleABI,
    functionName: 'getRiskScore',
    args: [tokenAddress],
    enabled: isConnected,
  })

  const { data: volatilityCategory } = useContractRead({
    address: getContractAddress(1, 'volatilityOracle'),
    abi: VolatilityOracleABI,
    functionName: 'getVolatilityCategory',
    args: [tokenAddress],
    enabled: isConnected,
  })

  const { data: userStats } = useContractRead({
    address: getContractAddress(1, 'advancedStrategyRouter'),
    abi: AdvancedStrategyRouterABI,
    functionName: 'getUserStats',
    args: address ? [address] : undefined,
    enabled: isConnected && !!address,
  })

  const { data: protocolFee } = useContractRead({
    address: getContractAddress(1, 'advancedStrategyRouter'),
    abi: AdvancedStrategyRouterABI,
    functionName: 'protocolFee',
    enabled: isConnected,
  })

  const volatilityCategoryIndex = volatilityCategory ?? 1
  const volatilityCategoryName = VOLATILITY_CATEGORIES[volatilityCategoryIndex]
  const volatilityCategoryColor = VOLATILITY_COLORS[volatilityCategoryIndex]

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your trading activity and market conditions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats ? Number(userStats[0]).toString() : '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Lifetime orders placed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats && Number(userStats[0]) > 0 
                  ? `${((Number(userStats[1]) / Number(userStats[0])) * 100).toFixed(1)}%`
                  : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Successful executions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats ? `${(Number(userStats[2]) / 1e18).toFixed(2)} ETH` : '0 ETH'}
              </div>
              <p className="text-xs text-muted-foreground">
                Lifetime trading volume
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protocol Fee</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {protocolFee ? `${Number(protocolFee) / 100}%` : '0.1%'}
              </div>
              <p className="text-xs text-muted-foreground">
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
                <BarChart3 className="h-5 w-5" />
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
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      Number(riskScore) < 250 ? 'bg-green-600' :
                      Number(riskScore) < 500 ? 'bg-blue-600' :
                      Number(riskScore) < 750 ? 'bg-orange-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${riskScore ? Number(riskScore) / 10 : 0}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
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
                <Shield className="h-5 w-5" />
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
                      <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">TWAP Orders</p>
                        <p className="text-sm text-muted-foreground">
                          Ideal for large orders in stable conditions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Concentrated Liquidity</p>
                        <p className="text-sm text-muted-foreground">
                          Maximize returns with tight ranges
                        </p>
                      </div>
                    </div>
                  </>
                )}
                {volatilityCategoryIndex >= 2 && (
                  <>
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Options Hedging</p>
                        <p className="text-sm text-muted-foreground">
                          Protect positions with put options
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Wider Liquidity Ranges</p>
                        <p className="text-sm text-muted-foreground">
                          Use wider ranges to avoid impermanent loss
                        </p>
                      </div>
                    </div>
                  </>
                )}
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest trading actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Connect your wallet to view activity
              </p>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground text-center py-8">
                  No recent activity. Start trading to see your history here.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}