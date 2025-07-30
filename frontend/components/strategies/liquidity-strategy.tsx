import React from 'react';
import { Input } from "@/components/ui/input"
import { Button } from '../ui/button';
import { useStrategies } from '@/context/StrategiesContext';
import type { LiquidityStrategyParams } from '@/context/StrategiesContext';
import { useWriteContract, useAccount } from 'wagmi';
import { ConcentratedLiquidityHookABI } from '@/util/contracts/abis';
import { getContractAddress } from '@/util/contracts/addresses';
import { toast } from 'sonner';
import { parseEther } from 'viem';

const FEE_TIERS = [
    { value: '500', label: '0.05%', description: 'Best for stable pairs' },
    { value: '3000', label: '0.3%', description: 'Best for most pairs' },
    { value: '10000', label: '1%', description: 'Best for exotic pairs' },
];

const LiquidityStrategy = () => {

    const { writeContract } = useWriteContract()
    const { address } = useAccount()
    const { fromToken, toToken, liquidityStrategyParams, setLiquidityStrategyParams } = useStrategies();
    const { maxPrice, minPrice, feeTier, amount, currentPrice } = liquidityStrategyParams;

    const handleChange = (field: keyof LiquidityStrategyParams, value: string) => {
        setLiquidityStrategyParams(prev => ({ ...prev, [field]: value }));
    };

    const handleCreatePosition = async () => {

        console.log("Liquidity strategy params >>", liquidityStrategyParams);
        console.log("Other params", fromToken, toToken, amount);

        if (!minPrice || !maxPrice || !feeTier || !amount || !address) {
            toast.error('Please fill in all required fields and connect wallet');
            return;
        }

        // Convert price to tick (simplified conversion - in real implementation you'd use proper tick math)
        const tickLower = Math.floor(Number(minPrice) * 100); // Simplified tick calculation
        const tickUpper = Math.floor(Number(maxPrice) * 100); // Simplified tick calculation
        const amountDesired = parseEther(amount);

        // Create a mock order hash for demo purposes
        const mockOrderHash = '0x1234567890123456789012345678901234567890123456789012345678901234' as `0x${string}`;

        writeContract({
            abi: ConcentratedLiquidityHookABI,
            address: getContractAddress(1, 'concentratedLiquidityHook'),
            functionName: 'addLiquidity',
            args: [
                mockOrderHash, // orderHash
                {
                    tickLower: tickLower, // int24
                    tickUpper: tickUpper, // int24  
                    feeTier: Number(feeTier), // uint24
                    amount0Desired: amountDesired, // uint256
                    amount1Desired: amountDesired, // uint256
                    amount0Min: amountDesired / BigInt(10), // uint256 (10% slippage)
                    amount1Min: amountDesired / BigInt(10), // uint256 (10% slippage)
                    recipient: address, // address
                    deadline: BigInt(Math.floor(Date.now() / 1000) + 3600) // uint256 (1 hour deadline)
                }
            ],
        }, {
            onSuccess: (data) => {
                console.log("Position created using Concentrated liquidity", data)
                toast('Position created successfully!')
            },
            onError: (error) => {
                console.log("Position creation failed", error)
                toast.error('Position creation failed!')
            }
        })
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">
                    Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="number"
                        placeholder="Min Price"
                        value={liquidityStrategyParams.minPrice}
                        onChange={e => handleChange('minPrice', e.target.value)}
                    />
                    <Input
                        type="number"
                        placeholder="Max Price"
                        value={liquidityStrategyParams.maxPrice}
                        onChange={e => handleChange('maxPrice', e.target.value)}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Fee Tier</label>
                <div className="grid grid-cols-3 gap-2">
                    {FEE_TIERS.map((tier) => (
                        <Button
                            key={tier.value}
                            variant={liquidityStrategyParams.feeTier === tier.value ? 'default' : 'outline'}
                            onClick={() => handleChange('feeTier', tier.value)}
                            className="flex h-auto flex-col py-2"
                        >
                            <span className="font-semibold">{tier.label}</span>
                            <span className="text-xs opacity-70">{tier.description}</span>
                        </Button>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Amount (ETH)</label>
                <Input
                    type="number"
                    placeholder="Amount"
                    value={liquidityStrategyParams.amount}
                    onChange={e => handleChange('amount', e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Current Price</label>
                <Input
                    type="number"
                    placeholder="Current Price"
                    value={liquidityStrategyParams.currentPrice}
                    onChange={e => handleChange('currentPrice', e.target.value)}
                />
            </div>
            <Button
                className="w-full"
                onClick={handleCreatePosition}
                disabled={!minPrice || !maxPrice || !feeTier || !amount}
            >
                Create Liquidity Position
            </Button>
        </div>
    );
};

export default LiquidityStrategy;