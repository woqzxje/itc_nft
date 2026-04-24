import { create } from 'zustand'

type MintState = {
  name: string
  description: string
  imageB64: string | null
  minting: boolean
  lastDigest: string | null
  error: string | null
  setName: (value: string) => void
  setDescription: (value: string) => void
  setImageB64: (value: string | null) => void
  setMinting: (value: boolean) => void
  setLastDigest: (value: string | null) => void
  setError: (value: string | null) => void
  reset: () => void
}

const initial = {
  name: '',
  description: '',
  imageB64: null,
  minting: false,
  lastDigest: null,
  error: null,
}

export const useMintStore = create<MintState>((set) => ({
  ...initial,
  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),
  setImageB64: (imageB64) => set({ imageB64 }),
  setMinting: (minting) => set({ minting }),
  setLastDigest: (lastDigest) => set({ lastDigest }),
  setError: (error) => set({ error }),
  reset: () => set(initial),
}))
