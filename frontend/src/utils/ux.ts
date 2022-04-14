export function unPropogatedEv(fn: Function){
  return (e: any) => {
    fn(e);
    e.stopPropagation();
  }
}

export function trimString(str: string, maxLength?: number){
  let endIdx = maxLength || 150;
  if(str.length - endIdx <= 3)
    return str;
  const ellipsis = endIdx < str.length ? "..." : "";
  return str.substring(0, endIdx) + ellipsis;
}

export function trimAccHash(str: string){
  return str.substring(0, 25) + "........." + str.substring(55);
}