import { NFTReference } from "../api/mint";
import { INFT } from "../pages/dash";

export function parseNFT(rawData: Map<string, string>, id: string, owner: string): INFT{
  const title = rawData.get('title');
  const about = rawData.get('about');
  const url = rawData.get('url');

  rawData.delete('title');
  rawData.delete('about');
  rawData.delete('url');

  return {
    id,
    title: title || "Untitled",
    about: about || "Description not available",
    url: url || "invalid",
    owner,
    references: Array.from(rawData, ([key, value]) => new NFTReference(key, value))
  }
}