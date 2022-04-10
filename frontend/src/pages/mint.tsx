import PromptLogin from "../components/core/PromptLogin";
import MintForm from "../components/mint/MintForm";
import { useAuth } from "../contexts/AuthContext";

const Mint = () => {
  const { isLoggedIn } = useAuth();
  
  if(!isLoggedIn)
    return <PromptLogin />
  return (
    <div className="px-3">
      <br/>
      <h2>
        Mint
      </h2>
      <MintForm />
    </div>
  )
}

export default Mint