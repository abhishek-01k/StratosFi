import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from '../ui/button';
import { Label } from '@/components/ui/label';
import { useStrategies } from '@/context/StrategiesContext';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useWriteContract, useReadContract } from 'wagmi';
import { OptionsProtocolABI } from '@/util/contracts/abis';
import { getContractAddress } from '@/util/contracts/addresses';
import { toast } from 'sonner';
import { parseEther } from 'viem'

const OptionsStrategy = () => {
    const { fromToken, toToken, amount, optionStrategyParams, setOptionStrategyParams } = useStrategies();
    const { optionType, orderHash, premium, expiration, strikePrice } = optionStrategyParams;

    const { writeContract } = useWriteContract()
    const { data: greeksData, isLoading: loadingGreeksData } = useReadContract({
        abi: OptionsProtocolABI,
        functionName: "calculateGreeks",
        args: orderHash ? [orderHash as `0x${string}`] : undefined
    })

    const handleCreateOption = async () => {
        console.log("Options Params", optionStrategyParams);
        console.log("Other params", fromToken, toToken, amount);

        writeContract({
            abi: OptionsProtocolABI,
            address: getContractAddress(1, 'optionsProtocol'),
            functionName: 'createOption',
            args: [
                orderHash as `0x${string}`,
                optionType === 'call' ? 0 : 1,
                parseEther(premium),
                BigInt(Math.floor(Date.now() / 1000) + Number(expiration)),
            ],
            value: parseEther(premium),
        }, {
            onSuccess: (data) => {
                console.log("Option Created", data)
                toast('Option Created successfully!')
            },
            onError: (error) => {
                console.log("Option Creation failed", error)
                toast.error('TWAP order creation failed!')
            }
        })
    }

    const handleExerciseData = async () => {
        console.log("Options Params", optionStrategyParams);
        console.log("Other params", fromToken, toToken, amount);

        writeContract({
            abi: OptionsProtocolABI,
            address: getContractAddress(1, 'optionsProtocol'),
            functionName: 'exerciseOption',
            args: [
                orderHash as `0x${string}`,
            ],
        }, {
            onSuccess: (data) => {
                console.log("Exercise Data in options called", data)
                toast('Exercise data func returned success!')
            },
            onError: (error) => {
                console.log("Exercise Data fetching failed", error)
                toast.error('Exercise data failed!')
            }
        })
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Option Type</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant={optionType === 'call' ? 'default' : 'outline'}
                        onClick={() => setOptionStrategyParams(prev => ({ ...prev, optionType: 'call' }))}
                        className="w-full"
                    >
                        <TrendingUp className="mr-2 size-4" />
                        Call Option
                    </Button>
                    <Button
                        variant={optionType === 'put' ? 'default' : 'outline'}
                        onClick={() => setOptionStrategyParams(prev => ({ ...prev, optionType: 'put' }))}
                        className="w-full"
                    >
                        <TrendingDown className="mr-2 size-4" />
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
                    onChange={(e) => setOptionStrategyParams(prev => ({ ...prev, orderHash: e.target.value }))}
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
                    onChange={(e) => setOptionStrategyParams(prev => ({ ...prev, premium: e.target.value }))}
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
                    onChange={(e) => setOptionStrategyParams(prev => ({ ...prev, strikePrice: e.target.value }))}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="expiration">Expiration (seconds)</Label>
                <Input
                    id="expiration"
                    type="number"
                    value={expiration}
                    onChange={(e) => setOptionStrategyParams(prev => ({ ...prev, expiration: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">
                    Time until option expires (e.g., 3600 = 1 hour)
                </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Button
                    className="w-full"
                    onClick={handleCreateOption}
                >
                    {`Create ${optionType === 'call' ? 'Call' : 'Put'} Option`}
                </Button>
            </div>

            <Button
                variant="outline"
                className="w-full"
                onClick={handleExerciseData}
            >
                Exercise Option
            </Button>
        </div>
    );
};

export default OptionsStrategy;