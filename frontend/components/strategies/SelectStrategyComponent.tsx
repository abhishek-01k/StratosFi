import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '../ui/button';
import TwapStrategy from './twap-strategy';
import OptionsStrategy from './option-strategy';
import LiquidityStrategy from './liquidity-strategy';

const SelectStrategyComponent = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Strategy Options</CardTitle>
                <CardDescription>Choose your trading strategy</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="options">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="twap">TWAP</TabsTrigger>
                        <TabsTrigger value="options">Options</TabsTrigger>
                        <TabsTrigger value="concentrated-liquidity">
                            Concentrated Liquidity
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="twap" className="mt-4 space-y-4">
                        <TwapStrategy />
                    </TabsContent>

                    <TabsContent value="options" className="mt-4 space-y-4">
                        <OptionsStrategy />
                    </TabsContent>

                    <TabsContent
                        value="concentrated-liquidity"
                        className="mt-4 space-y-4"
                    >
                        <LiquidityStrategy />
                    </TabsContent>


                </Tabs>
            </CardContent>
        </Card>
    );
};

export default SelectStrategyComponent;