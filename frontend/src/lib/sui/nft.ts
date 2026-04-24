import { Transaction } from '@mysten/sui/transactions'
import { MODULE_NAME, NFT_STRUCT, PACKAGE_ID } from './config'

export type PhotoNft = {
  objectId: string
  name: string
  description: string
  imageB64: string
  owner?: string
}

// Event name thực tế on-chain (contract version đã deploy)
export const MINT_EVENT = `${PACKAGE_ID}::${MODULE_NAME}::NFTMinted`

type MoveContent = {
  fields?: {
    name?: string
    description?: string
    // Contract on-chain lưu ảnh trong field 'url'
    url?: string
  }
}

export function buildMintPhotoTx(input: {
  name: string
  description: string
  imageB64: string
}) {
  const tx = new Transaction()
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::mint_to_sender`,
    arguments: [
      tx.pure.vector('u8', Array.from(new TextEncoder().encode(input.name))),
      tx.pure.vector('u8', Array.from(new TextEncoder().encode(input.description))),
      tx.pure.vector('u8', Array.from(new TextEncoder().encode(input.imageB64))),
    ],
  })
  return tx
}

export function mapObjectToPhotoNft(objectData: {
  objectId: string
  type?: string | null
  content?: unknown
  owner?: unknown
}): PhotoNft | null {
  if (objectData.type !== NFT_STRUCT) return null
  const content = objectData.content as MoveContent | undefined
  const fields = content?.fields
  // Field ảnh on-chain là 'url' (contract version đã deploy)
  if (!fields?.name || !fields.url) return null

  return {
    objectId: objectData.objectId,
    name: fields.name,
    description: fields.description ?? '',
    imageB64: fields.url,
    owner:
      typeof objectData.owner === 'object' && objectData.owner && 'AddressOwner' in objectData.owner
        ? String(objectData.owner.AddressOwner)
        : undefined,
  }
}

export function getMintedObjectIdsFromEvents(events: Array<{ parsedJson?: Record<string, unknown> }>) {
  return events
    .map((evt) => evt.parsedJson?.object_id)
    .filter((id): id is string => typeof id === 'string')
}
