import { http, createConfig } from 'wagmi'
import { base, mainnet, bsc, goerli } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, base, goerli],
  connectors: [
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [goerli.id]: http(),
  },
})