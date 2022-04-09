import { cep47 } from "../lib/cep47";
import { getRandomNumberBetween } from "../utils/calculations";

export async function isIdOccupied(id: string): Promise<boolean>{
  id = String(Number(id));
  let owner = null;
  try{
    owner = await cep47.getOwnerOf(id);
    if(owner){
      // console.log("owner of", id, "is", owner);
      console.log("ID ", id, "is occupied");
      return true;
    }
  }catch(err){
    console.log("ID ", id, "is unoccupied");
    return false
  }
  return owner ? true : false;
}

export async function generateUniqueID(): Promise<number>{
  let randID: number;
  do{
    randID = getRandomNumberBetween(1, 999999);
  } while(await isIdOccupied(String(randID)));
  console.log("Generated random unoccupied ID:", randID);
  console.log(await isIdOccupied(String(randID)));
  return randID;
}