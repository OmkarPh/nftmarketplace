import { getDeploy } from "../utils/contract-utils";
import { CONNECTION } from "../constants/blockchain";

export async function getDeployDetails(mintDeployHash: string){
  return await getDeploy(CONNECTION.NODE_ADDRESS, mintDeployHash);
}