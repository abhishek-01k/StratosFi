import React from 'react';
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '../ui/button';
import { useStrategies } from '@/context/StrategiesContext';
import { Label } from '../ui/label';
import { useWriteContract  , useAccount} from 'wagmi';
import { TWAPEngineABI } from '@/util/contracts/abis';
import { getContractAddress } from '@/util/contracts/addresses';
import { toast } from 'sonner'
import { parseEther } from 'viem';

const TwapStrategy = () => {
    const { fromToken, toToken, amount, twapParams, setTwapParams } = useStrategies();
    const { writeContract } = useWriteContract()
    const { chainId } = useAccount();
    
    const handleTwapOrderCreation = async () => {
        console.log("Twap Params", twapParams);
        console.log("Other params", fromToken, toToken, amount);

        if (!amount) {
            toast.error('Please enter an amount');
            return;
        }

    
        console.log("Chain ID", chainId);

        writeContract({
            abi: TWAPEngineABI,
            address: getContractAddress(!chainId ? 1 : chainId, 'twapEngine'),
            functionName: 'configureTWAP',
            args: [
                parseEther(amount), // totalAmount
                BigInt(twapParams.interval), // intervals
                BigInt(twapParams.duration), // duration
                BigInt(twapParams.maxPriceDeviation), // maxPriceDeviation
                true // enableRandomization
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
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">
                    Total Duration
                </label>
                <Select onValueChange={(value) => {
                    let durationSeconds = 600; // default 10min
                    switch (value) {
                        case '10m':
                            durationSeconds = 600;
                            break;
                        case '1h':
                            durationSeconds = 3600;
                            break;
                        case '1d':
                            durationSeconds = 86400;
                            break;
                        case '3d':
                            durationSeconds = 259200;
                            break;
                        case '7d':
                            durationSeconds = 604800;
                            break;
                        default:
                            durationSeconds = 600;
                    }
                    setTwapParams((prev) => ({ ...prev, duration: durationSeconds }));
                }}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10m">10 Minutes</SelectItem>
                        <SelectItem value="1h">1 Hour</SelectItem>
                        <SelectItem value="1d">1 Day</SelectItem>
                        <SelectItem value="3d">3 Days</SelectItem>
                        <SelectItem value="7d">7 Days</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    Total time to execute the order (e.g., 3600 = 1 hour)
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="intervals">Number of Intervals</Label>
                <Input
                    id="intervals"
                    type="number"
                    placeholder="5"
                    className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    value={twapParams.interval === 0 ? '' : twapParams.interval}
                    onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' ? 0 : Number(value);
                        setTwapParams(prev => ({ ...prev, interval: numValue }));
                    }}
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
                    placeholder="5%"
                    className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    value={twapParams.maxPriceDeviation === 0 ? '' : twapParams.maxPriceDeviation}
                    onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' ? 0 : Number(value);
                        setTwapParams(prev => ({ ...prev, maxPriceDeviation: numValue }));
                    }}
                />
                <p className="text-xs text-muted-foreground">
                    Maximum allowed price change in %
                </p>
            </div>

            <Button className="w-full" onClick={handleTwapOrderCreation}>Start TWAP Order</Button>
        </div>
    );
};

export default TwapStrategy;