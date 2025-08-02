import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, arbitrum, polygon, optimism, base } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'StratosFi',
  projectId: '0f869a1f7240141b3408d5d1fe42545a', // Get from https://cloud.walletconnect.com
  chains: [mainnet, arbitrum, polygon, optimism, base],
  ssr: true,
})