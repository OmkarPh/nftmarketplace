import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { Typography } from '@material-ui/core';


export enum MintingStages {
  DEFAULT, STARTED, TX_PENDING, TX_SUCCESS
}

const MintStagesInfo: {
  stage: MintingStages,
  title: string,
  processTitle: string,
  description: string,
  err: string
}[] = [
  {
    stage: MintingStages.STARTED,
    title: "Tx prepared",
    processTitle: "Preparing tx ",
    description: "",
    err: "Some error creating or signing tx"
  },
  {
    stage: MintingStages.TX_PENDING,
    title: "Tx sent",
    processTitle: "Signing transaction ",
    description: "Tx signed and sent to blockchain",
    err: "Some err sending tx to chain"
  },
  {
    stage: MintingStages.TX_SUCCESS,
    title: "Mint successful",
    processTitle: "Tx pending ",
    description: "Transaction mined, successfuly",
    err: "Invalid tx"
  },
]

interface IMintStepperProps{
  currentStep: MintingStages;
  errorStep: MintingStages;
}

const MintStepper = (props: IMintStepperProps) => {
  return (
    <Box sx={{ width: '100%', padding: "30px" }}>
      <Stepper activeStep={props.currentStep} alternativeLabel>
        {
          MintStagesInfo.map((mintStage, currIdx) => {

            const labelProps: {
              optional?: React.ReactNode;
              error?: boolean;
            } = {};
            
            if(MintStagesInfo.findIndex(stage => stage.stage === props.currentStep) >= currIdx)
              labelProps.optional = (
                <Typography
                  variant="caption"
                  color="textSecondary"
                  style={{ display: "inline-block", width: "100%" }}
                  align='center'>
                  { mintStage.description }
                </Typography>
              )

            // if (isStepFailed(index)) {
            //   labelProps.optional = (
            //     <Typography variant="caption" color="error">
            //       Alert message
            //     </Typography>
            //   );
            //   labelProps.error = true;
            // }
            console.log(mintStage.stage);
            
            return (
              <Step key={mintStage.stage}>
                <StepLabel {...labelProps}>
                  {
                    mintStage.stage <= props.currentStep ?
                    <> { mintStage.title } </> : 
                    <> 
                      { mintStage.processTitle } &nbsp;
                      <i className="fa fa-solid fa-spinner fa-spin"></i>
                    </>
                  }
                </StepLabel>
              </Step>
            )
          })
        }
      </Stepper>
    </Box>
  );
}

export default MintStepper