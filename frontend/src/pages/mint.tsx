import { Button } from "antd"
import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext";

const Mint = () => {
  const { isLoggedIn, entityInfo, login, logout } = useAuth();
  console.log({ isLoggedIn, pubKey: entityInfo.publicKey });
  
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
        <div>
          Connected !!
          <br/>
          User pub key: { entityInfo.publicKey }
          <br/><br/><br/><br/>
          <Button onClick={logout}>
            Disconnect
          </Button>
        </div> :
        <Button onClick={login}>
          Connect
        </Button>
      }
      
    </div>
  )
}

export default Mint