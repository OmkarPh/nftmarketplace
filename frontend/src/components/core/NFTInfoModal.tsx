import * as React from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

import FavoriteIcon from '@mui/icons-material/FavoriteBorder';
import UnFavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import Linkify from 'react-linkify';

import { INFT } from '../../pages/dash';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { Box } from '@mui/material';
import { favorite, unFavorite } from '../../api/miscFeatures';
import { useSnackbar } from 'notistack';
import LinkifyDecoratorFactory from './LinkifyDecorator';

const BootstrapDialog = styled(Dialog)(({ theme }) => {
  const { themeVariables } = useCustomTheme();
  return ({
    '& .MuiDialogTitle-root': {
      background: themeVariables.backgroundWide,
      color: themeVariables.textColor,
      padding: theme.spacing(2),
    },
    '& .MuiDialogContent-root': {
      background: themeVariables.backgroundWide,
      color: themeVariables.textColor,
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      background: themeVariables.backgroundWide,
      color: themeVariables.textColor,
      padding: theme.spacing(1),
    },
  });
});

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

const BootstrapDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};


interface INFTInfoModalProps {
  open: boolean,
  onClose: ()=>void,
  nft: INFT | null | undefined,
}
export function NFTInfoModal(props: INFTInfoModalProps) {
  const {open, onClose, nft } = props;
  const { themeVariables } = useCustomTheme();
  const [favorited, setFavorited] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  
  const shareNFT = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    enqueueSnackbar("Shared your nft", { variant: 'success' });
    e.stopPropagation();
  };

  if(!nft)
  return <></>
  
  const favoriteNFT = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    favorite(nft)
    setFavorited(true)
    e.stopPropagation();
  };
  const unFavoriteNFT = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    unFavorite(nft)
    setFavorited(false)
    e.stopPropagation();
  };
  
  const { title, about, id, url, references } = nft;
  return (
    <BootstrapDialog
      fullWidth
      maxWidth='md'
      onClose={onClose}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <BootstrapDialogTitle id="customized-dialog-title" onClose={onClose}>
        <Typography
          variant='h5'
          display='inline-block'
          className='mx-1'
          color={themeVariables.textColorSecondary}>
          #  { id }
        </Typography> 
        <Typography
          variant='h5'
          display='inline-block'
          className='mx-5'>
          { title }
        </Typography> 
      </BootstrapDialogTitle>
      <DialogContent dividers>
        <Box
          display="grid"
          component="form"
          gridTemplateColumns="repeat(12, 1fr)"
          gap={2}
          className="p-3"
          noValidate
          autoComplete="off"
        >
          <Box gridColumn="span 6">
            <img
              className="fluid w-100"
              src={url}
              alt="NFT preview"
              /><br/>
          </Box>
          <Box gridColumn="span 6" className='px-2'>
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
                      <Linkify componentDecorator={LinkifyDecoratorFactory(true)}>
                        { ref.value }
                      </Linkify>
                    </Typography>
                  </div>
                ))
              }
            </div>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <IconButton
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          style={{color: 'red'}}
          onClick={favorited ? unFavoriteNFT : favoriteNFT}>
          {
            favorited ?
            <UnFavoriteIcon sx={{color: 'red !important'}} /> :
            <FavoriteIcon sx={{color: 'red !important'}}  />
          }
        </IconButton>
        <IconButton aria-label="share" onClick={shareNFT}>
          <ShareIcon style={{color: themeVariables.textColor}} />
        </IconButton>
      </DialogActions>
    </BootstrapDialog>
  );
}