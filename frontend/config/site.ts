export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "1.5inch",
  description:
    "Advanced trading strategies for 1inch Limit Order Protocol including TWAP, Options, and Concentrated Liquidity",
  mainNav: [
    {
      title: "Strategy",
      href: "/strategies",
    },
    {
      title: "Dashboard",
      href: "/dashboard",
    }
  ],
  links: {
    twitter: "https://twitter.com/1inch",
    github: "https://github.com/1inch",
    docs: "https://docs.1inch.io",
  },
}
