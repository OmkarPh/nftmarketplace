import { INFT } from "../pages/dash";
import axios from "axios";
import { UTILITY_SERVER_URL } from "../constants/server";
import { cep47 } from "../lib/cep47";
import { parseNFT } from "../utils/parsers";

const utilityAxios = axios.create({
  baseURL: UTILITY_SERVER_URL
});

function parseNFTsFromIDs(nftIDs: string[]){
  return Promise.all(nftIDs.map(async (nftID) => {
    const rawNFT = await cep47.getTokenMeta(nftID);
    const nftOwner = await cep47.getOwnerOf(nftID);
    return parseNFT(rawNFT, nftID, nftOwner);
  }));
}

export async function cacheNFT(id: string){
  const cacheResponse = await utilityAxios.post('/newnft', { id });
  return cacheResponse.data;
}

export async function getRecentNFTs(): Promise<INFT[]>{
  const response = await utilityAxios.get('/explore/recent');
  const recentNFTsID = response.data.recents as string[];
  console.log(recentNFTsID);

  const recentNFTs = await parseNFTsFromIDs(recentNFTsID);
  return recentNFTs;
}

export async function getFeaturedNFTs(): Promise<INFT[]>{
  const response = await utilityAxios.get('/explore/featured');
  const featuredNFTsID = response.data.recents as string[];
  console.log(featuredNFTsID);

  const featuredNFTs = await parseNFTsFromIDs(featuredNFTsID);
  return featuredNFTs;
}