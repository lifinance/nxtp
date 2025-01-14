/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IArbitrumRollup,
  IArbitrumRollupInterface,
} from "../../../../../../contracts/messaging/interfaces/ambs/arbitrum/IArbitrumRollup";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint64",
        name: "nodeNum",
        type: "uint64",
      },
    ],
    name: "getNode",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "stateHash",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "challengeHash",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "confirmData",
            type: "bytes32",
          },
          {
            internalType: "uint64",
            name: "prevNum",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "deadlineBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "noChildConfirmedBeforeBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "stakerCount",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "childStakerCount",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "firstChildBlock",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "latestChildNumber",
            type: "uint64",
          },
          {
            internalType: "uint64",
            name: "createdAtBlock",
            type: "uint64",
          },
          {
            internalType: "bytes32",
            name: "nodeHash",
            type: "bytes32",
          },
        ],
        internalType: "struct Node",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class IArbitrumRollup__factory {
  static readonly abi = _abi;
  static createInterface(): IArbitrumRollupInterface {
    return new utils.Interface(_abi) as IArbitrumRollupInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IArbitrumRollup {
    return new Contract(address, _abi, signerOrProvider) as IArbitrumRollup;
  }
}
