import { useEffect, useState } from "react";
import { NFTReference } from "../api/mint";
import { getNFTDetails } from "../api/nftInfo";
import PromptLogin from "../components/core/PromptLogin";
import NFTList from "../components/dash/NFTList";
import { useAuth } from "../contexts/AuthContext";

export interface INFT {
  title: string,
  about: string,
  url: string,
  id: string,
  references: NFTReference[]
}

function parseNFT(rawData: Map<string, string>, id: string): INFT{
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
    references: Array.from(rawData, ([key, value]) => new NFTReference(key, value))
  }
}

const Dash = () => {
  const { isLoggedIn, entityInfo } = useAuth();
  const [nftList, setNftList] = useState<null | any>(null);

  useEffect(() => {
    if(!entityInfo.publicKey)
      return;
      
    ((async ()=>{
      if(!entityInfo.publicKey)
        return;
      // console.log(entityInfo.publicKey);
      // const usernfts = await getNFTsOwned(HexToCLPublicKey(entityInfo.publicKey));
      // console.log(usernfts);

      const newNFTList = [
        parseNFT(await getNFTDetails("0"), "0"),
        parseNFT(await getNFTDetails("1"), "1"),
        parseNFT(await getNFTDetails("2"), "2"),
      ];
      setNftList(newNFTList);
      console.log(newNFTList);
      
    })());
  
  }, [entityInfo]);
  
  console.log("logged in", isLoggedIn);
  
  if(!isLoggedIn)
    return <PromptLogin />

  return (
    <div>
      {
        ! nftList ? 
        <h4>Loading ...</h4>
        : nftList.length === 0 ?
        <h4>No nfts :( </h4>
        : <NFTList nfts={nftList} />
      }
    </div>
  )
}

export default Dash