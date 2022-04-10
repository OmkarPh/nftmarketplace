import { cep47 } from "../lib/cep47";
import { CLPublicKey } from "casper-js-sdk";
import { PAYMENT_AMOUNTS } from "../constants/paymentAmounts";
import { signDeploy } from "../utils/signer";
import { CONNECTION } from "../constants/blockchain";
import { numberOfNFTsOfPubCLvalue } from "./userInfo";


export class NFTReference {
  key: string;
  value: string;
  constructor(key: string, value: string){
    this.key = key;
    this.value = value;
  }
}
export interface IMintOptions {
  url: string,
  title: string,
  about: string,
  id: Number,
  references: NFTReference[]
}
export async function mint(publicKeyCLValue: CLPublicKey, mintOptions: IMintOptions){
  const oldBalance = await numberOfNFTsOfPubCLvalue(publicKeyCLValue);
  console.log('...... No. of NFTs in your account before mint: ', oldBalance);
  
  const metas = [new Map()];
  mintOptions.references.forEach(ref => metas[0].set(ref.key, ref.value));
  metas[0].set('title', mintOptions.title);
  metas[0].set('about', mintOptions.about);
  metas[0].set('url', mintOptions.url);

  const mintDeploy = await cep47.mint(
    publicKeyCLValue,
    [String(mintOptions.id)],
    metas,
    PAYMENT_AMOUNTS.MINT_ONE_PAYMENT_AMOUNT,
    publicKeyCLValue,
  )
  console.log("Mint deploy:", mintDeploy);
  
  const signedMintDeploy = await signDeploy(mintDeploy, publicKeyCLValue);
  console.log("Signed Mint deploy:", signedMintDeploy);

  const mintDeployHash = await signedMintDeploy.send(CONNECTION.NODE_ADDRESS);
  console.log("Deploy hash", mintDeployHash);
  return mintDeployHash;
}