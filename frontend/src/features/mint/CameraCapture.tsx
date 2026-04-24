import { useRef, useState } from 'react'

type Props = {
  onCapture: (dataUrl: string) => void
}

export function CameraCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startCamera() {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setActive(true)
    } catch {
      setError('Không mở được camera. Hãy cấp quyền camera cho trình duyệt.')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setActive(false)
  }

  function capture() {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
    onCapture(dataUrl)
    stopCamera()
  }

  return (
    <div className="rounded-lg border border-slate-700 p-3">
      <div className="mb-3 flex gap-2">
        {!active ? (
          <button
            type="button"
            onClick={startCamera}
            className="rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-500"
          >
            Mở camera
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={capture}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Chụp ảnh
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="rounded-md bg-slate-700 px-3 py-1.5 text-sm text-white hover:bg-slate-600"
            >
              Tắt camera
            </button>
          </>
        )}
      </div>
      {error && <p className="mb-2 text-xs text-rose-400">{error}</p>}
      <video ref={videoRef} autoPlay playsInline className="w-full rounded-md bg-slate-950" />
    </div>
  )
}
