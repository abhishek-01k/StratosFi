'use client'

import { useState } from 'react'
import { useAccount, useContractWrite, useContractRead, useTransaction } from 'wagmi'
import { parseEther } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OptionsProtocolABI } from '@/util/contracts/abis'
import { getContractAddress } from '@/util/contracts/addresses'
import { AlertCircle, Shield, TrendingUp, TrendingDown, Calculator } from 'lucide-react'

type OptionType = 'call' | 'put'

export default function OptionsStrategyPage() {
  const { address, isConnected } = useAccount()
  const [optionType, setOptionType] = useState<OptionType>('call')
  const [orderHash, setOrderHash] = useState('')
  const [premium, setPremium] = useState('')
  const [expiration, setExpiration] = useState('3600') // 1 hour default
  const [strikePrice, setStrikePrice] = useState('')

  const { data: createData, write: createOption } = useContractWrite({
    address: getContractAddress(1, 'optionsProtocol'),
    abi: OptionsProtocolABI,
    functionName: 'createOption',
  })

  const { data: exerciseData, write: exerciseOption } = useContractWrite({
    address: getContractAddress(1, 'optionsProtocol'),
    abi: OptionsProtocolABI,
    functionName: 'exerciseOption',
  })

  const { data: greeksData } = useContractRead({
    address: getContractAddress(1, 'optionsProtocol'),
    abi: OptionsProtocolABI,
    functionName: 'calculateGreeks',
    args: orderHash ? [orderHash as `0x${string}`] : undefined,
    enabled: !!orderHash,
  })

  const { isLoading: createLoading, isSuccess: createSuccess } = useTransaction({
    hash: createData?.hash,
  })

  const { isLoading: exerciseLoading, isSuccess: exerciseSuccess } = useTransaction({
    hash: exerciseData?.hash,
  })

  const handleCreateOption = () => {
    if (!createOption) return

    createOption({
      args: [
        orderHash as `0x${string}`,
        optionType === 'call' ? 0 : 1,
        parseEther(premium),
        BigInt(Math.floor(Date.now() / 1000) + Number(expiration)),
      ],
      value: parseEther(premium),
    })
  }

  const handleExerciseOption = () => {
    if (!exerciseOption) return

    exerciseOption({
      args: [orderHash as `0x${string}`],
    })
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Options Protocol</h1>
          <p className="text-muted-foreground">
            Trade options on limit order execution rights
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Option Card */}
          <Card>
            <CardHeader>
              <CardTitle>Create Option</CardTitle>
              <CardDescription>
                Create a new option on a limit order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Option Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={optionType === 'call' ? 'default' : 'outline'}
                    onClick={() => setOptionType('call')}
                    className="w-full"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Call Option
                  </Button>
                  <Button
                    variant={optionType === 'put' ? 'default' : 'outline'}
                    onClick={() => setOptionType('put')}
                    className="w-full"
                  >
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Put Option
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderHash">Order Hash</Label>
                <Input
                  id="orderHash"
                  placeholder="0x..."
                  value={orderHash}
                  onChange={(e) => setOrderHash(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Hash of the underlying limit order
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="premium">Premium (ETH)</Label>
                <Input
                  id="premium"
                  type="number"
                  placeholder="0.01"
                  value={premium}
                  onChange={(e) => setPremium(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Premium to pay/receive for the option
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strike">Strike Price</Label>
                <Input
                  id="strike"
                  type="number"
                  placeholder="1500"
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiration">Expiration (seconds)</Label>
                <Input
                  id="expiration"
                  type="number"
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Time until option expires (e.g., 3600 = 1 hour)
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
                  onClick={handleCreateOption}
                  disabled={!createOption || createLoading || !orderHash || !premium}
                >
                  {createLoading ? 'Creating Option...' : `Create ${optionType === 'call' ? 'Call' : 'Put'} Option`}
                </Button>
              )}

              {createSuccess && (
                <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm text-green-600 dark:text-green-400">
                  Option created successfully!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exercise & Greeks Card */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exercise Option</CardTitle>
                <CardDescription>
                  Exercise an existing option before expiration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exerciseHash">Option Order Hash</Label>
                  <Input
                    id="exerciseHash"
                    placeholder="0x..."
                    value={orderHash}
                    onChange={(e) => setOrderHash(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleExerciseOption}
                  disabled={!exerciseOption || exerciseLoading || !orderHash}
                >
                  {exerciseLoading ? 'Exercising...' : 'Exercise Option'}
                </Button>

                {exerciseSuccess && (
                  <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm text-green-600 dark:text-green-400">
                    Option exercised successfully!
                  </div>
                )}

                <div className="rounded-lg bg-muted p-4 text-sm">
                  <Shield className="h-4 w-4 inline mr-2" />
                  Options can only be exercised during the 30-minute window before expiration
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Greeks Calculation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {greeksData ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delta (Δ):</span>
                      <span className="font-medium">{Number(greeksData[0]) / 1000}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gamma (Γ):</span>
                      <span className="font-medium">{Number(greeksData[1]) / 1000}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Theta (Θ):</span>
                      <span className="font-medium">{Number(greeksData[2]) / 1000}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vega (ν):</span>
                      <span className="font-medium">{Number(greeksData[3]) / 1000}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Enter an order hash to calculate Greeks
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Option Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5" />
                    <span>Limited risk with known maximum loss</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                    <span>Leverage your trading positions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Calculator className="h-4 w-4 text-primary mt-0.5" />
                    <span>Real-time Greeks for risk management</span>
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