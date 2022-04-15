import { CircularProgress } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getNFTsOwnedByAccHash } from "../api/userInfo";
import { THEMES } from "../constants/THEMES";
import { useCustomTheme } from "../contexts/ThemeContext";
import { INFT } from "./dash";

import SearchDoodleDark from "../images/searchDarkmode.png";
import SearchDoodleLight from "../images/searchLightmode.png";
import NFTList from "../components/core/NFTList";

const Profile = () => {
  const { theme } = useCustomTheme();
  const { acchash } = useParams<{acchash: string}>();
  const [nfts, setNfts] = useState<INFT[] | null | "fetching">('fetching');

  useEffect(()=>{
    if(!acchash)
      return;
      
    setTimeout(()=>{
      console.log("acc hash:", acchash);
      getNFTsOwnedByAccHash(acchash)
        .then(nfts => {
          console.log(`NFTs owned by profile ${acchash}:`, nfts);
          setNfts(nfts)
        })
        .catch(err => {
          console.log(`Err fetching nfts of acchash`, err);
          setNfts(null);
        })
    }, 200);
  }, [acchash]);
  
  return (
    <div className="p-4">
      {
        nfts === "fetching" || nfts === null ?
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
              {
                nfts === "fetching" ?
                <>
                <h3>
                  Fetching NFTs <CircularProgress className="mx-4" />
                </h3>
                </>
                :
                <>
                  <img
                    src={theme === THEMES.LIGHT ? SearchDoodleLight : SearchDoodleDark}
                    alt="NFTs not found" />
                  <h3 className="m-4">
                    We couldn't find NFTs in this account :(
                    <br/><br/>
                  </h3>
                  {/* <h5 style={{ lineHeight: 2 }}>
                    Manage your NFTs <Link to='/profile'>here</Link>
                    <br/>
                    or
                    <br/>
                    <Link to='/explore'>
                      Explore trending NFTs
                    </Link>
                  </h5> */}
                </>
              }
          </div>
        : 
        <div>
          <h4>
            Total NFTs owned: { nfts.length }
          </h4>
          <NFTList nfts={nfts} />
        </div>
      }
    </div>
  )
}

export default Profile