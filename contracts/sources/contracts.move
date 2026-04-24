module contracts::contracts;

use std::string::{Self, String};
use sui::event;

/// NFT cho ứng dụng.
public struct AppNFT has key, store {
    id: UID,
    /// Ten NFT
    name: String,
    /// Mo ta NFT
    description: String,
    /// Anh base64 luu truc tiep on-chain
    image_b64: String,
}

/// Event phat ra khi mint NFT thanh cong.
public struct PhotoNFTMinted has copy, drop {
    object_id: ID,
    creator: address,
    name: String,
}

/// Lay ten NFT.
public fun name(nft: &AppNFT): &String {
    &nft.name
}

/// Lay mo ta NFT.
public fun description(nft: &AppNFT): &String {
    &nft.description
}

/// Lay anh base64.
public fun image_b64(nft: &AppNFT): &String {
    &nft.image_b64
}

/// Mint NFT moi cho nguoi goi ham.
public fun mint_to_sender(
    name: vector<u8>,
    description: vector<u8>,
    image_b64: vector<u8>,
    ctx: &mut TxContext,
) {
    let sender = tx_context::sender(ctx);
    let nft = AppNFT {
        id: object::new(ctx),
        name: string::utf8(name),
        description: string::utf8(description),
        image_b64: string::utf8(image_b64),
    };

    event::emit(PhotoNFTMinted {
        object_id: object::id(&nft),
        creator: sender,
        name: nft.name,
    });

    transfer::public_transfer(nft, sender);
}

/// Chuyen NFT den dia chi `recipient`.
public fun transfer(nft: AppNFT, recipient: address, _: &mut TxContext) {
    transfer::public_transfer(nft, recipient)
}

/// Cap nhat mo ta cho NFT.
public fun update_description(nft: &mut AppNFT, new_description: vector<u8>, _: &mut TxContext) {
    nft.description = string::utf8(new_description)
}

/// Burn NFT vinh vien.
public fun burn(nft: AppNFT, _: &mut TxContext) {
    let AppNFT {
        id,
        name: _,
        description: _,
        image_b64: _,
    } = nft;
    object::delete(id);
}

