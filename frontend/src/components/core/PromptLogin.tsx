import { Typography } from '@material-ui/core';
import { useAuth } from '../../contexts/AuthContext'
import CoreButton from './CoreButton'

const PromptLogin = () => {
  const { login } = useAuth();
  return (
    <div className='p-3 mt-5' >
      <Typography align='center' variant='h4'>
        Please connect to signer
        <br/><br/>
        <CoreButton onClick={login}>
          Connect
        </CoreButton>
      </Typography>

    </div>
  )
}

export default PromptLogin