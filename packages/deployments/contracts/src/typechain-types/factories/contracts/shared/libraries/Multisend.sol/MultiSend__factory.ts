/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  MultiSend,
  MultiSendInterface,
} from "../../../../../contracts/shared/libraries/Multisend.sol/MultiSend";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "transactions",
        type: "bytes",
      },
    ],
    name: "multiSend",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

const _bytecode =
  "0x60a060405234801561001057600080fd5b503060805260805161022061002d600039600050506102206000f3fe60806040526004361061001e5760003560e01c80638d80ff0a14610023575b600080fd5b610036610031366004610139565b610038565b005b333b1561009b5760405162461bcd60e51b815260206004820152602760248201527f4d756c746953656e642073686f756c64206f6e6c792062652063616c6c65642060448201526676696120454f4160c81b606482015260840160405180910390fd5b805160205b8181101561011e578083015160f81c6001820184015160601c6015830185015160358401860151605585018701600085600081146100e557600181146100f557610100565b6000808585888a5af19150610100565b6000808585895af491505b508061010b57600080fd5b50508060550185019450505050506100a0565b505050565b634e487b7160e01b600052604160045260246000fd5b60006020828403121561014b57600080fd5b813567ffffffffffffffff8082111561016357600080fd5b818401915084601f83011261017757600080fd5b81358181111561018957610189610123565b604051601f8201601f19908116603f011681019083821181831017156101b1576101b1610123565b816040528281528760208487010111156101ca57600080fd5b82602086016020830137600092810160200192909252509594505050505056fea26469706673582212203a98476913f6497f1e14c2a098f4f736f686478bc4777a4604ca864cd23dae8d64736f6c63430008110033";

type MultiSendConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MultiSendConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MultiSend__factory extends ContractFactory {
  constructor(...args: MultiSendConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<MultiSend> {
    return super.deploy(overrides || {}) as Promise<MultiSend>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): MultiSend {
    return super.attach(address) as MultiSend;
  }
  override connect(signer: Signer): MultiSend__factory {
    return super.connect(signer) as MultiSend__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MultiSendInterface {
    return new utils.Interface(_abi) as MultiSendInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MultiSend {
    return new Contract(address, _abi, signerOrProvider) as MultiSend;
  }
}
