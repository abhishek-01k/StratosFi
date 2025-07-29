import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, arbitrum, polygon, optimism, base } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: '1inch Advanced Strategies',
  projectId: 'YOUR_PROJECT_ID', // Get from https://cloud.walletconnect.com
  chains: [mainnet, arbitrum, polygon, optimism, base],
  ssr: true,
})