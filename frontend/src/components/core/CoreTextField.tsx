import { TextField, TextFieldProps } from '@mui/material';
import { useCustomTheme } from '../../contexts/ThemeContext';

const inputCustomStyles = (themeVariables: any) => ({
  width: { sm: 250, md: 350 },
  "& .MuiOutlinedInput-root": {
    "& > fieldset": {
      borderColor: themeVariables.primaryFocusBlue
    }
  },
  "& .MuiOutlinedInput-root:hover": {
    "& > fieldset": {
      borderColor: themeVariables.primaryFocusBlue
    }
  }
});

const inputStyles = (themeVariables: any, isNumeric?: boolean) => {
  let inputProps: any = {
    style: {
      color: themeVariables.textColor, 
      borderColor: themeVariables.textColor
    }
  };
  return inputProps;
};


export const CoreTextField = (props: TextFieldProps) => {
  const { className, ...otherProps } = props;
  const { themeVariables } = useCustomTheme();
  return (
    <TextField
      {...otherProps}
      className={className}
      InputLabelProps={inputStyles(themeVariables)}
      inputProps={inputStyles(themeVariables)}
      sx={inputCustomStyles(themeVariables)}
    />
  );
}


export default CoreTextField;