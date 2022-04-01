import { Button } from "antd"
import { useEffect } from "react"
import MintForm from "../components/mint/MintForm";
import { useAuth } from "../contexts/AuthContext";

const Mint = () => {
  const { isLoggedIn, entityInfo, login } = useAuth();
  
  useEffect(() => {
    
    return () => {
    }
  }, []);

  // function mintNFT(){

  // }
  
  return (
    <div>
      <br/>
      <h2>
        Mint
      </h2>
      {
        isLoggedIn ?
        <MintForm /> :
        <Button onClick={login}>
          Connect
        </Button>
      }
      
    </div>
  )
}

export default Mint