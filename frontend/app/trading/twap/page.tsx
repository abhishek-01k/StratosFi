'use client'

import { useState } from 'react'
import { useAccount, useContractWrite, useTransaction, useWriteContract } from 'wagmi'
import { parseEther, parseUnits } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TokenInput } from '@/components/token-input'
import { TWAPEngineABI } from '@/lib/contracts/abis'
import { getContractAddress } from '@/lib/contracts/addresses'
import { AlertCircle, TrendingUp, Clock, Shield } from 'lucide-react'
import { Token } from '@/hooks/useTokenList'
import { toast } from 'sonner'

export default function TWAPStrategyPage() {
  const { address, isConnected } = useAccount()
  const [duration, setDuration] = useState('3600')
  const [intervals, setIntervals] = useState('10')
  const [priceDeviation, setPriceDeviation] = useState('200')
  const [amount, setAmount] = useState('')
  const [sellToken, setSellToken] = useState<Token>()
  const [buyToken, setBuyToken] = useState<Token>()

  const { writeContract } = useWriteContract()

  const handleCreateTWAP = () => {

    writeContract({
      abi: TWAPEngineABI,
      address: getContractAddress(1, 'twapEngine'),
      functionName: 'createTWAPConfig',
      args: [
        BigInt(duration),
        BigInt(intervals),
        BigInt(priceDeviation),
      ],
    }, {
      onSuccess: (data) => {
        console.log("TWAP order created", data)
        toast('TWAP order created successfully!')
      },
      onError: (error) => {
        console.log("TWAP order creation failed", error)
        toast.error('TWAP order creation failed!')
      }
    })
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">TWAP Strategy</h1>
          <p className="text-muted-foreground">
            Time-Weighted Average Price execution with MEV protection
          </p>
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
                  Maximum allowed price change (100 = 1%)
                </p>
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
                  disabled={!amount || !sellToken || !buyToken}
                >
                  Create TWAP Order
                </Button>
              )}

            </CardContent>
          </Card>

          {/* Info Card */}
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estimated Gas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per Execution:</span>
                    <span className="font-medium">~100,000 gas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Executions:</span>
                    <span className="font-medium">{intervals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Gas:</span>
                    <span className="font-medium">~{Number(intervals) * 100000} gas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}