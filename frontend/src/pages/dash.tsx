import { useEffect, useState } from "react";
import { NFTReference } from "../api/mint";
import { getNFTsOwned } from "../api/userInfo";
import PromptLogin from "../components/core/PromptLogin";
import NFTList from "../components/core/NFTList";
import { useAuth } from "../contexts/AuthContext";

import SearchDoodleDark from "../images/searchDarkmode.png";
import SearchDoodleLight from "../images/searchLightmode.png";
import { useCustomTheme } from "../contexts/ThemeContext";
import { THEMES } from "../constants/THEMES";
import { Link } from "react-router-dom";

export interface INFT {
  owner: string,
  title: string,
  about: string,
  url: string,
  id: string,
  references: NFTReference[]
}


const Dash = () => {
  const { isLoggedIn, entityInfo } = useAuth();
  const { theme } = useCustomTheme();
  const [nftList, setNftList] = useState<INFT[] | null>(null);


  useEffect(() => {
    if(!entityInfo.publicKey)
      return;
      
    ((async ()=>{
      if(!entityInfo.publicKey)
        return;

      const newNFTList = await getNFTsOwned(entityInfo.publicKey);
      setNftList(newNFTList);
      console.log(newNFTList);
    })());
  }, [entityInfo]);
  
  console.log("logged in", isLoggedIn);
  
  if(!isLoggedIn)
    return <PromptLogin />

  return (
    <div className="p-4">
      {
        ! nftList ? 
        <h4>Loading ...</h4>
        : nftList.length === 0 ?
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: '90vh',
            width: '100%',
          }}>
            <img
              src={theme === THEMES.LIGHT ? SearchDoodleLight : SearchDoodleDark}
              alt="NFTs not found" />
            <h3 className="m-4">
              We couldn't find any NFTs in your account :(
              <br/><br/>
            </h3>
            <h5 style={{ lineHeight: 2 }}>
              You can buy some <Link to='/explore'>here</Link>
              <br/>
              or
              <br/>
              <Link to='/mint'>
                Mint your own NFT
              </Link>
            </h5>
        </div>
        : 
        <div className="">
          <h4>
            Your account hash: { nftList[0].owner }
          </h4>
          <h5>
            Total NFTs owned: { nftList.length }
          </h5>
          <NFTList nfts={nftList} />
        </div>
      }
    </div>
  )
}

export default Dash