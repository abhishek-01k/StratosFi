"use client";

import { TOKENS_BY_CHAIN } from '@/config/tokens.config';
import { TokensData } from '@/types/tokens.types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface OptionStrategyParams {
    optionType: 'call' | 'put';
    orderHash: string;
    premium: string;
    expiration: number;
    strikePrice: string;
}

interface LiquidityStrategyParams {
    minPrice: string;
    maxPrice: string;
    feeTier: string;
    amount: string;
    currentPrice: string;
}

export type { LiquidityStrategyParams };

interface StrategiesContextType {
    tokens: TokensData[];
    fromToken: TokensData;
    toToken: TokensData;
    amount: string;
    period: "300" | "900" | "3600" | "14400" | "86400" | "604800";
    setAmount: (amount: string) => void;
    setPeriod: (period: "300" | "900" | "3600" | "14400" | "86400" | "604800") => void;
    setFromToken: (token: TokensData) => void;
    setToToken: (token: TokensData) => void;
    twapParams: {
        duration: number;
        interval: number;
        maxPriceDeviation: number;
    };
    setTwapParams: React.Dispatch<React.SetStateAction<{
        duration: number;
        interval: number;
        maxPriceDeviation: number;
    }>>;
    optionStrategyParams: OptionStrategyParams;
    setOptionStrategyParams: React.Dispatch<React.SetStateAction<OptionStrategyParams>>;
    liquidityStrategyParams: LiquidityStrategyParams;
    setLiquidityStrategyParams: React.Dispatch<React.SetStateAction<LiquidityStrategyParams>>;
}

const defaultToToken: TokensData = {
    name: "USD Coin",
    symbol: "USDC",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    logo: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png"
};

const defaultFromToken: TokensData = {
    name: "Wrapped Ether",
    symbol: "WETH",
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    logo: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png"
};

const defaultContext: StrategiesContextType = {
    tokens: [],
    fromToken: defaultFromToken,
    toToken: defaultToToken,
    amount: "",
    period: '3600',
    setAmount: () => { },
    setPeriod: () => { },
    setFromToken: () => { },
    setToToken: () => { },

    // TWAP Strategy 
    twapParams: {
        duration: 3600,
        interval: 5,
        maxPriceDeviation: 0,
    },
    setTwapParams: () => { },

    // Options Strategy
    optionStrategyParams: {
        optionType: 'call',
        orderHash: '',
        premium: '',
        expiration: 3600,
        strikePrice: '',
    },
    setOptionStrategyParams: () => { },

    // Liquidity Strategy
    liquidityStrategyParams: {
        minPrice: '',
        maxPrice: '',
        feeTier: '3000',
        amount: '',
        currentPrice: '1500',
    },
    setLiquidityStrategyParams: () => { },
};

const StrategiesContext = createContext<StrategiesContextType>(defaultContext);

export const StrategiesProvider = ({ children }: { children: ReactNode }) => {
    const { chainId } = useAccount();
    const effectiveChainId = chainId ?? 1;

    const tokens: TokensData[] = TOKENS_BY_CHAIN[effectiveChainId]

    const [fromToken, setFromToken] = useState<TokensData>(() => tokens[0]);
    const [toToken, setToToken] = useState<TokensData>(() => tokens[1]);
    const [amount, setAmount] = useState("")
    const [period, setPeriod] = useState<"300" | "900" | "3600" | "14400" | "86400" | "604800">("3600")

    const [twapParams, setTwapParams] = useState({
        duration: 3600,
        interval: 5,
        maxPriceDeviation: 0,
    })

    const [optionStrategyParams, setOptionStrategyParams] = useState<OptionStrategyParams>({
        optionType: 'call',
        orderHash: '',
        premium: '',
        expiration: 3600,
        strikePrice: '',
    });

    const [liquidityStrategyParams, setLiquidityStrategyParams] = useState<LiquidityStrategyParams>({
        minPrice: '',
        maxPrice: '',
        feeTier: '3000',
        amount: '',
        currentPrice: '1500',
    })

    useEffect(() => {
        if (tokens.length > 0) {
            setFromToken(tokens[0]);
            setToToken(tokens[1] || tokens[0]);
        }
    }, [effectiveChainId]);

    return (
        <StrategiesContext.Provider
            value={{
                tokens,
                fromToken,
                toToken,
                amount,
                period,
                setAmount,
                setPeriod,
                setFromToken,
                setToToken,
                twapParams,
                setTwapParams,
                optionStrategyParams,
                setOptionStrategyParams,
                liquidityStrategyParams,
                setLiquidityStrategyParams,
            }}
        >
            {children}
        </StrategiesContext.Provider>
    );
};

export const useStrategies = () => {
    const context = useContext(StrategiesContext);
    if (!context) {
        throw new Error('useStrategies must be used within a StrategiesProvider');
    }
    return context;
};
