import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';

import FavoriteIcon from '@mui/icons-material/FavoriteBorder';
import UnFavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { INFT } from "../../pages/dash"
import { useCustomTheme } from '../../contexts/ThemeContext';
import { NFTInfoModal } from './NFTInfoModal';
import { trimString } from '../../utils/ux';
import { favorite, unFavorite } from '../../api/miscFeatures';
import { useSnackbar } from 'notistack';


interface INFTCardProps {
  nft: INFT,
  key: string
}
const NFTCard = (props: INFTCardProps) => {
  const { id, title, about, url } = props.nft;
  const { themeVariables } = useCustomTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [expanded, setExpanded] = React.useState(false);
  const [favorited, setFavorited] = React.useState(Math.random() < 0.2);


  const favoriteNFT = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    favorite(props.nft)
    setFavorited(true)
    e.stopPropagation();
  };
  const unFavoriteNFT = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    unFavorite(props.nft)
    setFavorited(false)
    e.stopPropagation();
  };
  const shareNFT = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    enqueueSnackbar("Shared your nft", { variant: 'success' });
    e.stopPropagation();
  };

  const toggleModalExpansion = () => {
    setExpanded(!expanded);
  };
  return (
    <>
    <Card
      sx={{ 
        maxWidth: '20%',
        color: themeVariables.textColor,
        backgroundColor: `${themeVariables.backgroundSecondary} !important`,
        cursor: 'pointer',
      }}
      onClick={toggleModalExpansion}
      className="nftcard">
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="Jonas">
            J
          </Avatar>
        }
        action={
          <a href={'/nft/' + id} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}>
            <IconButton aria-label="open NFT in new tab" style={{color: themeVariables.textColor}}>
              <OpenInNewIcon />
            </IconButton>
          </a>
        }
        sx={{
          color: themeVariables.textColor
        }}
        title={title}
        subheader={
          <Typography color={themeVariables.textColorSecondary}>
            #  { id }
          </Typography> 
        }
      />
      <CardMedia
        component="img"
        height="194"
        image={url}
        alt={title}
      />
      <CardContent>
        <Typography variant="body2" color={themeVariables.textColor}>
          { trimString(about,150) }
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
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
      </CardActions>
    </Card>
    <NFTInfoModal open={expanded} onClose={toggleModalExpansion} nft={props.nft} />
    </>
  )
}

export default NFTCard;