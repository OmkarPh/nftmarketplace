import { CLPublicKey } from "casper-js-sdk";

import { cep47 } from "../lib/cep47";
import { INFT } from "../pages/dash";
import { HexToCLPublicKey } from "../utils/contract-utils";
import { parseNFT } from "../utils/parsers";


export async function numberOfNFTsOfPubCLvalue(publicKeyCLValue: CLPublicKey): Promise<number>{
  let num;
  try{
    num = await cep47.balanceOf(publicKeyCLValue);
  }catch(err: any){
    num = 0
    if(err.message.includes('Failed to find base key at path')){
      console.log("Account is empty yet");
    } else {
      console.log(num);
      console.log("Unexpected err when getting nft count for account", publicKeyCLValue);
    }
  }
  return num;
}

export async function numberOfNFTsOfAccHash(accHash: string): Promise<number>{
  let num;
  try{
    num = await cep47.balanceOfAccHash(accHash);
  }catch(err: any){
    num = 0
    if(err.message.includes('Failed to find base key at path')){
      console.log("Account is empty yet");
    } else {
      console.log(num);
      console.log("Unexpected err when getting nft count for account", accHash);
    }
  }
  return num;
}
export async function numberOfNFTsOwned(publicKeyHex: string): Promise<number>{
  return await numberOfNFTsOfPubCLvalue(HexToCLPublicKey(publicKeyHex));
}

export async function getNFTsOwnedByAccHash(accHash: string): Promise<INFT[]>{
  const numOfNFTs = await numberOfNFTsOfAccHash(accHash);
  const nfts: INFT[] = [];
  for(let idx=0; idx<numOfNFTs; idx++){
    // const nftID = await cep47.getTokenByIndex(publicKeyCLValue, String(idx));
    // const rawNFT = await cep47.getTokenMeta(nftID);
    // nfts.push(parseNFT(rawNFT, nftID));
  }
  return nfts;
}
export async function getNFTsOwned(publicKeyHex: string): Promise<INFT[]>{
  const publicKeyCLValue = HexToCLPublicKey(publicKeyHex);
  const numOfNFTs = await numberOfNFTsOfPubCLvalue(publicKeyCLValue);
  const nfts: INFT[] = [];
  for(let idx=0; idx<numOfNFTs; idx++){
    const nftID = await cep47.getTokenByIndex(publicKeyCLValue, String(idx));
    const rawNFT = await cep47.getTokenMeta(nftID);
    nfts.push(parseNFT(rawNFT, nftID));
  }
  return nfts;
}

export async function temp(publicKeyCLValue: CLPublicKey){
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
