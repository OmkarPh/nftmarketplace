import { cep47 } from "../lib/cep47";
import { CLPublicKey } from "casper-js-sdk";
import { HexToCLPublicKey } from "../utils/contract-utils";

export async function numberOfNFTsOfPubCLvalue(publicKeyCLValue: CLPublicKey): Promise<number>{
  // console.log("Public key to CLPublicKey: ", publicKeyCLValue);
  // console.log("Public key to hex", publicKeyCLValue.toHex());
  // console.log("Public key to acc hash string", publicKeyCLValue.toAccountHashStr());
  // console.log("Public key to acc hash", publicKeyCLValue.toAccountHash());
  
  let num;
  try{
    num = await cep47.balanceOf(publicKeyCLValue);
  }catch(err: any){
    num = 0
    if(err.message.includes('Failed to find base key at path')){
      console.log("Account is empty yet");
    } else {
      console.log("Unexpected err when getting nft count for account", publicKeyCLValue);
    }
  }
  return num;
}
export async function numberOfNFTsOwned(publicKeyHex: string): Promise<number>{
  return await numberOfNFTsOfPubCLvalue(HexToCLPublicKey(publicKeyHex));
}
export async function getNFTsOwned(publicKeyCLValue: CLPublicKey){
  const nft1_metadata = await cep47.getTokenMeta("1");
  console.log('NFT 1 metadata: ', nft1_metadata);

  let nft1_owner = await cep47.getOwnerOf("1");
  console.log('NFT1 owner: \n', nft1_owner);  

  const nft1_index = await cep47.getIndexByToken(publicKeyCLValue, "1");
  console.log("NFT1 index:", nft1_index);

  let nft1 = await cep47.getTokenByIndex(publicKeyCLValue, nft1_index);
  console.log(`NFT token a t index ${nft1_index} is`, nft1);
}

// const indexByToken5 = await cep47.getIndexByToken(KEYS.publicKey, "5");
// console.log('...... index of token five: ', indexByToken5);

// const tokenByIndex5 = await cep47.getTokenByIndex(KEYS.publicKey, indexByToken5);
// console.log('...... token five id: ', tokenByIndex5);
