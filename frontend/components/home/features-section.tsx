import React from 'react';
import {
    Shield,
    Zap,
    Target,
    Layers,
    Activity
} from 'lucide-react';
import { cn } from '@/util/utils';
import { GlowingEffect } from '../ui/glowing-effect';

const Features = () => {
    return (
        <section id="features" className="relative py-20 lg:py-32">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Section Header */}
                <div className="mb-16 text-center lg:mb-24">
                    <div className="mb-6 inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
                        <Zap className="mr-2 size-4" />
                        Advanced Features
                    </div>

                    <h2 className="mb-6 text-4xl font-bold text-white lg:text-6xl">
                        Cutting-Edge
                        <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            DeFi Strategies
                        </span>
                    </h2>

                    <p className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-300">
                        Revolutionary features that push the boundaries of decentralized finance,
                        combining innovative mechanisms with proven security standards.
                    </p>
                </div>

                {/* Features Grid */}

                <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
                    <GridItem
                        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
                        icon={<Shield className="size-4" />}
                        title="TWAP Engine"
                        description="Time-Weighted Average Price execution with MEV protection. Split large orders
                into smaller chunks executed over time with randomized intervals"
                    />
                    <GridItem
                        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
                        icon={<Target className="size-4" />}
                        title="Options Protocol"
                        description="Trade options on limit order execution rights. Create call and put options
                with customizable premiums and expiration times."
                    />
                    <GridItem
                        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
                        icon={<Layers className="size-4" />}
                        title="Concentrated Liquidity"
                        description="Provide liquidity within specific price ranges like Uniswap V3. Earn fees
                while your limit orders wait to be filled."
                    />
                    <GridItem
                        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
                        icon={<Activity className="size-4" />}
                        title="Volatility-Aware Sizing"
                        description="Real-time volatility analysis with dynamic position sizing and emergency pause mechanisms."
                    />
                    <GridItem
                        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
                        icon={<Zap className="size-4" />}
                        title="Cross-Strategy Composability"
                        description="Combine multiple strategies in single orders with gas-optimized batch operations."
                    />
                </ul>
            </div>
        </section>
    );
};

export default Features;


interface GridItemProps {
    area: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
    return (
        <li className={cn("min-h-56 list-none", area)}>
            <div className="border-border relative h-full rounded-[1.25rem] border-[0.75px] p-2 md:rounded-3xl md:p-3">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />
                <div className="bg-background relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] p-6 shadow-sm md:p-6 dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                        <div className="border-border bg-muted w-fit rounded-lg border-[0.75px] p-2">
                            {icon}
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-foreground text-balance pt-0.5 font-sans text-xl font-semibold leading-[1.375rem] tracking-[-0.04em] md:text-2xl md:leading-[1.875rem]">
                                {title}
                            </h3>
                            <h2 className="text-muted-foreground font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                                {description}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};