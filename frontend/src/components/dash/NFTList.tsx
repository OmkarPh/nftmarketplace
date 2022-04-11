import { INFT } from "../../pages/dash"
import NFTCard from "../core/NFTCard"

import "./dash.css";

interface INFTListProps{
  nfts: INFT[]
}

const NFTList = (props: INFTListProps) => {
  return (
    <div className="nftlist">
      {
        props.nfts.map(nft => (
          <NFTCard nft={nft} key={nft.id} />
        ))
      }
      {/* {
        props.nfts.map(nft => (
          <NFTCard nft={nft} key={nft.id} />
        ))
      }
      {
        props.nfts.map(nft => (
          <NFTCard nft={nft} key={nft.id} />
        ))
      }
      {
        props.nfts.map(nft => (
          <NFTCard nft={nft} key={nft.id} />
        ))
      } */}
    </div>
  )
}

export default NFTList