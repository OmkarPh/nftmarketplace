import { useEffect, useState } from "react";
import { NFTReference } from "../api/mint";
import { getNFTDetails } from "../api/nftInfo";
import { getNFTsOwned } from "../api/userInfo";
import PromptLogin from "../components/core/PromptLogin";
import NFTList from "../components/dash/NFTList";
import { useAuth } from "../contexts/AuthContext";
import { parseNFT } from "../utils/parsers";

export interface INFT {
  title: string,
  about: string,
  url: string,
  id: string,
  references: NFTReference[]
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

      // const newNFTList = [
      //   parseNFT(await getNFTDetails("0"), "0"),
      //   parseNFT(await getNFTDetails("1"), "1"),
      //   parseNFT(await getNFTDetails("2"), "2"),
      // ];
      const newNFTList = await getNFTsOwned(entityInfo.publicKey);
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