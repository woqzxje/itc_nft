import { useCurrentAccount, useCurrentNetwork } from '@mysten/dapp-kit-react'
import { ConnectButton } from '@mysten/dapp-kit-react/ui'
import { useEffect } from 'react'
import { useWalletStore } from '../../stores/walletStore'

export function WalletBar() {
  const account = useCurrentAccount()
  const network = useCurrentNetwork()
  const setAddress = useWalletStore((state) => state.setAddress)
  const setNetwork = useWalletStore((state) => state.setNetwork)

  useEffect(() => {
    setAddress(account?.address ?? null)
  }, [account?.address, setAddress])

  useEffect(() => {
    setNetwork(network)
  }, [network, setNetwork])

  return (
    <header className="flex flex-col gap-4 rounded-xl border border-slate-700/70 bg-slate-900/70 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-slate-400">Sui Photo NFT dApp</p>
        <p className="text-sm text-slate-300">
          Network: <span className="font-medium text-cyan-300">{network}</span>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {account ? `Address: ${account.address}` : 'Chưa kết nối ví'}
        </p>
      </div>
      <ConnectButton />
    </header>
  )
}
