import { create } from 'zustand'

type WalletState = {
  address: string | null
  network: string
  setAddress: (address: string | null) => void
  setNetwork: (network: string) => void
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  network: 'testnet',
  setAddress: (address) => set({ address }),
  setNetwork: (network) => set({ network }),
}))
