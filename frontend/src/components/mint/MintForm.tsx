import { Button } from 'antd';
import { CLPublicKey } from 'casper-js-sdk';
import { mint, NFTReference } from '../../api/mint';
import { useAuth } from '../../contexts/AuthContext';

const MintForm = () => {
  const { entityInfo, logout } = useAuth();

  function getDeployStatus(){

  }

  function mintNewNFT(){
    if(entityInfo.publicKey){
      const mintDeployHash = mint(
        CLPublicKey.fromHex(entityInfo.publicKey),
        {
          id: 2,
          about: "Second NFT bro",
          url: "https://github.githubassets.com/images/modules/profile/badge--acv-64.png",
          title: "2nd of its kind",
          references: [
            new NFTReference("my nft collection", "https://opensea.com/OmkarPh"),
            new NFTReference("my gh", "https://github.com/OmkarPh"),
          ]
        }
      );
      console.log("Mint deploy hash", mintDeployHash);
    }
  }
  return (
    < div>
      Connected !!
      <br/>
      User pub key: { entityInfo.publicKey }
      <br/><br/><br/><br/>
      <Button onClick={logout}>
        Disconnect
      </Button>
      <Button onClick={mintNewNFT}>
        Mint 1st NFT
      </Button>
      <Button onClick={getDeployStatus}>
        Get deploy status
      </Button>
    </div>
  )
}

export default MintForm