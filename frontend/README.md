# Sui Photo NFT Frontend

Frontend dApp cho phép:

- Kết nối ví Sui bằng dApp Kit.
- Upload ảnh hoặc chụp từ camera.
- Mint NFT lưu ảnh base64 trực tiếp on-chain.
- Xem gallery công khai của tất cả người dùng.

## Tech Stack

- React + TypeScript + Vite
- TailwindCSS
- Zustand
- `@mysten/dapp-kit-react`
- `@mysten/sui`

## Cài đặt

```bash
pnpm install
```

## Biến môi trường

Tạo file `.env` trong `frontend`:

```bash
VITE_SUI_PACKAGE_ID=0xbe33e888da070588adea8682a06f82394283b8a7b579c1786660066873f0b2f0
VITE_MAX_IMAGE_BYTES=220000
VITE_GAS_ESTIMATE_NETWORK_LABEL=Sui Testnet
VITE_GAS_ESTIMATE_BASE_MIST=1400000
VITE_GAS_ESTIMATE_PER_KB_MIST=58000
```

Nếu không set, app sẽ dùng các giá trị fallback mặc định.

- `VITE_MAX_IMAGE_BYTES`: giới hạn dữ liệu base64 on-chain cho ảnh mint.
- `VITE_GAS_ESTIMATE_NETWORK_LABEL`: nhãn network dùng trong UI (mặc định Sui Testnet).
- `VITE_GAS_ESTIMATE_BASE_MIST`: phí nền để ước tính mint.
- `VITE_GAS_ESTIMATE_PER_KB_MIST`: phí ước tính tăng thêm cho mỗi KB dữ liệu ảnh.

## Chạy local

```bash
pnpm dev
```

App mặc định dùng `testnet` (network cũng có `devnet` trong dApp provider).

## Build

```bash
pnpm build
```

## Lưu ý vận hành

- Ảnh base64 on-chain làm transaction lớn; app đang nén ảnh client-side và giới hạn dung lượng trước khi mint.
- Camera API cần quyền trình duyệt và môi trường an toàn (`localhost` hoặc HTTPS).
- Gallery đọc theo event `PhotoNFTMinted`, sau đó fetch object để render ảnh.

## Tài liệu tham khảo

- [Sui dApp Kit Docs](https://sdk.mystenlabs.com/dapp-kit)
