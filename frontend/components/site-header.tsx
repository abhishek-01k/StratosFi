"use client"
import { siteConfig } from "@/config/site"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { Button } from "./ui/button"
import { usePathname, useRouter } from "next/navigation"

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const isHomePage = pathname === "/";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <ThemeToggle />
            {isHomePage ? (
              <Button onClick={() => router.push("/strategies")}>Get Started</Button>
            ) : (
              <WalletConnectButton />
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
