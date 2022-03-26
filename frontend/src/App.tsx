import { useEffect } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import { ThemeProvider } from "./contexts/ThemeContext";
import { fetchNftContractDetails } from './api/contractInfo';
import { HexToCLPublicKey } from './utils/contract-utils';

import Home from './pages/home';

import { logSeparator } from './utils/log';
import { isContractIHashSetup } from './lib/cep47';
import { getNFTsOwned, numberOfNFTsOwned } from './api/userInfo';

import 'antd/dist/antd.css';
import './App.css';
import Mint from './pages/mint';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  async function fetchInitDetails(){
    if(!isContractIHashSetup()){
      console.log("Contract hash not setup");
      return;
    }    
    
    await fetchNftContractDetails();
    logSeparator();
    
    // Valid, produced by USER_KEYS.publicKey.toHex()
    const PubHex = '014219513d52632aebf946786e20895c886293043ece013bfbe30381f284c561ac';
    const pubCL = HexToCLPublicKey(PubHex);

    const numOfNFTs = await numberOfNFTsOwned(pubCL);
    logSeparator();
    console.log(numOfNFTs, `NFTs are owned by ${PubHex}:`);
    
    if(numOfNFTs === 0)
      return;

    await getNFTsOwned(pubCL);
  }

  useEffect(()=>{
    setTimeout(fetchInitDetails, 1000);
  }, []);

  return (
    <div className="App">
      <AuthProvider>
        <ThemeProvider>
            <BrowserRouter>
              <Switch>
                <Route exact path="/" component={Home} />
                <Route exact path="/mint" component={Mint} />
                <Redirect to="/" />
              </Switch>
            </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </div>
  );
}

export default App;