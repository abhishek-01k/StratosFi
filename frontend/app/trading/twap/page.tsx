'use client'

import { useState } from 'react'
import { 
  useAccount, 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useReadContract,
  useChainId 
} from 'wagmi'
import { parseEther, parseUnits, encodeFunctionData } from 'viem'
import { polygon } from 'wagmi/chains'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { TokenInput } from '@/components/token-input'
import { TWAPEngineABI } from '@/util/contracts/abis'
import { POLYGON_CONTRACTS } from '@/lib/contracts/polygon-addresses'
import { AlertCircle, TrendingUp, Clock, Shield, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Token = {
  name: string;
  symbol: string;
  address: string;
  logo: string;
  decimals: number;
};

export default function TWAPStrategyPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [duration, setDuration] = useState('3600')
  const [intervals, setIntervals] = useState('10')
  const [priceDeviation, setPriceDeviation] = useState('500') // 5%
  const [amount, setAmount] = useState('')
  const [sellToken, setSellToken] = useState<Token>()
  const [buyToken, setBuyToken] = useState<Token>()
  const [enableRandomization, setEnableRandomization] = useState(true)
  const [activeConfigId, setActiveConfigId] = useState<string>()

  const isPolygon = chainId === polygon.id

  // Configure TWAP write contract
  const { 
    data: configureTxHash,
    writeContract: configureTWAP,
    isPending: isConfiguring 
  } = useWriteContract()

  // Wait for configuration transaction
  const { 
    isLoading: isConfirming,
    isSuccess: isConfigured 
  } = useWaitForTransactionReceipt({
    hash: configureTxHash,
  })

  // Read TWAP status
  const { data: twapStatus } = useReadContract({
    address: POLYGON_CONTRACTS.contracts.twapEngine,
    abi: TWAPEngineABI,
    functionName: 'getTWAPStatus',
    args: activeConfigId ? [activeConfigId as `0x${string}`] : undefined,
    chainId: polygon.id,
    query: {
      enabled: !!activeConfigId && isPolygon,
    }
  })

  // Execute TWAP interval
  const {
    data: executeTxHash,
    writeContract: executeTWAPInterval,
    isPending: isExecuting
  } = useWriteContract()

  const handleCreateTWAP = async () => {
    if (!isPolygon) {
      toast.error('Please switch to Polygon network')
      return
    }

    if (!sellToken || !buyToken || !amount) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const amountInWei = parseUnits(amount, sellToken.decimals)
      
      configureTWAP({
        address: POLYGON_CONTRACTS.contracts.twapEngine,
        abi: TWAPEngineABI,
        functionName: 'configureTWAP',
        args: [
          amountInWei,
          BigInt(intervals),
          BigInt(duration),
          BigInt(priceDeviation),
          enableRandomization
        ],
        chainId: polygon.id,
      }, {
        onSuccess: (hash) => {
          toast.success('TWAP configuration transaction submitted')
        },
        onError: (error) => {
          console.error('TWAP configuration failed:', error)
          toast.error(error.message || 'Failed to configure TWAP')
        }
      })
    } catch (error) {
      console.error('Error preparing TWAP:', error)
      toast.error('Failed to prepare TWAP configuration')
    }
  }

  const handleExecuteInterval = async () => {
    if (!activeConfigId) return

    // In a real implementation, you would fetch the current price from an oracle
    const mockCurrentPrice = parseEther('1')

    executeTWAPInterval({
      address: POLYGON_CONTRACTS.contracts.twapEngine,
      abi: TWAPEngineABI,
      functionName: 'executeTWAPInterval',
      args: [
        activeConfigId as `0x${string}`,
        mockCurrentPrice
      ],
      chainId: polygon.id,
    }, {
      onSuccess: () => {
        toast.success('TWAP interval executed successfully')
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to execute interval')
      }
    })
  }

  const isLoading = isConfiguring || isConfirming

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">TWAP Strategy</h1>
          <p className="text-muted-foreground">
            Time-Weighted Average Price execution with MEV protection on Polygon
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
              <CardTitle>Configure TWAP Order</CardTitle>
              <CardDescription>
                Set up your TWAP execution parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TokenInput
                label="Sell Amount"
                value={amount}
                onChange={setAmount}
                selectedToken={sellToken}
                onSelectToken={setSellToken}
              />

              <TokenInput
                label="Buy Token"
                value=""
                onChange={() => { }}
                selectedToken={buyToken}
                onSelectToken={setBuyToken}
                showBalance={false}
              />

              <div className="space-y-2">
                <Label htmlFor="duration">Total Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Total time to execute the order (e.g., 3600 = 1 hour)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="intervals">Number of Intervals</Label>
                <Input
                  id="intervals"
                  type="number"
                  value={intervals}
                  onChange={(e) => setIntervals(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Order will be split into this many chunks
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviation">Max Price Deviation (basis points)</Label>
                <Input
                  id="deviation"
                  type="number"
                  value={priceDeviation}
                  onChange={(e) => setPriceDeviation(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum allowed price change (100 = 1%, 500 = 5%)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="randomization"
                  checked={enableRandomization}
                  onCheckedChange={setEnableRandomization}
                />
                <Label htmlFor="randomization" className="cursor-pointer">
                  Enable MEV protection (randomized execution)
                </Label>
              </div>

              {!isConnected ? (
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  Please connect your wallet to continue
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleCreateTWAP}
                  disabled={!amount || !sellToken || !buyToken || isLoading || !isPolygon}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isConfiguring ? 'Configuring...' : 'Confirming...'}
                    </>
                  ) : (
                    'Configure TWAP Order'
                  )}
                </Button>
              )}

              {isConfigured && (
                <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm text-green-600 dark:text-green-400">
                  TWAP order configured successfully! You can now execute intervals.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  TWAP Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5" />
                    <span>MEV-resistant execution with randomized intervals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary mt-0.5" />
                    <span>Adaptive timing based on market volatility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                    <span>Price deviation protection prevents bad fills</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network:</span>
                    <span className="font-medium">Polygon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sell Token:</span>
                    <span className="font-medium">{sellToken?.symbol || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Buy Token:</span>
                    <span className="font-medium">{buyToken?.symbol || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-medium">{amount || '0'} {sellToken?.symbol || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Execution Time:</span>
                    <span className="font-medium">{(Number(duration) / 3600).toFixed(1)} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chunks:</span>
                    <span className="font-medium">{intervals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg per Chunk:</span>
                    <span className="font-medium">
                      {amount && intervals ? (Number(amount) / Number(intervals)).toFixed(4) : '0'} {sellToken?.symbol || ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interval:</span>
                    <span className="font-medium">
                      ~{duration && intervals ? (Number(duration) / Number(intervals) / 60).toFixed(1) : '0'} min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Deviation:</span>
                    <span className="font-medium">{Number(priceDeviation) / 100}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MEV Protection:</span>
                    <span className="font-medium">{enableRandomization ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active TWAP Status */}
            {twapStatus && (
              <Card>
                <CardHeader>
                  <CardTitle>Active TWAP Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Executed Amount:</span>
                      <span className="font-medium">
                        {twapStatus[1]?.executedAmount?.toString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span className="font-medium">
                        {twapStatus[3]?.toString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Interval:</span>
                      <span className="font-medium">
                        {new Date(Number(twapStatus[2]) * 1000).toLocaleTimeString()}
                      </span>
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={handleExecuteInterval}
                      disabled={isExecuting}
                      variant="secondary"
                    >
                      {isExecuting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        'Execute Next Interval'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}