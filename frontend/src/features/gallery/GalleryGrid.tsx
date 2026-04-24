import { useCurrentClient } from '@mysten/dapp-kit-react'
import { useCallback, useEffect, useRef } from 'react'
import type { SuiObjectResponse } from '@mysten/sui/jsonRpc'
import { getMintedObjectIdsFromEvents, mapObjectToPhotoNft, MINT_EVENT } from '../../lib/sui/nft'
import { useGalleryStore } from '../../stores/galleryStore'

type Props = {
  refreshSignal: number
}

const PAGE_LIMIT = 20

function getOnChainBytes(dataUrl: string) {
  return new TextEncoder().encode(dataUrl).byteLength
}

function formatKiloBytes(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

export function GalleryGrid({ refreshSignal }: Props) {
  const client = useCurrentClient()
  const {
    items,
    loading,
    error,
    cursor,
    hasNextPage,
    setItems,
    appendItems,
    setLoading,
    setError,
    setCursor,
    setHasNextPage,
  } = useGalleryStore()

  // Dùng ref để luôn đọc được giá trị cursor mới nhất bên trong load()
  // mà không cần đưa cursor vào dependency array của useCallback
  const cursorRef = useRef<string | null>(cursor)
  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])

  const load = useCallback(
    async (reset: boolean) => {
      try {
        const rpcClient = client as unknown as {
          queryEvents: (input: {
            query: { MoveEventType: string }
            cursor: string | null
            limit: number
            order: 'descending'
          }) => Promise<{
            data: Array<{ parsedJson?: Record<string, unknown> }>
            nextCursor: string | null
            hasNextPage: boolean
          }>
          multiGetObjects: (input: {
            ids: string[]
            options: { showType: boolean; showContent: boolean; showOwner: boolean }
          }) => Promise<SuiObjectResponse[]>
        }

        setLoading(true)
        setError(null)
        const response = await rpcClient.queryEvents({
          query: { MoveEventType: MINT_EVENT },
          // Đọc cursor từ ref thay vì closure để tránh stale value
          cursor: reset ? null : cursorRef.current,
          limit: PAGE_LIMIT,
          order: 'descending',
        })

        const objectIds = getMintedObjectIdsFromEvents(response.data)
        if (objectIds.length === 0) {
          if (reset) setItems([])
          setCursor(response.nextCursor ?? null)
          setHasNextPage(response.hasNextPage)
          return
        }

        const objects = await rpcClient.multiGetObjects({
          ids: objectIds,
          options: { showType: true, showContent: true, showOwner: true },
        })
        const parsed = objects
          .map((item) => item.data)
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
          .map(mapObjectToPhotoNft)
          .filter((item): item is NonNullable<typeof item> => Boolean(item))

        if (reset) {
          setItems(parsed)
        } else {
          appendItems(parsed)
        }

        setCursor(response.nextCursor ?? null)
        setHasNextPage(response.hasNextPage)
      } catch {
        setError('Không thể tải gallery on-chain.')
      } finally {
        setLoading(false)
      }
    },
    // cursor đã được loại ra khỏi deps - đọc qua cursorRef.current thay vì closure
    [appendItems, client, setCursor, setError, setHasNextPage, setItems, setLoading],
  )

  useEffect(() => {
    void load(true)
  }, [load, refreshSignal])

  return (
    <section className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Gallery công khai</h2>
        <button
          type="button"
          onClick={() => void load(true)}
          className="rounded-md bg-slate-700 px-3 py-1.5 text-xs text-slate-100 hover:bg-slate-600"
        >
          Refresh
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-rose-400">{error}</p>}
      {loading && <p className="mb-3 text-sm text-slate-400">Đang tải dữ liệu on-chain...</p>}

      {items.length === 0 ? (
        <p className="text-sm text-slate-400">Chưa có ảnh nào được mint.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.objectId} className="overflow-hidden rounded-lg border border-slate-700 bg-slate-950/70">
              <img src={item.imageB64} alt={item.name} className="h-52 w-full object-cover" />
              <div className="grid gap-1 p-3">
                <h3 className="truncate text-sm font-semibold text-slate-100">{item.name}</h3>
                <p className="line-clamp-2 text-xs text-slate-400">{item.description || 'Không có mô tả'}</p>
                <p className="text-[11px] text-slate-400">
                  On-chain: {formatKiloBytes(getOnChainBytes(item.imageB64))} ({item.imageB64.length.toLocaleString()} ký tự)
                </p>
                <p className="truncate text-[11px] text-cyan-300">{item.owner ?? 'N/A'}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {hasNextPage && (
        <button
          type="button"
          onClick={() => void load(false)}
          className="mt-4 rounded-md bg-cyan-700 px-3 py-1.5 text-xs text-white hover:bg-cyan-600"
        >
          Tải thêm
        </button>
      )}
    </section>
  )
}
