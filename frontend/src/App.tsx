import React, { useEffect } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider as MuiThemeProviderAPI, createTheme } from "@material-ui/core/styles";

import { ThemeProvider } from "./contexts/ThemeContext";
import { SnackbarProvider } from 'notistack';
import { fetchNftContractDetails } from './api/contractInfo';

import Home from './pages/home';

import { logSeparator } from './utils/log';
import { isContractIHashSetup } from './lib/cep47';

import Mint from './pages/mint';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/navbar';

import './App.css';
import './core.css';
import './colors.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Dash from './pages/dash';
import NFT from './pages/nft';

const queryClient = new QueryClient()

const MuiThemeProvider = (props: React.PropsWithChildren<{}>) => {
  const Theme = {
  //   palette: {
  //    primary: {
  //     contrastText: "#FFFFFF",
  //     dark: "#FFFFFF",
  //     main: "#FFFFFF",
  //     light: "#FFFFFF"
  //    }
  //  },
   overrides: {
    MuiOutlinedInput: {
      root: {
        // position: "relative",
        "& $notchedOutline": {
          borderColor: "#FFFFFF"
        },
        "&:hover:not($disabled):not($focused):not($error) $notchedOutline": {
          borderColor: "#FFFFFF",
          "@media (hover: none)": {
            borderColor: "#FFFFFF"
          }
        },
        "&$focused $notchedOutline": {
          borderColor: "#FFFFFF",
          borderWidth: 1
        }
      }
     }
    }
   };
  const theme = createTheme(Theme);
  return (
    <MuiThemeProviderAPI theme={theme}>
      {props.children}
    </MuiThemeProviderAPI>
  )
}



function App() {
  async function fetchInitDetails(){
    if(!isContractIHashSetup()){
      console.log("Contract hash not setup");
      return;
    }    
    
    await fetchNftContractDetails();
    logSeparator();
    
    // Valid, produced by USER_KEYS.publicKey.toHex()
    // const PubHex = '014219513d52632aebf946786e20895c886293043ece013bfbe30381f284c561ac';
    // const pubCL = HexToCLPublicKey(PubHex);

    // const numOfNFTs = await numberOfNFTsOwned(pubCL);
    // logSeparator();
    // console.log(numOfNFTs, `NFTs are owned by ${PubHex}:`);
    
    // if(numOfNFTs === 0)
    //   return;

    // await getNFTsOwned(pubCL);
  }

  useEffect(()=>{
    setTimeout(fetchInitDetails, 1000);
  }, []);

  return (
    <div className="App">
      <SnackbarProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <MuiThemeProvider>
              <BrowserRouter>
                <Navbar />
                  <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/mint" component={Mint} />
                    <Route exact path="/dashboard" component={Dash} />
                    <Route exact path="/nft/:id" component={NFT} />
                    <Redirect to="/" />
                  </Switch>
              </BrowserRouter>
            </MuiThemeProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
      </SnackbarProvider>
    </div>
  );
}

export default App;