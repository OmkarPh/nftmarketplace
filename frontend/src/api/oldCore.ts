import { config } from "dotenv";
import { CEP47Client, CEP47Events, CEP47EventParser } from "casper-cep47-js-client";
import { parseTokenMeta, sleep, getDeploy, getAccountInfo, getAccountNamedKeyValue } from "../utils/contract-utils";

import {
  CLValueBuilder,
  Keys,
  CLPublicKey,
  CLAccountHash,
  CLPublicKeyType,
  DeployUtil,
  EventStream,
  EventName,
  CLValueParsers,
  CLMap,
} from "casper-js-sdk";

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME,
  WASM_PATH,
  MASTER_KEY_PAIR_PATH,
  USER_KEY_PAIR_PATH,
  TOKEN_NAME,
  CONTRACT_NAME,
  TOKEN_SYMBOL,
  CONTRACT_HASH,
  INSTALL_PAYMENT_AMOUNT,
  MINT_ONE_PAYMENT_AMOUNT,
  MINT_COPIES_PAYMENT_AMOUNT,
  TRANSFER_ONE_PAYMENT_AMOUNT,
  BURN_ONE_PAYMENT_AMOUNT,
  MINT_ONE_META_SIZE,
  MINT_COPIES_META_SIZE,
  MINT_COPIES_COUNT,
  MINT_MANY_META_SIZE,
  MINT_MANY_META_COUNT,
} = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
  `${MASTER_KEY_PAIR_PATH}/public_key.pem`,
  `${MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

const KEYS_USER = Keys.Ed25519.parseKeyFiles(
  `${USER_KEY_PAIR_PATH}/public_key.pem`,
  `${USER_KEY_PAIR_PATH}/secret_key.pem`
);

const test = async () => {
  const cep47 = new CEP47Client(
    NODE_ADDRESS!,
    CHAIN_NAME!
  );

  let accountInfo = await getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);

  console.log(`... Account Info: `);
  console.log(JSON.stringify(accountInfo, null, 2));

  const contractHash = await getAccountNamedKeyValue(
    accountInfo,
    `${CONTRACT_NAME!}_contract_hash`
  );

  const contractPackageHash = await getAccountNamedKeyValue(
    accountInfo,
    `contract_package_hash`
  );

  console.log(`... Contract Hash: ${contractHash}`);
  console.log(`... Contract Package Hash: ${contractPackageHash}`);

  await cep47.setContractHash(contractHash, contractPackageHash);

  // await sleep(3 * 1000);

  // const es = new EventStream(EVENT_STREAM_ADDRESS!);

  // es.subscribe(EventName.DeployProcessed, (event) => {
  //   const parsedEvents = CEP47EventParser({
  //     contractPackageHash, 
  //     eventNames: [
  //       CEP47Events.MintOne,
  //       CEP47Events.TransferToken,
  //       CEP47Events.BurnOne,
  //       CEP47Events.MetadataUpdate,
  //       CEP47Events.ApproveToken
  //     ]
  //   }, event);

  //   if (parsedEvents && parsedEvents.success) {
  //     console.log("*** EVENT ***");
  //     console.log(parsedEvents.data);
  //     console.log("*** ***");
  //   }
  // });

  // es.start();

  const name = await cep47.name();
  console.log(`... Contract name: ${name}`);

  const symbol = await cep47.symbol();
  console.log(`... Contract symbol: ${symbol}`);

  const meta = await cep47.meta();
  console.log(`... Contract meta: ${JSON.stringify(meta)}`);

  let totalSupply = await cep47.totalSupply();
  console.log(`... Total supply: ${totalSupply}`);


  //****************//
  //* Mint Section *//
  //****************//
  // console.log('\n*************************\n');

  // console.log('... Mint token one \n');

  // const mintDeploy = await cep47.mint(
  //   KEYS.publicKey,
  //   ["1"],
  //   [new Map([['number', 'one']])],
  //   MINT_ONE_PAYMENT_AMOUNT!,
  //   KEYS.publicKey,
  //   [KEYS]
  // );

  // const mintDeployHash = await mintDeploy.send(NODE_ADDRESS!);
  // const mintDeployHash = "DFC9460a3A0147aFA27Df9c5483906268A1584d4d907C1c3e3F195cA99CE550b";

  // console.log("...... Mint deploy hash: ", mintDeployHash);

  // await getDeploy(NODE_ADDRESS!, mintDeployHash);
  // console.log("...... Token minted successfully");

  //* Checks after mint *//
  const balanceOf1 = await cep47.balanceOf(KEYS.publicKey);

  console.log('...... Balance of master account: ', balanceOf1);

  const ownerOfTokenOne = await cep47.getOwnerOf("1");

  console.log('...... Owner of token one: ', ownerOfTokenOne);

  const tokenOneMeta = await cep47.getTokenMeta("1");

  console.log('...... Token five metadata: ', tokenOneMeta);

  const indexByToken1 = await cep47.getIndexByToken(KEYS.publicKey, "1");
  console.log('...... index of token one: ', indexByToken1);

  const tokenByIndex1 = await cep47.getTokenByIndex(KEYS.publicKey, indexByToken1);
  console.log('...... token one id: ', tokenByIndex1);
  return;

  //****************//
  //* Burn section *//
  //****************//
  console.log('\n*************************\n');

  console.log('... Burn token one \n');

  const burnDeploy = await cep47.burn(
    KEYS.publicKey,
    ["1"],
    MINT_ONE_PAYMENT_AMOUNT!,
    KEYS.publicKey,
    [KEYS]
  );

  const burnDeployHash = await burnDeploy.send(NODE_ADDRESS!);

  console.log("... Burn deploy hash: ", burnDeployHash);

  await getDeploy(NODE_ADDRESS!, burnDeployHash);
  console.log("... Token burned successfully");

  //***************//
  //* Mint Copies *//
  //***************//
  console.log('\n*************************\n');

  console.log('... Mint copies #1\n');

  const mintCopiesDeploy = await cep47.mintCopies(
    KEYS.publicKey,
    ["2", "3", "4", "5"],
    new Map([['number', 'from-series']]),
    4,
    MINT_COPIES_PAYMENT_AMOUNT!,
    KEYS.publicKey,
    [KEYS]
  );

  const mintCopiesDeployHash = await mintCopiesDeploy.send(NODE_ADDRESS!);

  console.log("...... Mint deploy hash: ", mintCopiesDeployHash);

  await getDeploy(NODE_ADDRESS!, mintCopiesDeployHash);
  console.log("...... Token minted successfully");

  //* Checks after mint *//
  const balanceOf2 = await cep47.balanceOf(KEYS.publicKey);

  console.log('...... Balance of master account: ', balanceOf2);

  let ownerOfTokenFive = await cep47.getOwnerOf("5");

  console.log('...... Owner of token five: ', ownerOfTokenFive);

  const tokenFiveMeta = await cep47.getTokenMeta("5");

  console.log('...... Token five metadata: ', tokenFiveMeta);

  const indexByToken5 = await cep47.getIndexByToken(KEYS.publicKey, "5");
  console.log('...... index of token five: ', indexByToken5);

  const tokenByIndex5 = await cep47.getTokenByIndex(KEYS.publicKey, indexByToken5);
  console.log('...... token five id: ', tokenByIndex5);

  //************//
  //* Transfer *//
  //************//

  console.log('\n*************************\n');

  console.log('... Transfer #1\n');

  let ownerOfTokenTwo = await cep47.getOwnerOf("2");
  console.log(`...... Owner of token "2" is ${ownerOfTokenTwo}`);

  const transferOneRecipient = CLPublicKey.fromHex("016e5ee177b4008a538d5c9df7f8beb392a890a06418e5b9729231b077df9d7215");
  const transferOneDeploy = await cep47.transfer(transferOneRecipient, ["2"], TRANSFER_ONE_PAYMENT_AMOUNT!, KEYS.publicKey, [KEYS]);

  console.log(`...... Transfer from ${KEYS.publicKey.toAccountHashStr()} to ${transferOneRecipient.toAccountHashStr()}`);

  const transferOneHash = await transferOneDeploy.send(NODE_ADDRESS!);

  console.log("...... Transfer #1 deploy hash: ", transferOneHash);

  await getDeploy(NODE_ADDRESS!, transferOneHash);
  console.log("...... Token transfered successfully");

  ownerOfTokenTwo = await cep47.getOwnerOf("2");
  console.log(`...... Owner of token "2" is ${ownerOfTokenTwo}`);

  console.log('\n*************************\n');


  //********************//
  //* Approval section *//
  //********************//
  console.log('\n*************************\n');

  console.log('... Approve\n');

  const allowedAccount = KEYS_USER!.publicKey;

  const approveDeploy = await cep47.approve(
    allowedAccount,
    ["5"],
    MINT_ONE_PAYMENT_AMOUNT!,
    KEYS.publicKey,
    [KEYS]
  );

  const approveDeployHash = await approveDeploy.send(NODE_ADDRESS!);

  console.log("...... Approval deploy hash: ", approveDeployHash);

  await getDeploy(NODE_ADDRESS!, approveDeployHash);
  console.log("...... Token approved successfully");

  // ** Checks after approval **//
  const allowanceOfTokenFive = await cep47.getAllowance(KEYS.publicKey, "5");
  console.log(`...... Allowance of token 5 ${allowanceOfTokenFive}`);


  //*****************//
  //* Transfer From *//
  //*****************//

  console.log('\n*************************\n');

  console.log('... Transfer From #1\n');

  ownerOfTokenFive = await cep47.getOwnerOf("5");
  console.log(`...... Owner of token "5" is ${ownerOfTokenFive}`);

  // NOTE: Some random address
  const transferFromRecipient = CLPublicKey.fromHex("019548b4f31b06d1ce81ab4fd90c9a88e4a5aee9d71cac97044280905707248da4");

  console.log(`...... Transfer from ${KEYS.publicKey.toAccountHashStr()} to ${transferFromRecipient.toAccountHashStr()}`);

  const transferFromDeploy = await cep47.transferFrom(
    transferFromRecipient,
    KEYS.publicKey,
    ["5"],
    TRANSFER_ONE_PAYMENT_AMOUNT!,
    KEYS_USER.publicKey, [KEYS_USER]);


  const transferFromHash = await transferFromDeploy.send(NODE_ADDRESS!);

  console.log("...... Transfer From #1 deploy hash: ", transferFromHash);

  await getDeploy(NODE_ADDRESS!, transferFromHash);
  console.log("...... Token transfered successfully");

  ownerOfTokenFive = await cep47.getOwnerOf("5");
  console.log(`...... Owner of token "5" is ${ownerOfTokenFive}`);

  console.log('\n*************************\n');

  //*******************//
  //* Update Metadata *//
  //*******************//

  console.log('\n*************************\n');

  console.log('... Update metadata of token 4 \n');

  let tokenFourMeta = await cep47.getTokenMeta("4");

  console.log('...... Token 4 metadata: ', tokenFourMeta);

  const updateMetadataDeploy = await cep47.updateTokenMeta(
    "4",
    new Map([["name", "four"]]),
    TRANSFER_ONE_PAYMENT_AMOUNT!,
    KEYS_USER.publicKey, 
    [KEYS_USER]
  );

  const updateMetadataHash = await updateMetadataDeploy.send(NODE_ADDRESS!);

  console.log("...... Update metadata deploy hash: ", updateMetadataHash);

  await getDeploy(NODE_ADDRESS!, updateMetadataHash);
  console.log("...... Token metadata updated successfully");

  tokenFourMeta = await cep47.getTokenMeta("4");

  console.log('...... Token 4 metadata: ', tokenFourMeta);

  console.log('\n*************************\n');
};

// test();
