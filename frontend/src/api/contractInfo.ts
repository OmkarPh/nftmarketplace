import { cep47 } from "../lib/cep47";

export const fetchNftContractDetails = async () => {
  const totalSupplyRaw = await cep47.totalSupply() as any;
  const metaRaw = await cep47.meta() as any[];
  const parsedMeta = new Map(metaRaw.map(metaEntry => [metaEntry[0].data, metaEntry[1].data]));
    
  const cepContractDetails = {
    name: await cep47.name(),
    symbol: await cep47.symbol(),
    metaRaw: metaRaw,
    meta: parsedMeta,
    totalSupplyRaw: totalSupplyRaw,
    totalSupply: totalSupplyRaw.toNumber(),
  }
  console.log("CEP47 contract details", cepContractDetails);
  return cepContractDetails;
}