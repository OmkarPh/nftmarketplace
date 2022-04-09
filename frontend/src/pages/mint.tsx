import CoreButton from "../components/core/CoreButton";
import MintForm from "../components/mint/MintForm";
import { useAuth } from "../contexts/AuthContext";

const Mint = () => {
  const { isLoggedIn, login } = useAuth();
  
  return (
    <div>
      <br/>
      <h2>
        Mint
      </h2>
      {
        isLoggedIn ?
        <MintForm /> :
        <CoreButton onClick={login}>
          Connect
        </CoreButton>
      }
    </div>
  )
}

export default Mint