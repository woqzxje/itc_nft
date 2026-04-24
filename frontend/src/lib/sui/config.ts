export const PACKAGE_ID =
  import.meta.env.VITE_SUI_PACKAGE_ID ??
  '0xbe33e888da070588adea8682a06f82394283b8a7b579c1786660066873f0b2f0'

export const MODULE_NAME = 'contracts'
export const NFT_STRUCT = `${PACKAGE_ID}::${MODULE_NAME}::AppNFT`
// MINT_EVENT được định nghĩa trong nft.ts với tên đúng on-chain: NFTMinted

export const MAX_IMAGE_BYTES = Number(import.meta.env.VITE_MAX_IMAGE_BYTES ?? 220_000)

export const GAS_ESTIMATE_NETWORK_LABEL = import.meta.env.VITE_GAS_ESTIMATE_NETWORK_LABEL ?? 'Sui Testnet'

// Sui Testnet profile (co the tinh chinh lai bang so lieu transaction thuc te cua ban).
export const GAS_ESTIMATE_BASE_MIST = Number(import.meta.env.VITE_GAS_ESTIMATE_BASE_MIST ?? 1_400_000)
export const GAS_ESTIMATE_PER_KB_MIST = Number(import.meta.env.VITE_GAS_ESTIMATE_PER_KB_MIST ?? 58_000)
