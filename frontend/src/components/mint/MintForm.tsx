
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Box, Button, Checkbox } from '@mui/material';
import { CLPublicKey } from 'casper-js-sdk';
import { useSnackbar } from 'notistack';

import AddIcon from '@mui/icons-material/Add';


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
import { useCustomTheme } from '../../contexts/ThemeContext';
import { uploadImg } from '../../api/imageCDN';

interface AccNFTData {
  numOfNFTs: number,
}

interface MintInputs {
  about: string,
  id: number,
  title: string,
  directImgURL: boolean,
}


const MintForm = () => {
  const { entityInfo, refreshAuth } = useAuth();
  const [accData, setAccData] = useState<AccNFTData | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const { themeVariables } = useCustomTheme();

  const [validID, setValidID] = useState(false);
  const [uploadedImageURL, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadingToCloud, setUploadingToCloud] = useState(false);
  const refs = useRef<HTMLDivElement>(null);

  const [refInputs, setRefInputs] = useState<NFTReference[]>([]);
  const [mintInputs, setMintInputs] = useState<MintInputs>({
    about: "",
    id: 0,
    title: "",
    directImgURL: false,
  });
  const [mintStage, setMintStage] = useState<MintingStages>(MintingStages.DEFAULT);
  const [errStage, setErrStage] = useState<MintingStages>(MintingStages.DEFAULT);

  
  useEffect(()=>{
    (async ()=>{
      setMintInputs({
        about: "",
        id: await generateUniqueID(),
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
  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target || !event.target.files || !(event.target instanceof HTMLInputElement))
      return;
    setUploadedImage(URL.createObjectURL(event.target.files[0]));
    setUploadedFile(event.target.files[0]);
  }

  function handleRefChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, refIdx: number, isKey?: boolean){
    if(!event.target) return;
    if(isKey)
      refInputs[refIdx].key = event.target.value;
    else
      refInputs[refIdx].value = event.target.value;
    setRefInputs([...refInputs]);
  }
  function addRef(){
    refInputs.push({ key: "", value: "" });
    setRefInputs([...refInputs]);
    if(refs.current){
      const lastRef = refs.current.lastChild as any;
      if(lastRef && lastRef.scrollIntoView)
        lastRef.scrollIntoView();
    }
  }

  async function processMint(){
    if(!uploadedImageURL){
      return enqueueSnackbar("Please upload image or enter direct URL", { 
        variant: 'error',
      });
    }
    if(!validID){
      return enqueueSnackbar("Please enter an id that is not already occupied", {variant: 'error'});
    }

    let cloudURL = uploadedImageURL;
    if(!mintInputs.directImgURL && uploadedFile){
      console.log("Img", uploadedFile);
      console.log("Img url", uploadedImageURL);
      setUploadingToCloud(true);
      try{
        cloudURL = await uploadImg(uploadedFile);
      }catch(err){
        console.log(err);
        enqueueSnackbar("Image couldn't be uploaded to cloud CDN !", { variant: 'error' });
        setUploadingToCloud(false);
        return;
      }
      enqueueSnackbar("Image uploaded to cloud CDN successfuly !", { variant: 'success' });
      setUploadingToCloud(false);
    }
    mintNewNFT(cloudURL);
  }

  async function mintNewNFT(imgURL: string){
    if(!uploadedImageURL){
      return enqueueSnackbar("Please upload image or enter direct URL", { 
        variant: 'error',
      });
    }

    if(entityInfo.publicKey){
      console.log("Your pub key: ", entityInfo.publicKey);

      setMintStage(MintingStages.STARTED);
      
      let mintDeployHash;

      const filteredRefs = refInputs.filter(ref => !(ref.key === "" && ref.value === ""));
      console.log(filteredRefs);
  
      try{
        mintDeployHash = await mint(
          CLPublicKey.fromHex(entityInfo.publicKey),
          {
            id: mintInputs.id,
            title: mintInputs.title,
            about: mintInputs.about,
            url: imgURL,
            references: refInputs.filter(ref => !(ref.key === "" && ref.value === ""))
          }
        )
      }catch(err: any){
        if(err.message.includes('User Cancelled')){
          setErrStage(MintingStages.STARTED);
        }
        return;
      }
      
      setMintStage(MintingStages.TX_PENDING);

      try{
        const deployResult = await getDeployDetails(mintDeployHash);
        console.log("...... Token minted successfully", deployResult);
      }catch(err: any){
        setErrStage(MintingStages.TX_PENDING);
      }
      setMintStage(MintingStages.TX_SUCCESS);
      setMintInputs({
        about: "",
        id: 0,
        title: "",
        directImgURL: false,
      });
      refreshAuth();

      const newBalance = await numberOfNFTsOwned(entityInfo.publicKey);
      console.log('...... No. of NFTs in your account: ', newBalance);
    }
  }

  function closeDialog(){
    if(mintStage === MintingStages.TX_SUCCESS || errStage !== MintingStages.DEFAULT){
      setMintStage(MintingStages.DEFAULT);
      setErrStage(MintingStages.DEFAULT);
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

          <div className='d-flex justify-content-center' style={{ width: "90%"}}>
            <CoreButton onClick={processMint} size='large'>
              Mint NFT
            </CoreButton>
          </div>

          </Box>
          <Box gridColumn="span 6">
            <h3>
              NFT details:
            </h3>
            <br/>
            <CoreTextField
              value={mintInputs.title}
              onChange={e => setMintInputs({ ...mintInputs, title: e.target.value })}
              label="Title" 
              variant="outlined" /><br/><br/>
            <CoreTextField
              value={mintInputs.id}
              onChange={onIDChanged}
              type="number"
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
              sx={{ color: themeVariables.textColor }}
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
                  fullWidth
                  label="Image URL"
                  variant="outlined" />
                <br /><br />
              </>
            }

            <CoreTextField
              value={mintInputs.about}
              onChange={e => setMintInputs({ ...mintInputs, about: e.target.value })}
              fullWidth
              multiline
              maxRows={3}
              label="Description" 
              variant="outlined" /><br/><br/>
            <hr/>
            <div>
              <h4>
                References
              </h4><br/>
              <div className='refInputs' ref={refs}>
              {
                refInputs.map((ref, idx) => (
                  <div className='my-2' style={{ borderBottom: "1 px solid var(--textColor)" }}>
                    <span className='w-100'>
                      {`#${idx+1} Ref`}
                    </span><br/>
                    <div className='my-2'>
                    <CoreTextField
                      value={ref.key}
                      onChange={e => handleRefChange(e, idx, true)}
                      label={`Key`}
                      sx={{ maxWidth: "45%" }}
                      variant="outlined" />
                    <CoreTextField
                      value={ref.value}
                      onChange={e => handleRefChange(e, idx, false)}
                      label={`Value`}
                      sx={{ maxWidth: "45%", marginLeft: "20px"}}
                      variant="outlined" /><br/><br/>
                    </div>
                  </div>
                ))
              }
              </div>
              <CoreButton
                onClick={addRef}
                aria-label="Add reference">
                <AddIcon /> Add reference
              </CoreButton>
            </div>
          </Box>
        </Box>
      </Box>
      <br/><br/>

      <Dialog
        open={mintStage !== MintingStages.DEFAULT}
        onClose={closeDialog}
        fullWidth
        maxWidth='md'
        aria-labelledby="customized-dialog-title"
      >
        <MintStepper currentStep={mintStage} errorStep={errStage} />
      </Dialog>

      <Dialog open={uploadingToCloud}>
        <div className="p-4">
          Uploading image to CDN &nbsp;
          <i className="fa fa-solid fa-spinner fa-spin"></i>
        </div>
      </Dialog>
      <br/><br/><br/>
    </div>
  )
}

export default MintForm;