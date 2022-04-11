import React from 'react'

export const LinkifyDecoratorFactory =  (newTab?: boolean) => {
  return  (href: string, text: string) => {
    const anchorProps: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> = {
      href
    }
    console.log("new tab", newTab);
    
    if(newTab){
      anchorProps.target = "_blank";
      anchorProps.rel = "noreferrer";
    }
  
    return (
      <a {...anchorProps}>
        {text}
      </a>
    )
  }
}

export default LinkifyDecoratorFactory;