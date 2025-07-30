'use client'

import { useState } from 'react'
import { 
  useAccount, 
  useWriteContract, 
  useReadContract, 
  useWaitForTransactionReceipt,
  useChainId 
} from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { polygon } from 'wagmi/chains'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OptionsProtocolABI } from '@/util/contracts/abis'
import { POLYGON_CONTRACTS } from '@/lib/contracts/polygon-addresses'
import { 
  AlertCircle, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  DollarSign,
  Loader2 
} from 'lucide-react'
import { toast } from 'sonner'

type OptionType = 'call' | 'put'

export default function OptionsStrategyPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [optionType, setOptionType] = useState<OptionType>('call')
  const [orderHash, setOrderHash] = useState('')
  const [premium, setPremium] = useState('')
  const [expiration, setExpiration] = useState('3600') // 1 hour default
  const [strikePrice, setStrikePrice] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [optionId, setOptionId] = useState('')

  const isPolygon = chainId === polygon.id

  // Create Call Option
  const { 
    data: createCallHash,
    writeContract: createCallOption,
    isPending: isCreatingCall 
  } = useWriteContract()

  // Create Put Option
  const { 
    data: createPutHash,
    writeContract: createPutOption,
    isPending: isCreatingPut 
  } = useWriteContract()

  // Exercise Option
  const {
    data: exerciseHash,
    writeContract: exerciseOption,
    isPending: isExercising
  } = useWriteContract()

  // Deposit Collateral
  const {
    data: depositHash,
    writeContract: depositCollateral,
    isPending: isDepositing
  } = useWriteContract()

  // Wait for transaction confirmations
  const { isLoading: isCreateConfirming, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({
    hash: createCallHash || createPutHash,
  })

  const { isLoading: isExerciseConfirming, isSuccess: isExerciseSuccess } = useWaitForTransactionReceipt({
    hash: exerciseHash,
  })

  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositHash,
  })

  // Read Option Greeks
  const { data: optionGreeks } = useReadContract({
    address: POLYGON_CONTRACTS.contracts.optionsProtocol,
    abi: OptionsProtocolABI,
    functionName: 'getOptionGreeks',
    args: optionId ? [optionId as `0x${string}`] : undefined,
    chainId: polygon.id,
    query: {
      enabled: !!optionId && isPolygon,
    }
  })

  // Read Collateral Balance
  const { data: collateralBalance } = useReadContract({
    address: POLYGON_CONTRACTS.contracts.optionsProtocol,
    abi: OptionsProtocolABI,
    functionName: 'collateralBalances',
    args: address ? [address] : undefined,
    chainId: polygon.id,
    query: {
      enabled: !!address && isPolygon,
    }
  })

  const handleCreateOption = async () => {
    if (!isPolygon) {
      toast.error('Please switch to Polygon network')
      return
    }

    if (!orderHash || !premium || !strikePrice) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const premiumWei = parseEther(premium)
      const strikePriceWei = parseEther(strikePrice)
      const expirationTime = BigInt(Math.floor(Date.now() / 1000) + Number(expiration))

      if (optionType === 'call') {
        createCallOption({
          address: POLYGON_CONTRACTS.contracts.optionsProtocol,
          abi: OptionsProtocolABI,
          functionName: 'createCallOption',
          args: [
            orderHash as `0x${string}`,
            strikePriceWei,
            expirationTime,
            premiumWei
          ],
          value: premiumWei,
          chainId: polygon.id,
        }, {
          onSuccess: (hash) => {
            toast.success('Call option creation transaction submitted')
          },
          onError: (error) => {
            console.error('Create call option failed:', error)
            toast.error(error.message || 'Failed to create call option')
          }
        })
      } else {
        createPutOption({
          address: POLYGON_CONTRACTS.contracts.optionsProtocol,
          abi: OptionsProtocolABI,
          functionName: 'createPutOption',
          args: [
            orderHash as `0x${string}`,
            strikePriceWei,
            expirationTime,
            premiumWei
          ],
          value: premiumWei,
          chainId: polygon.id,
        }, {
          onSuccess: (hash) => {
            toast.success('Put option creation transaction submitted')
          },
          onError: (error) => {
            console.error('Create put option failed:', error)
            toast.error(error.message || 'Failed to create put option')
          }
        })
      }
    } catch (error) {
      console.error('Error creating option:', error)
      toast.error('Failed to prepare option creation')
    }
  }

  const handleExerciseOption = async () => {
    if (!optionId) {
      toast.error('Please enter an option ID')
      return
    }

    exerciseOption({
      address: POLYGON_CONTRACTS.contracts.optionsProtocol,
      abi: OptionsProtocolABI,
      functionName: 'exerciseOption',
      args: [optionId as `0x${string}`],
      chainId: polygon.id,
    }, {
      onSuccess: () => {
        toast.success('Option exercise transaction submitted')
      },
      onError: (error) => {
        console.error('Exercise option failed:', error)
        toast.error(error.message || 'Failed to exercise option')
      }
    })
  }

  const handleDepositCollateral = async () => {
    if (!depositAmount) {
      toast.error('Please enter a deposit amount')
      return
    }

    const amountWei = parseEther(depositAmount)

    depositCollateral({
      address: POLYGON_CONTRACTS.contracts.optionsProtocol,
      abi: OptionsProtocolABI,
      functionName: 'depositCollateral',
      value: amountWei,
      chainId: polygon.id,
    }, {
      onSuccess: () => {
        toast.success('Collateral deposit transaction submitted')
        setDepositAmount('')
      },
      onError: (error) => {
        console.error('Deposit collateral failed:', error)
        toast.error(error.message || 'Failed to deposit collateral')
      }
    })
  }

  const isLoading = isCreatingCall || isCreatingPut || isCreateConfirming

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Options Protocol</h1>
          <p className="text-muted-foreground">
            Trade options on limit order execution rights on Polygon
          </p>
          {!isPolygon && (
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4 text-sm">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Please switch to Polygon network to use this feature
            </div>
          )}
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Options</TabsTrigger>
            <TabsTrigger value="exercise">Exercise & Greeks</TabsTrigger>
            <TabsTrigger value="collateral">Collateral</TabsTrigger>
          </TabsList>

          {/* Create Options Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Create Option</CardTitle>
                  <CardDescription>
                    Create a new call or put option on a limit order
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
                    <Label htmlFor="premium">Premium (MATIC)</Label>
                    <Input
                      id="premium"
                      type="number"
                      placeholder="0.01"
                      value={premium}
                      onChange={(e) => setPremium(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Premium to pay for the option
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="strike">Strike Price (MATIC)</Label>
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
                      disabled={!orderHash || !premium || !strikePrice || isLoading || !isPolygon}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isCreatingCall || isCreatingPut ? 'Creating...' : 'Confirming...'}
                        </>
                      ) : (
                        `Create ${optionType === 'call' ? 'Call' : 'Put'} Option`
                      )}
                    </Button>
                  )}

                  {isCreateSuccess && (
                    <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 text-sm text-green-600 dark:text-green-400">
                      Option created successfully!
                    </div>
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
          </TabsContent>

          {/* Exercise & Greeks Tab */}
          <TabsContent value="exercise" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Exercise Option</CardTitle>
                  <CardDescription>
                    Exercise an existing option before expiration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="optionId">Option ID</Label>
                    <Input
                      id="optionId"
                      placeholder="0x..."
                      value={optionId}
                      onChange={(e) => setOptionId(e.target.value)}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleExerciseOption}
                    disabled={!optionId || isExercising || isExerciseConfirming}
                  >
                    {isExercising || isExerciseConfirming ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isExercising ? 'Exercising...' : 'Confirming...'}
                      </>
                    ) : (
                      'Exercise Option'
                    )}
                  </Button>

                  {isExerciseSuccess && (
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

              {optionGreeks && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Greeks Calculation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delta (Δ):</span>
                        <span className="font-medium font-mono">
                          {(Number(optionGreeks.delta) / 1000).toFixed(3)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gamma (Γ):</span>
                        <span className="font-medium font-mono">
                          {(Number(optionGreeks.gamma) / 1000).toFixed(3)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Theta (Θ):</span>
                        <span className="font-medium font-mono">
                          {(Number(optionGreeks.theta) / 1000).toFixed(3)}
                        </span>
                      </div>
                                             <div className="flex justify-between">
                         <span className="text-muted-foreground">Vega (ν):</span>
                         <span className="font-medium font-mono">
                           {(Number(optionGreeks.vega) / 1000).toFixed(3)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Intrinsic Value:</span>
                         <span className="font-medium font-mono">
                           {(Number(optionGreeks.intrinsicValue) / 1e18).toFixed(6)}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-muted-foreground">Time Value:</span>
                         <span className="font-medium font-mono">
                           {(Number(optionGreeks.timeValue) / 1e18).toFixed(6)}
                         </span>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Collateral Management Tab */}
          <TabsContent value="collateral" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Collateral Management</CardTitle>
                  <CardDescription>
                    Deposit or withdraw collateral for options trading
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Collateral:</span>
                      <span className="text-xl font-bold">
                        {collateralBalance ? formatEther(collateralBalance) : '0'} MATIC
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depositAmount">Deposit Amount (MATIC)</Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      placeholder="0.0"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleDepositCollateral}
                    disabled={!depositAmount || isDepositing || !isPolygon}
                  >
                    {isDepositing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Depositing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Deposit Collateral
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Collateral Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-primary mt-0.5" />
                      <span>Collateral is required to write options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-primary mt-0.5" />
                      <span>Minimum collateral: 150% of option value</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                      <span>Collateral is locked until option expiration</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}