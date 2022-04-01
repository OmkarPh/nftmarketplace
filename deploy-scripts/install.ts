import * as fs from "fs";
import { config } from "dotenv";
import { Keys } from "casper-js-sdk";
import { CEP47Client } from "casper-cep47-js-client";

import { parseTokenMeta, sleep, getDeploy, getAccountInfo, getAccountNamedKeyValue } from "./utils";

config({ path: ".env" });

const {
  NODE_ADDRESS,
  CHAIN_NAME,
  WASM_PATH,
  USER_KEY_PAIR_PATH,
  TOKEN_NAME,
  CONTRACT_NAME,
  TOKEN_SYMBOL,
  INSTALL_PAYMENT_AMOUNT,
} = process.env;

export const getBinary = (pathToBinary: string) => {
  return new Uint8Array(fs.readFileSync(pathToBinary, null).buffer);
};

const TOKEN_META = new Map(parseTokenMeta(process.env.TOKEN_META!));

const KEYS = Keys.Ed25519.parseKeyFiles(
  `${USER_KEY_PAIR_PATH}/public_key.pem`,
  `${USER_KEY_PAIR_PATH}/secret_key.pem`
);

const installContract = async () => {
  const cep47 = new CEP47Client(
    NODE_ADDRESS!,
    CHAIN_NAME!
  );

  const installDeployHash = await cep47.install(
    getBinary(WASM_PATH!),
    {
      name: TOKEN_NAME!,
      contractName: CONTRACT_NAME!,
      symbol: TOKEN_SYMBOL!,
      meta: TOKEN_META
    },
    INSTALL_PAYMENT_AMOUNT!,
    KEYS.publicKey,
    [KEYS],
  );

  const hash = await installDeployHash.send(NODE_ADDRESS!);

  console.log(`... Contract installation deployHash: ${hash}`);

  await getDeploy(NODE_ADDRESS!, hash);

  console.log(`... Contract installed successfully.`);

  let accountInfo = await getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);

  console.log(`... Account Info: `);
  console.log(JSON.stringify(accountInfo, null, 2));

  const contractHash = await getAccountNamedKeyValue(
    accountInfo,
    `${CONTRACT_NAME!}_contract_hash`
  );

  console.log(`... Contract Hash: ${contractHash}`);
};

// console.log("Commented fn call to prevent mistaken deployments");
installContract();