import { Close, Edit, Save, Sell, Send } from '@mui/icons-material';
import { Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material'
import { useSnackbar } from 'notistack';
import { ChangeEvent, useRef, useState } from 'react';
import ReactLinkify from 'react-linkify';
import { useAuth } from '../../contexts/AuthContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { cep47 } from '../../lib/cep47';

import { INFT } from '../../pages/dash';
import { HexToCLPublicKey } from '../../utils/contract-utils';
import { signDeployHex } from "../../utils/signer";
import { CONNECTION } from '../../constants/blockchain';
import CoreButton from '../core/CoreButton';
import CoreTextField from '../core/CoreTextField';
import LinkifyDecoratorFactory from '../core/LinkifyDecorator';
import AddIcon from '@mui/icons-material/Add';

import { PAYMENT_AMOUNTS } from '../../constants/paymentAmounts';

interface INFTContainerProps {
  nft: INFT;
}

interface IEditInputs {
  title: string,
  about: string
}

const NftContainer = (props: INFTContainerProps) => {
  const { title, about, url, references, id, owner } = props.nft;
  
  const { themeVariables } = useCustomTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferPubKey, setTransferPubKey] = useState('');
  
  const refs = useRef<HTMLDivElement>(null);
  const [showEditingConfirmationDialog, setShowEditingConfirmationDialog] = useState(false);
  const [editingMode, setEditingMode] = useState(false);
  const [refInputs, setRefInputs] = useState(references.map(ref => ({
    key: ref.key, value: ref.value
  })));
  const [editInputs, setEditInputs] = useState<IEditInputs>({
    title,
    about,
  });

  function addRef(){
    refInputs.push({ key: "", value: "" });
    setRefInputs([...refInputs]);
    if(refs.current){
      const lastRef = refs.current.lastChild as any;
      if(lastRef && lastRef.scrollIntoView)
        lastRef.scrollIntoView();
    }
  }

  function exitEdit(){
    setShowEditingConfirmationDialog(false);
    setRefInputs(references.map(ref => ({ key: ref.key, value: ref.value })));
    setEditInputs({title, about});
    setEditingMode(false);
  }
  function handleRefChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, refIdx: number, isKey?: boolean){
    if(!event.target) return;
    if(isKey)
      refInputs[refIdx].key = event.target.value;
    else
      refInputs[refIdx].value = event.target.value;
    setRefInputs([...refInputs]);
  }

  function checkForChanges(){
    if(title !== editInputs.title || about !== editInputs.about || references.length !== refInputs.length)
      return true;
    for(let i=0; i<references.length; i++){
      let ref = references[i];
      console.log(ref.key, refInputs[i].key);
      console.log(ref.value, refInputs[i].value);
      
      if(ref.key !== refInputs[i].key || ref.value !== refInputs[i].value)
        return true;
    }
    return false;
  }
  async function saveNFT(){
    if(!entityInfo.publicKey) return;

    if(!checkForChanges()){
      setShowEditingConfirmationDialog(false);
      return enqueueSnackbar("Please edit something, all fields are same as before", { variant: 'error' });
    }

    const referenceMap = new Map<string, string>();
    refInputs.forEach(ref => {
      if(!(ref.key === "" && ref.value === ""))
        referenceMap.set(ref.key, ref.value);
    });
    referenceMap.set('title', editInputs.title);
    referenceMap.set('about', editInputs.about);
    referenceMap.set('url', url);
    console.log(referenceMap);


    try{
      const editDeploy = await cep47.updateTokenMeta(
        id,
        referenceMap,
        PAYMENT_AMOUNTS.MINT_ONE_PAYMENT_AMOUNT,
        HexToCLPublicKey(entityInfo.publicKey)
      );

      console.log("Edit deploy:", editDeploy);
      
      const signedEditDeploy = await signDeployHex(editDeploy, entityInfo.publicKey);
      console.log("Edit deploy signed:", signedEditDeploy);

      const editDeployHash = await signedEditDeploy.send(CONNECTION.NODE_ADDRESS);
      console.log("Edit Deploy hash", editDeployHash);

      enqueueSnackbar('NFT edit deploy sent to blockchain, It will reflect here in a minute', { variant: 'success' });
      exitEdit();
    }catch(err: any){
      if(err.message.includes('User Cancelled')){
        enqueueSnackbar('Some err processing your request, please try again', {variant: 'error'});
      }
      exitEdit();
      return;
    }
  }
  async function transferNFT(){
    if(!entityInfo.publicKey) return;
    if(transferPubKey.length <= 3){
      return enqueueSnackbar('Invalid public key !!', { variant: 'error' })
    }
    const transferrDeploy = await cep47.transfer(
      HexToCLPublicKey(transferPubKey),
      [id],
      PAYMENT_AMOUNTS.TRANSFER_ONE_PAYMENT_AMOUNT,
      HexToCLPublicKey(entityInfo.publicKey)
    );

    console.log("Transfer deploy:", transferrDeploy);
    
    const signedTransferDeploy = await signDeployHex(transferrDeploy, entityInfo.publicKey);
    console.log("Transfer deploy signed:", signedTransferDeploy);

    const mintDeployHash = await signedTransferDeploy.send(CONNECTION.NODE_ADDRESS);
    console.log("Deploy hash", mintDeployHash);
    enqueueSnackbar('Deploy sent to blockchain, It will here reflect in a minute', { variant: 'success' })
    setShowTransferModal(false);
  }

  const { isLoggedIn, entityInfo } = useAuth();
  let isOwner = false;
  if(isLoggedIn && entityInfo.publicKey){
    const viewerAccHash = HexToCLPublicKey(entityInfo.publicKey).toAccountHashStr();
    if(viewerAccHash === owner)
      isOwner = true;
  }
  return (
    <div>
      <Box
        display="grid"
        component="form"
        gridTemplateColumns="repeat(12, 1fr)"
        gap={2}
        className="p-3"
        noValidate
        autoComplete="off"
      >
        <Box gridColumn="span 5">
          <div className='w-100 d-flex align-content-center py-2'>
            <img
              className="fluid m-auto"
              style={{ width: "90%", maxHeight: "700px"}}
              src={url}
              alt="NFT preview"
              /><br/>
          </div>
          {
            isOwner &&
            <div className='w-100 d-flex justify-content-evenly py-3'>
              {
                editingMode ?
                <>
                  <CoreButton onClick={()=>setShowEditingConfirmationDialog(true)}>
                    Save &nbsp; <Save />
                  </CoreButton>
                </> :
                <>
                  <CoreButton onClick={()=>setShowTransferModal(true)}>
                    Transfer &nbsp; <Send />
                  </CoreButton>
                  <CoreButton onClick={()=>setEditingMode(!editingMode)}>
                    Edit &nbsp; <Edit />
                  </CoreButton>
                  <CoreButton>
                    Sell &nbsp; <Sell />
                  </CoreButton>
                </>
              }
            </div>
          }

        </Box>
        <Box gridColumn="span 6" className='p-1 py-2'>
          <Typography
            variant='h6'
            display='inline-block'
            className='py-2'
            color={themeVariables.textColorSecondary}>
            #  { id } 
          </Typography>
          {/* <Typography>
            Owned by { owner! }
          </Typography> */}

          {
            editingMode ?
            <div className='py-2'>
              <CoreTextField
                value={editInputs.title}
                onChange={e => setEditInputs({ ...editInputs, title: e.target.value })}
                label="Title" 
                variant="outlined" />
              <CoreButton
                sx={{ float: 'right' }}
                variant='outlined' color='error'
                onClick={exitEdit}>
                Exit <Close />
              </CoreButton>
              <br/><br/>

              <CoreTextField
                value={editInputs.about}
                onChange={e => setEditInputs({ ...editInputs, about: e.target.value })}
                fullWidth
                multiline
                maxRows={3}
                label="Description" 
                variant="outlined" /><br/><br/>

              <div>
                <h4>
                  References
                </h4>
                <hr/><br/>

                <div className='refInputs'>
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
            </div> :
            <div>
              <Typography variant='h5' className='my-3'>
                { title }
              </Typography>
              <Typography gutterBottom className='my-1'>
                { about }
              </Typography><br/><br/>
              <h5>
                References
              </h5>
              <hr/>
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                {
                  references.map(ref => (
                    <div key={ref.key}>
                      <Typography gutterBottom>
                        { ref.key }
                      </Typography>
                      <Typography gutterBottom paragraph style={{marginBottom: "2rem"}}>
                        <ReactLinkify componentDecorator={LinkifyDecoratorFactory(true)}>
                          { ref.value }
                        </ReactLinkify>
                      </Typography>
                    </div>
                  ))
                }
              </div>
            </div>
          }
        </Box>
      </Box>

      {/* Transfer nft dialog */}
      <Dialog
        fullWidth
        maxWidth='md'
        open={showTransferModal}
        onClose={()=>setShowTransferModal(false)}>

        <div style={{ backgroundColor: themeVariables.backgroundWide, color: themeVariables.textColor }}>
          <DialogTitle>Transfer NFT</DialogTitle>
          <DialogContent>
            <DialogContentText color={themeVariables.textColor}>
              warning !
            </DialogContentText><br/>
            <CoreTextField
              autoFocus
              margin="dense"
              label="Receiver Public key"
              type="email"
              fullWidth
              value={transferPubKey}
              onChange={e => setTransferPubKey(e.target.value)}
              className='w-100'
              variant="standard"
            /><br/><br/>
          </DialogContent>
          <DialogActions>
            <CoreButton onClick={()=>setShowTransferModal(false)}>Cancel</CoreButton>
            <CoreButton onClick={transferNFT}>Transfer</CoreButton>
          </DialogActions>
        </div>
      </Dialog>


      <Dialog
        open={showEditingConfirmationDialog}
        onClose={()=>setShowEditingConfirmationDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div style={{ backgroundColor: themeVariables.backgroundWide, color: themeVariables.textColor }}>
          <DialogTitle id="alert-dialog-title">
            Confirm save ?
          </DialogTitle>
          <DialogContent>
            <DialogContentText color={themeVariables.textColor}>
              This wil edit the NFT metadata and incur required gas fees.
              <br/>
              Do you really want to perform this action?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <CoreButton onClick={()=>setShowEditingConfirmationDialog(false)}>
              Cancel
            </CoreButton>
            <CoreButton onClick={saveNFT} autoFocus style={{marginLeft: '15px'}}>
              Yes, save
            </CoreButton>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  )
}

export default NftContainer