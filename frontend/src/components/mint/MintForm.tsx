
import React, { useEffect, useState } from 'react';
import { Box, Button, Checkbox } from '@mui/material';
import { CLPublicKey } from 'casper-js-sdk';
import { useSnackbar } from 'notistack';

import { mint, NFTReference } from '../../api/mint';
import { numberOfNFTsOwned } from '../../api/userInfo';
import { useAuth } from '../../contexts/AuthContext';
import CoreButton from '../core/CoreButton';
import CoreTextField from '../core/CoreTextField';

import { ReactComponent as ImgIcon } from '../../images/imgplaceholder.svg';
import "./mint.css"
import { generateUniqueID, isIdOccupied } from '../../api/nftInfo';
import { getDeployDetails } from '../../api/universal';
import { Dialog } from '@material-ui/core';
import MintStepper, { MintingStages } from './mintSteps';

interface AccNFTData {
  numOfNFTs: number,
}

const MintForm = () => {
  const { entityInfo, logout, refreshAuth } = useAuth();
  const [accData, setAccData] = useState<AccNFTData | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const [validID, setValidID] = useState(false);
  const [uploadedImageURL, setUploadedImage] = useState<string | null>(null);
  const [mintInputs, setMintInputs] = useState({
    about: "",
    id: 0,
    references: [],
    title: "",
    directImgURL: false,
  });
  const [mintStage, setMintStage] = useState<MintingStages>(MintingStages.DEFAULT);

  
  useEffect(()=>{
    (async ()=>{
      setMintInputs({
        about: "",
        id: await generateUniqueID(),
        references: [],
        title: "",
        directImgURL: false,
      });
      setValidID(true);
    })();
  }, []);

  async function onIDChanged(e: React.ChangeEvent<HTMLTextAreaElement>){
    if(!e.target) return;
    setMintInputs({ ...mintInputs, id: Number(e.target.value) });
    setValidID(!(await isIdOccupied(e.target.value)));
  }

  useEffect(() => {
    async function fetchNFTAccData(){
      if(!entityInfo.publicKey)
        return setAccData({ numOfNFTs: 0 });
      const numOfNFTs = await numberOfNFTsOwned(entityInfo.publicKey);
      setAccData({ numOfNFTs });
    }
    fetchNFTAccData();
  }, [entityInfo]);
  
  function changeDirectImageUrlSwitch(directURL: boolean){
    setMintInputs({...mintInputs, directImgURL: directURL});
    setUploadedImage(null);
  }
  function handleImageChange(event: any) {
    if (!event.target || !event.target.files || !(event.target instanceof HTMLInputElement))
      return;
    setUploadedImage(URL.createObjectURL(event.target.files[0]));
  }


  async function mintNewNFT(){
    if(!uploadedImageURL){
      return enqueueSnackbar("Please upload image or enter direct URL", { 
        variant: 'error',
      });
    }

    if(entityInfo.publicKey){
      console.log("Your pub key: ", entityInfo.publicKey);

      setMintStage(MintingStages.STARTED);
      
      const mintDeployHash = await mint(
        CLPublicKey.fromHex(entityInfo.publicKey),
        {
          id: mintInputs.id,
          title: mintInputs.title,
          about: mintInputs.about,
          url: uploadedImageURL,
          references: [
            new NFTReference("my nft collection", "https://opensea.com/OmkarPh"),
            new NFTReference("my gh", "https://github.com/OmkarPh"),
          ]
        }
      );
      
      setMintStage(MintingStages.TX_PENDING);

      const deployResult = await getDeployDetails(mintDeployHash);
      console.log("...... Token minted successfully", deployResult);
      setMintStage(MintingStages.TX_SUCCESS);
      setMintInputs({
        about: "",
        id: 0,
        references: [],
        title: "",
        directImgURL: false,
      });
      refreshAuth();

      const newBalance = await numberOfNFTsOwned(entityInfo.publicKey);
      console.log('...... No. of NFTs in your account: ', newBalance);
    }
  }
  return (
    <div>
      User pub key: { entityInfo.publicKey }
      <br/><br/>
      {
        accData ? 
        <>
          NFTs owned: { accData.numOfNFTs }
        </> :
        <h5>Loading ....</h5>
      }
      <br/><br/>

      <Box
        component="form"
        className="mintform p-3"
        sx={{
          '& > :not(style)': { m: 1 },
        }}
        noValidate
        autoComplete="off"
      >
        <Box
          display="grid"
          component="form"
          gridTemplateColumns="repeat(12, 1fr)"
          gap={0}
          className="p-3"
          noValidate
          autoComplete="off"
        >
          <Box gridColumn="span 6">
            {
              uploadedImageURL || mintInputs.directImgURL ?
              <div className='imgpreview'>
                <img
                  className=""
                  src={uploadedImageURL!}
                  alt="NFT preview"
                  /><br/>
                  {
                    !mintInputs.directImgURL &&
                    <Button
                      variant="contained"
                      component="label"
                      >
                      Change image
                      <input
                        onChange={handleImageChange}
                        type="file"
                        accept="image/*,video/*"
                        hidden
                      />
                    </Button>
                  }
              </div> :
              <div className="dropinput my-2 relative">
                <div className="form-group filesinput color h-100">
                  <input
                    type="file"
                    multiple={false}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-control h-100"
                  />
                  <div className='message'>
                    <ImgIcon className="fluid w-25" />
                    <br/><br/>
                    Upload / drop your image <br/>
                    Accepted files: images
                  </div>
                </div>
              </div>
            }

          <br/>
          </Box>
          <Box gridColumn="span 6">
            <h3>
              NFT details:
            </h3>
            <br/>
            <CoreTextField
              value={mintInputs.title}
              onChange={e => setMintInputs({ ...mintInputs, title: e.target.value })}
              id="outlined"
              label="Title" 
              variant="outlined" /><br/><br/>
            <CoreTextField
              value={mintInputs.id}
              onChange={onIDChanged}
              type="number"
              id="outlined-basic"
              label="ID"
              helperText="Unique ID for your NFT"
              variant="outlined" />
              <h3 className='d-inline ms-3 lh-base'>
              {
                validID ?
                <>
                  Available <i className="fa fa-check text-success" aria-hidden="true"></i>
                </> :
                <>
                  Unvailable <i className="fa fa-times text-danger" aria-hidden="true"></i>
                </>
                }
              </h3>
            {/* <CoreButton disabled={checkingID} onClick={e => setCheckingID(!checkingID)}> */}
              {/* {
                checkingID ?
                <>
                  Checking availability ... 
                  <i className="mx-2 fas fa-spinner fa-pulse"></i>
                </> :
                <> 
                  Check availability
                </>
              } */}
            {/* </CoreButton> */}
            <br/><br/>

            Already hosted image, enter direct url ?
            <Checkbox
              checked={mintInputs.directImgURL}
              onChange={e => changeDirectImageUrlSwitch(e.target.checked)}
              />
            <br/><br/>
            {
              mintInputs.directImgURL &&
              <>
                <CoreTextField
                  className='w-100'
                  value={uploadedImageURL}
                  onChange={e => setUploadedImage(e.target.value)}
                  id="outlined"
                  fullWidth
                  label="Image URL"
                  variant="outlined" />
                <br /><br />
              </>
            }

            <CoreTextField
              value={mintInputs.about}
              onChange={e => setMintInputs({ ...mintInputs, about: e.target.value })}
              id="outlined"
              fullWidth
              multiline
              maxRows={3}
              label="Description" 
              variant="outlined" />
          </Box>
        </Box>
      </Box>
      <br/><br/>

      <CoreButton onClick={logout}>
        Disconnect
      </CoreButton>
      <CoreButton onClick={mintNewNFT}>
        Mint 1st NFT
      </CoreButton>

      <Dialog
        open={mintStage !== MintingStages.DEFAULT}
        onClose={()=>setMintStage(MintingStages.DEFAULT)}
        fullWidth
        maxWidth='md'
        aria-labelledby="customized-dialog-title"
      >
        <MintStepper currentStep={mintStage} errorStep={MintingStages.DEFAULT} />
      </Dialog>
      <br/><br/><br/>
    </div>
  )
}

export default MintForm;