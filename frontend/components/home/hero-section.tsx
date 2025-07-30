"use client";

import { cn } from "@/lib/utils";
import { GlowingEffect } from "../ui/glowing-effect";
import CandleStickAnimation from "./candlestick-animation";
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const HeroSection = () => {
    const router = useRouter();
    return (
        <section className="relative flex min-h-screen items-center overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                    {/* Content - Left Side */}
                    <div className="animate-fade-in-up space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
                                <Zap className="mr-2 size-4" />
                                Industry First: Options on Execution Rights
                            </div>

                            <h1 className="text-4xl font-bold leading-tight text-white lg:text-6xl xl:text-7xl">
                                Advanced
                                <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                    DeFi Strategies
                                </span>
                                <span className="block text-3xl font-normal text-slate-300 lg:text-5xl xl:text-6xl">
                                    Beyond Limits
                                </span>
                            </h1>

                            <p className="max-w-2xl text-xl leading-relaxed text-slate-300 lg:text-2xl">
                                Extending 1inch Limit Order Protocol with cutting-edge strategies including
                                <span className="font-semibold text-blue-400"> options on execution rights</span>,
                                <span className="font-semibold text-green-400"> concentrated liquidity hooks</span>,
                                and <span className="font-semibold text-purple-400">MEV-protected TWAP</span>.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <Button
                                onClick={() => router.push('/strategies')}
                                size="lg"
                                className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:shadow-blue-500/25"
                            >
                                Launch Protocol
                                <ArrowRight className="ml-2 size-5 transition-transform duration-300 group-hover:translate-x-1" />
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="border-slate-600 text-slate-300 transition-all duration-300 hover:border-slate-500 hover:bg-slate-800/50 hover:text-white"
                            >
                                View Documentation
                            </Button>
                        </div>
                    </div>

                    <div className="relative flex justify-center lg:justify-end">
                        <CandleStickAnimation />
                    </div>
                </div>
            </div>
        </section>
    );
}

export { HeroSection };
