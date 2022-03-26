import { config } from "dotenv";
import { Keys } from "casper-js-sdk";

import { getAccountInfo, getAccountNamedKeyValue } from "./utils";

config({ path: ".env" });

const { NODE_ADDRESS, CONTRACT_NAME, MASTER_KEY_PAIR_PATH, USER_KEY_PAIR_PATH } = process.env;

const KEYS = Keys.Ed25519.parseKeyFiles(
  `${MASTER_KEY_PAIR_PATH}/public_key.pem`,
  `${MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

const USER_KEYS = Keys.Ed25519.parseKeyFiles(
  `${USER_KEY_PAIR_PATH}/public_key.pem`,
  `${USER_KEY_PAIR_PATH}/secret_key.pem`
);
console.log(USER_KEYS.publicKey.toAccountHash());
console.log(USER_KEYS.publicKey.toHex());
console.log(USER_KEYS.publicKey.toAccountHashStr());
  


const fetchDetails = async () => {
  let accountInfo = await getAccountInfo(NODE_ADDRESS!, KEYS.publicKey);

  // console.log(`... Account Info: `);
  // console.log(JSON.stringify(accountInfo, null, 2));

  const contractHash = await getAccountNamedKeyValue(
    accountInfo,
    `${CONTRACT_NAME!}_contract_hash`
  );

  console.log(`... Contract Hash: ${contractHash}`);
}
fetchDetails();