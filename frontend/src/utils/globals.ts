export function copyTextToClipboard(text?: string){
  if(text && window.navigator && window.navigator.clipboard){
    window.navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}