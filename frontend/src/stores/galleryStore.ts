import { create } from 'zustand'
import type { PhotoNft } from '../lib/sui/nft'

type GalleryState = {
  items: PhotoNft[]
  loading: boolean
  error: string | null
  cursor: string | null
  hasNextPage: boolean
  setItems: (items: PhotoNft[]) => void
  appendItems: (items: PhotoNft[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCursor: (cursor: string | null) => void
  setHasNextPage: (hasNextPage: boolean) => void
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  cursor: null,
  hasNextPage: false,
  setItems: (items) => set({ items }),
  appendItems: (items) => {
    const previous = get().items
    const map = new Map(previous.map((item) => [item.objectId, item]))
    items.forEach((item) => map.set(item.objectId, item))
    set({ items: [...map.values()] })
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCursor: (cursor) => set({ cursor }),
  setHasNextPage: (hasNextPage) => set({ hasNextPage }),
}))
