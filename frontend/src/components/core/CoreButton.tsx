import { Button, ButtonProps } from '@mui/material';

const CoreButton = (props: ButtonProps) => {
  const { children, className, ...otherProps } = props;
  return (
    <Button
      {...otherProps}
      style={{ margin: "2px" }}
      className={(className ? className : "") + 'corebtn'}
      variant={props.variant ? props.variant : "contained"}>
      {children}
    </Button>
  );
}

export default CoreButton