import { task } from "hardhat/config";
import { L1TransactionReceipt, L1ToL2MessageStatus } from "@arbitrum/sdk";
import { BigNumberish, Contract, providers, Wallet } from "ethers";

import hardhatConfig from "../../hardhat.config";
import {
  Env,
  getMessagingProtocolConfig,
  getProviderFromHardhatConfig,
  mustGetEnv,
  ProtocolNetwork,
} from "../../src/utils";

type TaskArgs = {
  tx: string;
  env?: Env;
  networkType?: ProtocolNetwork;
};

const queryArbitrum = async (txnReceipt: providers.TransactionReceipt, l2Signer: Wallet) => {
  const l1TxnReceipt = new L1TransactionReceipt(
    txnReceipt /** <-- ethers-js TransactionReceipt of an ethereum tx that triggered an L1 to L2 message (say depositting a token via a bridge)  */,
  );

  console.log(l1TxnReceipt);

  console.log(await l1TxnReceipt.getL1ToL2Messages(l2Signer));

  const l1ToL2Message = (await l1TxnReceipt.getL1ToL2Messages(l2Signer))[0];

  const res = await l1ToL2Message.waitForStatus();

  console.log(res);
  // if (res.status === L1ToL2MessageStatus.FUNDS_DEPOSITED_ON_L2) {
  //   /** Message wasn't auto-redeemed; redeem it now: */

  //   // const response = await l1ToL2Message.redeem();
  //   // const receipt = await response.wait();
  // } else if (res.status === L1ToL2MessageStatus.REDEEMED) {
  //   /** Message succesfully redeeemed */
  // }
  // return [message.target, message.sender, message.message, message.messageNonce, proof];
};

export default task("query-arbitrum", "get message from l1->l2")
  .addParam("tx", "txHash for l1->L2 aka propagate")
  .addOptionalParam("env", "Environment of contracts")
  .addOptionalParam("networkType", "Type of network of contracts")
  .setAction(async ({ env: _env, tx, networkType: _networkType }: TaskArgs, { deployments }) => {
    const deployer = Wallet.fromMnemonic(process.env.MNEMONIC!);

    const env = mustGetEnv(_env);
    const networkType = _networkType ?? ProtocolNetwork.TESTNET;
    console.log("networkType: ", networkType);
    console.log("env:", env);

    console.log("deployer", deployer.address);

    // get config
    const protocolConfig = getMessagingProtocolConfig(networkType);

    // get the l2 provider
    const l2Provider = new providers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");
    // get the l1 provider
    const l1Provider = new providers.JsonRpcProvider("https://mainnet.infura.io/v3/19b854cad0bc4089bffd0c93f23ece9f");

    const txnReceipt = await l1Provider.getTransactionReceipt(tx);
    // console.log(txnReceipt);

    if (!txnReceipt) {
      throw Error("empty receipt");
    }
    await queryArbitrum(txnReceipt, deployer.connect(l2Provider));
  });
