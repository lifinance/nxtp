/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  RootManagerPropagateWrapper,
  RootManagerPropagateWrapperInterface,
} from "../../../contracts/messaging/RootManagerPropagateWrapper";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_rootManager",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ProposedOwnable__acceptProposedOwner_delayNotElapsed",
    type: "error",
  },
  {
    inputs: [],
    name: "ProposedOwnable__onlyOwner_notOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "ProposedOwnable__onlyProposed_notProposedOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "ProposedOwnable__proposeNewOwner_invalidProposal",
    type: "error",
  },
  {
    inputs: [],
    name: "ProposedOwnable__proposeNewOwner_noOwnershipChange",
    type: "error",
  },
  {
    inputs: [],
    name: "ProposedOwnable__renounceOwnership_delayNotElapsed",
    type: "error",
  },
  {
    inputs: [],
    name: "ProposedOwnable__renounceOwnership_invalidProposal",
    type: "error",
  },
  {
    inputs: [],
    name: "ProposedOwnable__renounceOwnership_noProposal",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    name: "FundsDeducted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    name: "FundsReceived",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "proposedOwner",
        type: "address",
      },
    ],
    name: "OwnershipProposed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "rootManager",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "oldRootManager",
        type: "address",
      },
    ],
    name: "RootManagerChanged",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptProposedOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "delay",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_connectors",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "_fees",
        type: "uint256[]",
      },
      {
        internalType: "bytes[]",
        name: "_encodedData",
        type: "bytes[]",
      },
    ],
    name: "propagate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newlyProposed",
        type: "address",
      },
    ],
    name: "proposeNewOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "proposed",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "proposedTimestamp",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounced",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rootManager",
    outputs: [
      {
        internalType: "contract IRootManager",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_rootManager",
        type: "address",
      },
    ],
    name: "setRootManager",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50604051610cb4380380610cb483398101604081905261002f91610148565b610038336100e3565b6001600160a01b0381166100865760405162461bcd60e51b815260206004820152601160248201527010bd32b937903937b7ba26b0b730b3b2b960791b604482015260640160405180910390fd5b600380546001600160a01b0319166001600160a01b03831690811790915560408051918252600060208301527f3124eaf4f16c6ddd81951200c6d8f65d5800753bef06584bd672c8b22c76b487910160405180910390a150610178565b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b039092166001600160a01b0319928316178155600255600180549091169055565b60006020828403121561015a57600080fd5b81516001600160a01b038116811461017157600080fd5b9392505050565b610b2d806101876000396000f3fe6080604052600436106100ab5760003560e01c8063b1f8100d11610064578063b1f8100d146101a7578063c5b350df146101c7578063d1851c92146101dc578063d232c220146101fa578063db20563514610223578063f0a67eba1461024357600080fd5b80633ccfd60b146100ef5780633cf52ffb14610106578063412e12db1461012a5780636a42b8f81461014a578063715018a6146101605780638da5cb5b1461017557600080fd5b366100ea57604080513481524760208201527f063d07ee72a7483b8e07ca09054bb686775c5c030f945dde3823a5257a0a93eb910160405180910390a1005b600080fd5b3480156100fb57600080fd5b50610104610263565b005b34801561011257600080fd5b506002545b6040519081526020015b60405180910390f35b34801561013657600080fd5b506101046101453660046107d8565b6102f9565b34801561015657600080fd5b5062093a80610117565b34801561016c57600080fd5b506101046103f5565b34801561018157600080fd5b506000546001600160a01b03165b6040516001600160a01b039091168152602001610121565b3480156101b357600080fd5b506101046101c2366004610967565b6104a9565b3480156101d357600080fd5b5061010461054a565b3480156101e857600080fd5b506001546001600160a01b031661018f565b34801561020657600080fd5b506000546040516001600160a01b03909116158152602001610121565b34801561022f57600080fd5b5060035461018f906001600160a01b031681565b34801561024f57600080fd5b5061010461025e366004610967565b6105ba565b6000546001600160a01b0316331461028e576040516311a8a1bb60e31b815260040160405180910390fd5b6040514790339082156108fc029083906000818181858888f193505050501580156102bd573d6000803e3d6000fd5b50604080518281524760208201527f9826a73d0fd7186bda6a15195ac17571869cab151bfe9a8fed3f9407fffe5b18910160405180910390a150565b600084815b818163ffffffff1610156103405785858263ffffffff1681811061032457610324610989565b905060200201358361033691906109b5565b92506001016102fe565b5060035460405163412e12db60e01b81526001600160a01b039091169063412e12db90849061037b908b908b908b908b908b90600401610a50565b6000604051808303818588803b15801561039457600080fd5b505af11580156103a8573d6000803e3d6000fd5b5050604080518681524760208201527f9826a73d0fd7186bda6a15195ac17571869cab151bfe9a8fed3f9407fffe5b1894500191506103e49050565b60405180910390a150505050505050565b6000546001600160a01b03163314610420576040516311a8a1bb60e31b815260040160405180910390fd5b60025460000361044357604051630e4b303f60e21b815260040160405180910390fd5b62093a80600254426104559190610ae4565b11610473576040516386d4b3f160e01b815260040160405180910390fd5b6001546001600160a01b03161561049d576040516323295ef960e01b815260040160405180910390fd5b6104a76000610692565b565b6000546001600160a01b031633146104d4576040516311a8a1bb60e31b815260040160405180910390fd5b6001546001600160a01b0382811691161480156104f2575060025415155b15610510576040516311bc066560e11b815260040160405180910390fd5b6000546001600160a01b0380831691160361053e57604051634a2fb73f60e11b815260040160405180910390fd5b610547816106f7565b50565b6001546001600160a01b03163314610575576040516311a7f27160e11b815260040160405180910390fd5b62093a80600254426105879190610ae4565b116105a55760405163d39c12bb60e01b815260040160405180910390fd5b6001546104a7906001600160a01b0316610692565b6000546001600160a01b031633146105e5576040516311a8a1bb60e31b815260040160405180910390fd5b6001600160a01b0381166106335760405162461bcd60e51b815260206004820152601160248201527010bd32b937903937b7ba26b0b730b3b2b960791b604482015260640160405180910390fd5b600380546001600160a01b038381166001600160a01b03198316811790935560408051938452911660208301819052917f3124eaf4f16c6ddd81951200c6d8f65d5800753bef06584bd672c8b22c76b487910160405180910390a15050565b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b039092166001600160a01b0319928316178155600255600180549091169055565b42600255600180546001600160a01b0319166001600160a01b0383169081179091556040517f6ab4d119f23076e8ad491bc65ce85f017fb0591dce08755ba8591059cc51737a90600090a250565b60008083601f84011261075757600080fd5b50813567ffffffffffffffff81111561076f57600080fd5b6020830191508360208260051b850101111561078a57600080fd5b9250929050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff811182821017156107d0576107d0610791565b604052919050565b6000806000806000606086880312156107f057600080fd5b67ffffffffffffffff808735111561080757600080fd5b6108148888358901610745565b909650945060208701358181111561082b57600080fd5b61083789828a01610745565b90955093505060408701358181111561084f57600080fd5b8701601f8101891361086057600080fd5b80358281111561087257610872610791565b61088160208260051b016107a7565b8082825260208201915060208360051b85010192508b8311156108a357600080fd5b602084015b838110156109385785813511156108be57600080fd5b803585018d603f8201126108d157600080fd5b6020810135878111156108e6576108e6610791565b6108f9601f8201601f19166020016107a7565b8181528f604083850101111561090e57600080fd5b816040840160208301376000602083830101528086525050506020830192506020810190506108a8565b5080955050505050509295509295909350565b80356001600160a01b038116811461096257600080fd5b919050565b60006020828403121561097957600080fd5b6109828261094b565b9392505050565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b808201808211156109c8576109c861099f565b92915050565b6000815180845260208085019450848260051b86018286016000805b86811015610a42578484038a5282518051808652835b81811015610a1b578281018901518782018a01528801610a00565b5085810188018490529a87019a601f01601f191690940186019350918501916001016109ea565b509198975050505050505050565b6060808252810185905260008660808301825b88811015610a91576001600160a01b03610a7c8461094b565b16825260209283019290910190600101610a63565b5083810360208501528581526001600160fb1b03861115610ab157600080fd5b8560051b9150818760208301370182810360209081016040850152610ad8908201856109ce565b98975050505050505050565b818103818111156109c8576109c861099f56fea26469706673582212205a8375cf438d8e2d3d9141be6896c2c921143b64dc7cdf4c7dd153c884dd0c1964736f6c63430008110033";

type RootManagerPropagateWrapperConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: RootManagerPropagateWrapperConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class RootManagerPropagateWrapper__factory extends ContractFactory {
  constructor(...args: RootManagerPropagateWrapperConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _rootManager: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<RootManagerPropagateWrapper> {
    return super.deploy(
      _rootManager,
      overrides || {}
    ) as Promise<RootManagerPropagateWrapper>;
  }
  override getDeployTransaction(
    _rootManager: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_rootManager, overrides || {});
  }
  override attach(address: string): RootManagerPropagateWrapper {
    return super.attach(address) as RootManagerPropagateWrapper;
  }
  override connect(signer: Signer): RootManagerPropagateWrapper__factory {
    return super.connect(signer) as RootManagerPropagateWrapper__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RootManagerPropagateWrapperInterface {
    return new utils.Interface(_abi) as RootManagerPropagateWrapperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): RootManagerPropagateWrapper {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as RootManagerPropagateWrapper;
  }
}