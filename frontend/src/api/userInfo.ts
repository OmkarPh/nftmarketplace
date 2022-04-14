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
    const nftID = await cep47.getTokenByIndexNAccHash(accHash, String(idx));
    const rawNFT = await cep47.getTokenMeta(nftID);
    nfts.push(parseNFT(rawNFT, nftID));
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