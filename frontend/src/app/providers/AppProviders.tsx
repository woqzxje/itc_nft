import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { DAppKitProvider, createDAppKit } from '@mysten/dapp-kit-react'
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc'

type Props = {
  children: ReactNode
}

export function AppProviders({ children }: Props) {
  const dAppKit = useMemo(
    () =>
      createDAppKit({
        networks: ['testnet', 'devnet'],
        defaultNetwork: 'testnet',
        createClient: (network) =>
          new SuiJsonRpcClient({
            url: getJsonRpcFullnodeUrl(network),
            network,
          }),
      }),
    [],
  )

  return <DAppKitProvider dAppKit={dAppKit}>{children}</DAppKitProvider>
}
