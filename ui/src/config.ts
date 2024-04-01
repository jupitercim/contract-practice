import { http, createConfig } from 'wagmi'
import { base, mainnet, bsc } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
  },
})