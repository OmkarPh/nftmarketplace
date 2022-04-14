import {
  CLValue,
  CLPublicKey,
  CLMap,
  RuntimeArgs,
  CasperClient,
  Contracts,
  Keys,
  CLKeyParameters,
  CLValueBuilder,
  CLValueParsers 
} from "casper-js-sdk";
import { concat } from "@ethersproject/bytes";
import blake from "blakejs";
import BufferImported from 'buffer/';
import { CONNECTION, KEYS } from "../constants/blockchain";
import { getAccountInfo, getAccountNamedKeyValue } from "../utils/contract-utils";

const { NODE_ADDRESS, CHAIN_NAME, CONTRACT_NAME } = CONNECTION;

const Buffer = BufferImported.Buffer;
const { Contract, toCLMap, fromCLMap } = Contracts;

export interface CEP47InstallArgs {
  name: string,
  contractName: string,
  symbol: string,
  meta: Map<string, string>
};

export enum CEP47Events {
  MintOne = "cep47_mint_one",
  TransferToken = "cep47_transfer_token",
  BurnOne = "cep47_burn_one",
  MetadataUpdate = 'cep47_metadata_update',
  ApproveToken = 'cep47_approve_token'
}

export const CEP47EventParser = (
  {
    contractPackageHash,
    eventNames,
  }: { contractPackageHash: string; eventNames: CEP47Events[] },
  value: any
) => {
  if (value.body.DeployProcessed.execution_result.Success) {
    const { transforms } =
      value.body.DeployProcessed.execution_result.Success.effect;

        const cep47Events = transforms.reduce((acc: any, val: any) => {
          if (
            val.transform.hasOwnProperty("WriteCLValue") &&
            typeof val.transform.WriteCLValue.parsed === "object" &&
            val.transform.WriteCLValue.parsed !== null
          ) {
            const maybeCLValue = CLValueParsers.fromJSON(
              val.transform.WriteCLValue
            );
            const clValue = maybeCLValue.unwrap();
            if (clValue && clValue instanceof CLMap) {
              const hash = clValue.get(
                CLValueBuilder.string("contract_package_hash")
              );
              const event = clValue.get(CLValueBuilder.string("event_type"));
              if (
                hash &&
                // NOTE: Calling toLowerCase() because current JS-SDK doesn't support checksumed hashes and returns all lower case value
                // Remove it after updating SDK
                hash.value() === contractPackageHash.slice(5).toLowerCase() &&
                event &&
                eventNames.includes(event.value())
              ) {
                acc = [...acc, { name: event.value(), clValue }];
              }
            }
          }
          return acc;
        }, []);

    return { error: null, success: !!cep47Events.length, data: cep47Events };
  }

  return null;
};

const keyAndValueToHex = (key: CLValue, value: CLValue) => {
  const aBytes = CLValueParsers.toBytes(key).unwrap();
  const bBytes = CLValueParsers.toBytes(value).unwrap();

  const blaked = blake.blake2b(concat([aBytes, bBytes]), undefined, 32);
  const hex = Buffer.from(blaked).toString('hex');

  return hex;
}

class CEP47Client {
  casperClient: CasperClient;
  contractClient: Contracts.Contract;
  isContractIHashSetup = false;

  constructor(public nodeAddress: string, public networkName: string, contractHash?: string, contractPackageHash?: string) {
    this.casperClient = new CasperClient(nodeAddress);
    this.contractClient = new Contract(this.casperClient);
    if(contractHash){
      this.contractClient.setContractHash(contractHash, contractPackageHash);
      this.isContractIHashSetup = true;
    }
  }

  public install(
    wasm: Uint8Array,
    args: CEP47InstallArgs,
    paymentAmount: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      name: CLValueBuilder.string(args.name),
      contract_name: CLValueBuilder.string(args.contractName),
      symbol: CLValueBuilder.string(args.symbol),
      meta: toCLMap(args.meta),
    });

    return this.contractClient.install(wasm, runtimeArgs, paymentAmount, deploySender, this.networkName, keys || []);
  }

  public setContractHash(contractHash: string, contractPackageHash?: string) {
    this.contractClient.setContractHash(contractHash, contractPackageHash);
    this.isContractIHashSetup = true;
  }
  
  public async name() {
    return this.contractClient.queryContractData(['name']);
  }

  public async symbol() {
    return this.contractClient.queryContractData(['symbol']);
  }

  public async meta() {
    return this.contractClient.queryContractData(['meta']);
  }

  public async totalSupply() {
    return this.contractClient.queryContractData(['total_supply']);
  }
  
  public async balanceOf(account: CLPublicKey) {
    const result = await this.contractClient
      .queryContractDictionary('balances', account.toAccountHashStr().slice(13));

    const maybeValue = result.value().unwrap();

    return maybeValue.value().toString();
  }

  public async balanceOfAccHash(accHash: string){
    if(!accHash.includes('account-hash-')){
      throw new Error("Invalid account hash !");
    }
    const result = await this.contractClient
      .queryContractDictionary('balances', accHash.slice(13));

    const maybeValue = result.value().unwrap();

    return maybeValue.value().toString();
  }

  public async getOwnerOf(tokenId: string) {
    const result = await this.contractClient
      .queryContractDictionary('owners', tokenId);

    const maybeValue = result.value().unwrap();

    return `account-hash-${Buffer.from(maybeValue.value().value()).toString(
      "hex"
    )}`;
  }

  public async getTokenMeta(tokenId: string) {
    const result = await this.contractClient
      .queryContractDictionary('metadata', tokenId);

    const maybeValue = result.value().unwrap().value();

    return fromCLMap(maybeValue);
  }

  public async getTokenByIndex(owner: CLPublicKey, index: string) {
    const hex = keyAndValueToHex(CLValueBuilder.key(owner), CLValueBuilder.u256(index));
    const result = await this.contractClient.queryContractDictionary('owned_tokens_by_index', hex);

    const maybeValue = result.value().unwrap();

    return maybeValue.value().toString();
  }

  public async getTokenByIndexNAccHash(ownerAccHash: string, index: string) {
    const hex = keyAndValueToHex(CLValueBuilder.string(ownerAccHash), CLValueBuilder.u256(index));
    const result = await this.contractClient.queryContractDictionary('owned_tokens_by_index', hex);
    console.log(result);
    
    const maybeValue = result.value().unwrap();

    return maybeValue.value().toString();
  }

  public async getIndexByToken(
    owner: CLKeyParameters,
    tokenId: string
  ) {
    const hex = keyAndValueToHex(CLValueBuilder.key(owner), CLValueBuilder.u256(tokenId));
    const result = await this.contractClient.queryContractDictionary('owned_indexes_by_token', hex);

    const maybeValue = result.value().unwrap();

    return maybeValue.value().toString();
  }

  public async getAllowance(
    owner: CLKeyParameters,
    tokenId: string
  ) {
    const hex = keyAndValueToHex(CLValueBuilder.key(owner), CLValueBuilder.string(tokenId));
    const result = await this.contractClient.queryContractDictionary('allowances', hex);

    const maybeValue = result.value().unwrap();

    return `account-hash-${Buffer.from(maybeValue.value().value()).toString(
      "hex"
    )}`;
  }

  public async approve(
    spender: CLKeyParameters,
    ids: string[],
    paymentAmount: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      spender: CLValueBuilder.key(spender),
      token_ids: CLValueBuilder.list(ids.map(id => CLValueBuilder.u256(id)))
    });

    return this.contractClient.callEntrypoint(
      'approve',
      runtimeArgs,
      deploySender,
      this.networkName,
      paymentAmount,
      keys
    );
  }

  public async mint(
    recipient: CLKeyParameters,
    ids: string[],
    metas: Map<string, string>[],
    paymentAmount: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      recipient: CLValueBuilder.key(recipient),
      token_ids: CLValueBuilder.list(ids.map(id => CLValueBuilder.u256(id))),
      token_metas: CLValueBuilder.list(metas.map(meta => toCLMap(meta)))
    });

    return this.contractClient.callEntrypoint(
      'mint',
      runtimeArgs,
      deploySender,
      this.networkName,
      paymentAmount,
      keys
    );
  }

  public async mintCopies(
    recipient: CLKeyParameters,
    ids: string[],
    meta: Map<string, string>,
    count: number,
    paymentAmount: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      recipient: CLValueBuilder.key(recipient),
      token_ids: CLValueBuilder.list(ids.map(id => CLValueBuilder.u256(id))),
      token_meta: toCLMap(meta),
      count: CLValueBuilder.u32(count)
    });

    return this.contractClient.callEntrypoint(
      'mint_copies',
      runtimeArgs,
      deploySender,
      this.networkName,
      paymentAmount,
      keys
    );
  }

  public async burn(
    owner: CLKeyParameters,
    ids: string[],
    paymentAmount: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      owner: CLValueBuilder.key(owner),
      token_ids: CLValueBuilder.list(ids.map(id => CLValueBuilder.u256(id))),
    });

    return this.contractClient.callEntrypoint(
      'burn',
      runtimeArgs,
      deploySender,
      this.networkName,
      paymentAmount,
      keys
    );
  }

  public async transferFrom(
    recipient: CLKeyParameters,
    owner: CLKeyParameters,
    ids: string[],
    paymentAmount: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      recipient: CLValueBuilder.key(recipient),
      sender: CLValueBuilder.key(owner),
      token_ids: CLValueBuilder.list(ids.map(id => CLValueBuilder.u256(id))),
    });

    return this.contractClient.callEntrypoint(
      'transfer_from',
      runtimeArgs,
      deploySender,
      this.networkName,
      paymentAmount,
      keys
    );
  }

  public async transfer(
    recipient: CLKeyParameters,
    ids: string[],
    paymentAmount: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      recipient: CLValueBuilder.key(recipient),
      token_ids: CLValueBuilder.list(ids.map(id => CLValueBuilder.u256(id))),
    });

    return this.contractClient.callEntrypoint(
      'transfer',
      runtimeArgs,
      deploySender,
      this.networkName,
      paymentAmount,
      keys
    );
  }

  public async updateTokenMeta(
    id: string,
    meta: Map<string, string>,
    paymentAmount: string,
    deploySender: CLPublicKey,
    keys?: Keys.AsymmetricKey[]
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      token_id: CLValueBuilder.u256(id),
      token_meta: toCLMap(meta),
    });

    return this.contractClient.callEntrypoint(
      'update_token_meta',
      runtimeArgs,
      deploySender,
      this.networkName,
      paymentAmount,
      keys
    );
  }
}


export const cep47 = new CEP47Client(
  NODE_ADDRESS!,
  CHAIN_NAME!
);
export const isContractIHashSetup = () => cep47.isContractIHashSetup;

async function setupContractHash(){
  let accountInfo = await getAccountInfo(NODE_ADDRESS!, KEYS.DEPLOYER_ACC_HASH);
  console.log(`NFT contract deployer account Info:\n`, accountInfo);
  
  const contractHash = await getAccountNamedKeyValue(
    accountInfo,
    `${CONTRACT_NAME!}_contract_hash`
  );
  if(!contractHash)
    throw new Error("contract not found in deployer account");
  console.log(`NFT Contract Hash: \n${contractHash}`);
  return contractHash;
}
setupContractHash()
  .then(contractHash => {
    cep47.setContractHash(contractHash)
  })
  .catch(err => console.log(err));