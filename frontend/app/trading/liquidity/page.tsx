'use client'

import { useState } from 'react'
import { 
  useAccount, 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useChainId 
} from 'wagmi'
import { polygon } from 'wagmi/chains'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConcentratedLiquidityHookABI } from '@/util/contracts/abis'
import { POLYGON_CONTRACTS } from '@/lib/contracts/polygon-addresses'
import { AlertCircle, Layers, DollarSign, Activity, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const FEE_TIERS = [
  { value: 500, label: '0.05%', description: 'Best for stable pairs' },
  { value: 3000, label: '0.3%', description: 'Best for most pairs' },
  { value: 10000, label: '1%', description: 'Best for exotic pairs' },
]

export default function ConcentratedLiquidityPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [currentPrice, setCurrentPrice] = useState('1500')
  const [feeTier, setFeeTier] = useState('3000')
  const [amount, setAmount] = useState('')

  const isPolygon = chainId === polygon.id

  // Calculate ticks from prices
  const calculateTick = (price: string) => {
    if (!price) return 0
    const sqrtPriceX96 = Math.sqrt(Number(price)) * 2 ** 96
    return Math.floor(Math.log(sqrtPriceX96 / 2 ** 96) / Math.log(1.0001))
  }

  const tickLower = calculateTick(minPrice)
  const tickUpper = calculateTick(maxPrice)

  const { 
    data: hash,
    writeContract: createPosition,
    isPending: isCreating 
  } = useWriteContract()

  const { 
    isLoading: isConfirming, 
    isSuccess: isCreateSuccess 
  } = useWaitForTransactionReceipt({
    hash,
  })

  const handleCreatePosition = async () => {
    if (!isPolygon) {
      toast.error('Please switch to Polygon network')
      return
    }

    if (!minPrice || !maxPrice || !feeTier || !amount) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      createPosition({
        address: POLYGON_CONTRACTS.contracts.concentratedLiquidityHook,
        abi: ConcentratedLiquidityHookABI,
        functionName: 'addLiquidity',
        args: [
          '0x0000000000000000000000000000000000000000000000000000000000000000', // orderHash
          {
            tickLower,
            tickUpper,
            feeTier: Number(feeTier),
            amount0Desired: BigInt(Number(amount) * 1e18), // Convert to wei
            amount1Desired: BigInt(Number(amount) * 1e18), // Convert to wei
            amount0Min: BigInt(0),
            amount1Min: BigInt(0),
            recipient: address as `0x${string}`,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
          }
        ],
        chainId: polygon.id,
      }, {
        onSuccess: (hash) => {
          toast.success('Liquidity position creation transaction submitted')
        },
        onError: (error) => {
          console.error('Create position failed:', error)
          toast.error(error.message || 'Failed to create liquidity position')
        }
      })
    } catch (error) {
      console.error('Error creating position:', error)
      toast.error('Failed to prepare position creation')
    }
  }

  const priceRange = minPrice && maxPrice ? ((Number(maxPrice) - Number(minPrice)) / Number(currentPrice) * 100).toFixed(2) : '0'
  const isInRange = minPrice && maxPrice && Number(currentPrice) >= Number(minPrice) && Number(currentPrice) <= Number(maxPrice)
  const isLoading = isCreating || isConfirming

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Concentrated Liquidity</h1>
          <p className="text-muted-foreground">
            Provide liquidity within specific price ranges like Uniswap V3 on Polygon
          </p>
          {!isPolygon && (
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4 text-sm">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Please switch to Polygon network to use this feature
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle>Create Liquidity Position</CardTitle>
              <CardDescription>
                Set your price range and fee tier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Liquidity Amount (MATIC)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Current Price</Label>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <span className="text-2xl font-bold">${currentPrice}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minPrice">Min Price</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="1400"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tick: {tickLower}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPrice">Max Price</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="1600"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tick: {tickUpper}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fee Tier</Label>
                <div className="grid grid-cols-3 gap-2">
                  {FEE_TIERS.map((tier) => (
                    <Button
                      key={tier.value}
                      variant={feeTier === tier.value.toString() ? 'default' : 'outline'}
                      onClick={() => setFeeTier(tier.value.toString())}
                      className="flex flex-col h-auto py-2"
                    >
                      <span className="font-semibold">{tier.label}</span>
                      <span className="text-xs opacity-70">{tier.description}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {!isConnected ? (
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  Please connect your wallet to continue
                </div>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleCreatePosition}
                  disabled={!minPrice || !maxPrice || !amount || isLoading || !isPolygon}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isCreating ? 'Creating...' : 'Confirming...'}
                    </>
                  ) : (
                    'Create Liquidity Position'
                  )}
                </Button>
              )}

              {isCreateSuccess && (
                <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm text-green-600 dark:text-green-400">
                  Liquidity position created successfully!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Position Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Price Range:</span>
                    <span className="font-medium">
                      ${minPrice || '0'} - ${maxPrice || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Range Width:</span>
                    <span className="font-medium">{priceRange}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium flex items-center gap-1 ${isInRange ? 'text-green-600' : 'text-orange-600'}`}>
                      <Activity className="h-3 w-3" />
                      {isInRange ? 'In Range' : 'Out of Range'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Selected Fee:</span>
                    <span className="font-medium">
                      {FEE_TIERS.find(t => t.value.toString() === feeTier)?.label}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Expected Returns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    Your position will earn fees when:
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li>• Price stays within your range</li>
                    <li>• Trades occur in your fee tier</li>
                    <li>• Your liquidity is used for swaps</li>
                  </ul>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated APR:</span>
                      <span className="font-medium text-green-600">12-25%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Liquidity Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-primary mt-0.5" />
                    <span>Earn fees while orders wait to fill</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Layers className="h-4 w-4 text-primary mt-0.5" />
                    <span>Capital efficient concentrated positions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-primary mt-0.5" />
                    <span>Dynamic fee adjustment based on volatility</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}