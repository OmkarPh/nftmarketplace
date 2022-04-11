import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getNFTDetails } from '../api/nftInfo';
import { parseNFT } from '../utils/parsers';
import { INFT } from './dash';

const NFT = () => {
  const { id } = useParams<{id: string}>();
  const [nft, setNft] = useState<INFT | null | "fetching">('fetching');

  useEffect(()=>{
    setTimeout(()=>{
      getNFTDetails(id)
        .then(rawNFT => {
          console.log(rawNFT);
          const nft = parseNFT(rawNFT, id);
          setNft(nft);
        })
        .catch(err => {
          console.log(err);
          setNft(null);
        })
    }, 2000);
  }, [id]);

  return (
    <div>
      NFT #{id}
      {
        nft === "fetching" ?
        <h5>Fetching nft</h5>
        : nft === null ?
        <h5>NFT not found :( </h5>
        : 
        <h5>NFT found !!!</h5>
      }
    </div>
  )
}

export default NFT