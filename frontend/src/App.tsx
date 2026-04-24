import { useState } from 'react'
import { GalleryGrid } from './features/gallery/GalleryGrid'
import { MintPanel } from './features/mint/MintPanel'
import { WalletBar } from './features/wallet/WalletBar'

function App() {
  const [refreshSignal, setRefreshSignal] = useState(0)

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 p-4 pb-10 md:p-6">
      <WalletBar />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <MintPanel
          onMinted={async () => {
            // Đợi Sui node index event xong (thường mất 1-3 giây) trước khi refresh gallery
            await new Promise((resolve) => setTimeout(resolve, 2500))
            setRefreshSignal((value) => value + 1)
          }}
        />
        <GalleryGrid refreshSignal={refreshSignal} />
      </div>
    </main>
  )
}

export default App
