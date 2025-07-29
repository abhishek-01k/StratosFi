import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useStrategies } from '@/context/StrategiesContext';
import { Input } from '../ui/input';
import TokenSelector from './token-selector';

const TokenPairComponent = () => {
    const {
        tokens,
        fromToken,
        toToken,
        setFromToken,
        setToToken,
        period,
        amount,
        setAmount,
    } = useStrategies()
    return (
        <Card>
            <CardHeader>
                <CardTitle>Token Pair</CardTitle>
                <CardDescription>
                    Select the tokens you want to trade
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <TokenSelector
                    tokens={tokens}
                    selectedToken={fromToken}
                    onChange={setFromToken}
                    label="From Token"
                />
                <TokenSelector
                    tokens={tokens}
                    selectedToken={toToken}
                    onChange={setToToken}
                    label="To Token"
                />
                <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <Input
                        type="number"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default TokenPairComponent;