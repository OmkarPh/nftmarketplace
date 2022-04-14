import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getNFT } from '../api/nftInfo';
import NftContainer from '../components/NFT/NftContainer';
import { THEMES } from '../constants/THEMES';
import { useCustomTheme } from '../contexts/ThemeContext';
import { INFT } from './dash';

import SearchDoodleDark from "../images/searchDarkmode.png";
import SearchDoodleLight from "../images/searchLightmode.png";
import { CircularProgress } from '@material-ui/core';

const NFT = () => {
  const { id } = useParams<{id: string}>();
  const { theme } = useCustomTheme();
  const [nft, setNft] = useState<INFT | null | "fetching">('fetching');

  useEffect(()=>{
    setTimeout(()=>{
      // getNFT('23')
      getNFT(id)
        .then(setNft)
        .catch((err: any) => {
          console.log(err);
          setNft(null);
        })
    }, 200);
  }, [id]);

  return (
    <div>
      {
        nft === "fetching" || nft === null ?
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
                nft === "fetching" ?
                <>
                <h3>
                  Fetching NFT <CircularProgress className="mx-4" />
                </h3>
                </>
                :
                <>
                  <img
                    src={theme === THEMES.LIGHT ? SearchDoodleLight : SearchDoodleDark}
                    alt="NFTs not found" />
                  <h3 className="m-4">
                    We couldn't find that NFT :(
                    <br/><br/>
                  </h3>
                  <h5 style={{ lineHeight: 2 }}>
                    Manage your NFTs <Link to='/dashboard'>here</Link>
                    <br/>
                    or
                    <br/>
                    <Link to='/explore'>
                      Explore trending NFTs
                    </Link>
                  </h5>
                </>
              }
          </div>
        : 
        <NftContainer nft={nft} />
      }
    </div>
  )
}

export default NFT