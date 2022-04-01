import { CLPublicKey, DeployUtil, Signer } from "casper-js-sdk";
import { Deploy } from "casper-js-sdk/dist/lib/DeployUtil";

export const signDeploy = async (deploy: Deploy, publicKey: CLPublicKey) => {
  const publicKeyHex = publicKey.toHex();
  return await signDeployHex(deploy, publicKeyHex);
}
export const signDeployHex = async (deploy: Deploy, publicKeyHex: string) => {
  const deployJSON = DeployUtil.deployToJson(deploy)
  const signedDeployJSON = await Signer.sign(deployJSON, publicKeyHex, publicKeyHex);
  const signedDeploy = DeployUtil.deployFromJson(signedDeployJSON).unwrap();
  return signedDeploy;
} 