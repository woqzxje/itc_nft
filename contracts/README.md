# Contracts Integration Notes

Move package NFT cho ứng dụng đã deploy thành công trên **Sui Testnet**.

## Deployed Info (Testnet)

- Package ID: `0xbe33e888da070588adea8682a06f82394283b8a7b579c1786660066873f0b2f0`
- Module: `contracts`
- Full target cho Move call: `0xbe33e888da070588adea8682a06f82394283b8a7b579c1786660066873f0b2f0::contracts`
- UpgradeCap: `0xaae90fceb50c1cef7468973855ee2412d8b06c7c14e8e14eafdc00d14590ad79`

## NFT Model

Struct NFT đang dùng:

- `AppNFT { id, name, description, image_b64 }`

Public functions:

- `mint_to_sender(name: vector<u8>, description: vector<u8>, image_b64: vector<u8>, ctx: &mut TxContext)`
- `transfer(nft: AppNFT, recipient: address, ctx: &mut TxContext)`
- `update_description(nft: &mut AppNFT, new_description: vector<u8>, ctx: &mut TxContext)`
- `burn(nft: AppNFT, ctx: &mut TxContext)`
- Read-only helpers: `name`, `description`, `image_b64`

Event:

- `PhotoNFTMinted { object_id, creator, name }`

## Mint NFT bằng CLI

```bash
sui client call \
  --package 0xbe33e888da070588adea8682a06f82394283b8a7b579c1786660066873f0b2f0 \
  --module contracts \
  --function mint_to_sender \
  --args "My First NFT" "NFT from ITC Locket" "data:image/jpeg;base64,/9j/4AAQSk..." \
  --gas-budget 10000000
```

Lưu ý:

- 3 args của `mint_to_sender` là `vector<u8>`, CLI truyền string sẽ map đúng cho UTF-8 bytes.
- Ảnh đang lưu trực tiếp on-chain dưới dạng base64 (`image_b64`), nên cần giới hạn kích thước ảnh trước khi mint.
- NFT sẽ được mint và chuyển thẳng vào ví người gọi transaction.

## Tích hợp Frontend (TypeScript)

Ví dụ với `@mysten/sui`:

```ts
import { Transaction } from "@mysten/sui/transactions";

const PACKAGE_ID =
  "0xbe33e888da070588adea8682a06f82394283b8a7b579c1786660066873f0b2f0";

export async function mintAppNft(signAndExecute: (tx: Transaction) => Promise<unknown>) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::contracts::mint_to_sender`,
    arguments: [
      tx.pure.string("My First NFT"),
      tx.pure.string("NFT from ITC Locket"),
      tx.pure.string("data:image/jpeg;base64,/9j/4AAQSk..."),
    ],
  });

  return signAndExecute(tx);
}
```

Sau khi execute:

- Lấy `objectChanges` từ response để đọc `created` object type `::contracts::AppNFT`.
- Lưu `objectId` vào DB/app state để hiển thị collection người dùng.

## File liên quan

- Move package config: `Move.toml`
- Published metadata: `Published.toml`
- Module source: `sources/contracts.move`
