// import { useContext } from "react"
// import { ThemeContext } from "styled-components"
// import { CustomThemeContext } from "../contexts/ThemeContext"

import { CircularProgress } from "@material-ui/core";
import { useEffect, useState } from "react";
import { getFeaturedNFTs, getRecentNFTs } from "../api/explorer"
import NFTList from "../components/core/NFTList";
import { INFT } from "./dash";

export default function Home() {
  // const data = useContext(CustomThemeContext)
  // console.log(data);
  // const data2 = useContext(ThemeContext)
  // console.log(data2);

  const [recentNFTs, setRecentNFTs] = useState<INFT[] | null>(null);
  const [featuredNFTs, setFeaturedNFTs] = useState<INFT[] | null>(null);

  useEffect(() => {
    setTimeout(
    (async () => {
      const fetchedRecentNFTs = await getRecentNFTs();
      setRecentNFTs(fetchedRecentNFTs);
      const fetchedFeaturedNFTs = await getFeaturedNFTs();
      setFeaturedNFTs(fetchedFeaturedNFTs);
    }), 100);
    return () => {
    }
  }, []);
  
  
  return (
    <div className="p-3">
      <br/>
      <h2>
        Trending NFTs
      </h2>
      <hr/>
      {
        featuredNFTs ?
          <NFTList nfts={featuredNFTs} /> :
          <>
            <br/><br/>
            <h4 className="text-center">
              Loading some awesome NFTs <CircularProgress className="mx-2" />
            </h4>
            <br/><br/>
          </>
      }
      <br/><br/>

      <h2>
        Recent NFTs
      </h2>
      <hr/>
        {
          recentNFTs ?
            <NFTList nfts={recentNFTs} /> :
            <>
              <br/><br/>
              <h4 className="text-center">
                Loading fresh stuff <CircularProgress className="mx-2" />
              </h4>
              <br/><br/>
            </>
        }
    </div>
  )
}