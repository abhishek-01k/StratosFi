import Link from "next/link"
import { ArrowRight, Shield, Zap, TrendingUp, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="container py-24 sm:py-32">
        <div className="mx-auto max-w-[64rem] flex flex-col items-center text-center gap-4">
          <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            Advanced Trading Strategies for{" "}
            <span className="text-primary">1inch Protocol</span>
          </h1>
          <p className="max-w-[42rem] text-muted-foreground sm:text-xl">
            Execute sophisticated trading strategies with TWAP, Options, and Concentrated 
            Liquidity hooks. Built on top of 1inch Limit Order Protocol for maximum efficiency.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/strategies/twap">
              <Button size="lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24 sm:py-32">
        <div className="mx-auto max-w-[64rem]">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">
              Advanced Trading Strategies
            </h2>
            <p className="text-muted-foreground text-lg">
              Choose from multiple strategies to optimize your trading
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* TWAP Card */}
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">TWAP Engine</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Time-Weighted Average Price execution with MEV protection. Split large orders 
                into smaller chunks executed over time with randomized intervals.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• MEV-resistant execution</li>
                <li>• Adaptive intervals based on volatility</li>
                <li>• Price deviation protection</li>
              </ul>
              <Link href="/strategies/twap">
                <Button variant="secondary" className="w-full">
                  Configure TWAP
                </Button>
              </Link>
            </div>

            {/* Options Card */}
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Options Protocol</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Trade options on limit order execution rights. Create call and put options 
                with customizable premiums and expiration times.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• Call and put options</li>
                <li>• Greeks calculation</li>
                <li>• Collateral management</li>
              </ul>
              <Link href="/strategies/options">
                <Button variant="secondary" className="w-full">
                  Trade Options
                </Button>
              </Link>
            </div>

            {/* Liquidity Card */}
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Concentrated Liquidity</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Provide liquidity within specific price ranges like Uniswap V3. Earn fees 
                while your limit orders wait to be filled.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• Custom price ranges</li>
                <li>• Multiple fee tiers</li>
                <li>• Tick management</li>
              </ul>
              <Link href="/strategies/liquidity">
                <Button variant="secondary" className="w-full">
                  Provide Liquidity
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-24 sm:py-32 border-t">
        <div className="mx-auto max-w-[64rem]">
          <div className="grid gap-4 md:grid-cols-4 text-center">
            <div>
              <h3 className="text-3xl font-bold">~100k</h3>
              <p className="text-muted-foreground">Gas per TWAP execution</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold">0.1%</h3>
              <p className="text-muted-foreground">Protocol fee</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold">30 min</h3>
              <p className="text-muted-foreground">Option exercise window</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold">3</h3>
              <p className="text-muted-foreground">Fee tiers available</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 sm:py-32 border-t">
        <div className="mx-auto max-w-[48rem] text-center">
          <h2 className="text-3xl font-bold sm:text-4xl mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Connect your wallet and start using advanced trading strategies on 1inch Protocol
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/strategies/twap">
              <Button size="lg">
                Start Trading
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="https://docs.1inch.io" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg">
                Read Documentation
              </Button>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}