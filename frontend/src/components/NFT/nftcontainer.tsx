import { Box, Typography } from '@mui/material'
import ReactLinkify from 'react-linkify';

import { INFT } from '../../pages/dash';
import LinkifyDecoratorFactory from '../core/LinkifyDecorator';

interface INFTContainerProps {
  nft: INFT;
}

const NftContainer = (props: INFTContainerProps) => {
  const { title, about, url, references, id } = props.nft;
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
                    <ReactLinkify componentDecorator={LinkifyDecoratorFactory()}>
                      { ref.value }
                    </ReactLinkify>
                  </Typography>
                </div>
              ))
            }
          </div>
        </Box>
      </Box>
    </div>
  )
}

export default NftContainer