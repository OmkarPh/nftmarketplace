import { Button, ButtonProps } from '@mui/material';

const CoreButton = (props: ButtonProps) => {
  const { children, className, style, ...otherProps } = props;
  return (
    <Button
      {...otherProps}
      style={{  margin: "2px", ...style, }}
      className={(className ? className : "") + 'corebtn'}
      variant={props.variant ? props.variant : "contained"}>
      {children}
    </Button>
  );
}

export default CoreButton