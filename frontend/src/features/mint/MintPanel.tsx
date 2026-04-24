import { useCurrentAccount, useDAppKit } from '@mysten/dapp-kit-react'
import { useMemo } from 'react'
import type { ChangeEvent } from 'react'
import {
  GAS_ESTIMATE_BASE_MIST,
  GAS_ESTIMATE_NETWORK_LABEL,
  GAS_ESTIMATE_PER_KB_MIST,
  MAX_IMAGE_BYTES,
} from '../../lib/sui/config'
import { buildMintPhotoTx } from '../../lib/sui/nft'
import { useMintStore } from '../../stores/mintStore'
import { CameraCapture } from './CameraCapture'

type Props = {
  onMinted: () => Promise<void>
}

async function fileToDataUrl(file: File) {
  const reader = new FileReader()
  const url = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Không thể đọc file ảnh'))
    reader.readAsDataURL(file)
  })
  return url
}

async function compressDataUrl(dataUrl: string) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Không thể decode ảnh'))
    img.src = dataUrl
  })

  const maxWidth = 900
  const ratio = Math.min(1, maxWidth / image.width)
  const width = Math.round(image.width * ratio)
  const height = Math.round(image.height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Không tạo được canvas context')
  context.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', 0.8)
}

function getDataUrlBytes(dataUrl: string) {
  return new TextEncoder().encode(dataUrl).byteLength
}

function formatKiloBytes(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

function estimateMintGasMist(bytes: number) {
  return Math.round(GAS_ESTIMATE_BASE_MIST + (bytes / 1024) * GAS_ESTIMATE_PER_KB_MIST)
}

function formatMist(mist: number) {
  return mist.toLocaleString()
}

export function MintPanel({ onMinted }: Props) {
  const account = useCurrentAccount()
  const dAppKit = useDAppKit()
  const {
    name,
    description,
    imageB64,
    minting,
    lastDigest,
    error,
    setName,
    setDescription,
    setImageB64,
    setMinting,
    setLastDigest,
    setError,
  } = useMintStore()

  const sizeBytes = useMemo(() => (imageB64 ? getDataUrlBytes(imageB64) : 0), [imageB64])
  const base64Length = imageB64?.length ?? 0
  const estimatedGasMist = useMemo(() => (imageB64 ? estimateMintGasMist(sizeBytes) : 0), [imageB64, sizeBytes])
  const estimatedGasDeltaMist = useMemo(
    () => Math.round((sizeBytes / 1024) * GAS_ESTIMATE_PER_KB_MIST),
    [sizeBytes],
  )

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setError(null)
    const original = await fileToDataUrl(file)
    const compressed = await compressDataUrl(original)
    const bytes = getDataUrlBytes(compressed)
    if (bytes > MAX_IMAGE_BYTES) {
      setError(`Ảnh sau nén vẫn lớn (${Math.round(bytes / 1024)}KB). Hãy dùng ảnh nhỏ hơn.`)
      return
    }
    setImageB64(compressed)
  }

  async function handleMint() {
    if (!account) {
      setError('Vui lòng kết nối ví trước khi mint.')
      return
    }
    if (!imageB64) {
      setError('Vui lòng chọn ảnh hoặc chụp ảnh trước khi mint.')
      return
    }
    if (!name.trim()) {
      setError('Vui lòng nhập tên NFT.')
      return
    }

    try {
      setError(null)
      setMinting(true)
      const tx = buildMintPhotoTx({
        name: name.trim(),
        description: description.trim(),
        imageB64,
      })
      const result = await dAppKit.signAndExecuteTransaction({
        transaction: tx,
      })
      const digest =
        (result as { digest?: string }).digest ??
        (result as { Transaction?: { digest?: string } }).Transaction?.digest ??
        null
      setLastDigest(digest)
      await onMinted()
    } catch {
      setError('Mint thất bại. Hãy kiểm tra ví/network rồi thử lại.')
    } finally {
      setMinting(false)
    }
  }

  return (
    <section className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-100">Mint ảnh thành NFT</h2>
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm text-slate-300">
          Tên NFT
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
            placeholder="Ví dụ: Hoàng hôn Đà Nẵng"
          />
        </label>
        <label className="grid gap-1 text-sm text-slate-300">
          Mô tả
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-20 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
            placeholder="Mô tả ảnh..."
          />
        </label>

        <label className="grid gap-1 text-sm text-slate-300">
          Upload ảnh
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
          />
        </label>

        <CameraCapture onCapture={setImageB64} />

        {imageB64 && (
          <div className="rounded-lg border border-slate-700 p-3">
            <div className="mb-2 grid gap-1 text-xs text-slate-400">
              <p>
                Kích thước on-chain: {formatKiloBytes(sizeBytes)} / {formatKiloBytes(MAX_IMAGE_BYTES)}
              </p>
              <p>Độ dài chuỗi base64: {base64Length.toLocaleString()} ký tự</p>
              <p>
                Ước tính phí mint ({GAS_ESTIMATE_NETWORK_LABEL}): ~{formatMist(estimatedGasMist)} MIST
              </p>
              <p>Tăng thêm do dung lượng ảnh: +~{formatMist(estimatedGasDeltaMist)} MIST</p>
            </div>
            <img src={imageB64} alt="preview" className="max-h-72 w-full rounded-md object-cover" />
          </div>
        )}

        {error && <p className="text-sm text-rose-400">{error}</p>}
        {lastDigest && (
          <p className="break-all text-xs text-emerald-300">
            Mint thành công. Tx Digest: {lastDigest}
          </p>
        )}

        <button
          type="button"
          disabled={minting}
          onClick={handleMint}
          className="rounded-md bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {minting ? 'Đang mint...' : 'Mint NFT'}
        </button>
      </div>
    </section>
  )
}
