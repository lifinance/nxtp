/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  Replica,
  ReplicaInterface,
} from "../../../../contracts/nomad-core/contracts/Replica";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_localDomain",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "_processGas",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_reserveGas",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "oldRoot",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32[2]",
        name: "newRoot",
        type: "bytes32[2]",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "signature2",
        type: "bytes",
      },
    ],
    name: "DoubleUpdate",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "oldUpdater",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newUpdater",
        type: "address",
      },
    ],
    name: "NewUpdater",
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
        indexed: true,
        internalType: "bytes32",
        name: "messageHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bool",
        name: "success",
        type: "bool",
      },
      {
        indexed: true,
        internalType: "bytes",
        name: "returnData",
        type: "bytes",
      },
    ],
    name: "Process",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "root",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "previousConfirmAt",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newConfirmAt",
        type: "uint256",
      },
    ],
    name: "SetConfirmation",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "timeout",
        type: "uint256",
      },
    ],
    name: "SetOptimisticTimeout",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint32",
        name: "homeDomain",
        type: "uint32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "oldRoot",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newRoot",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "Update",
    type: "event",
  },
  {
    inputs: [],
    name: "PROCESS_GAS",
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
    name: "RESERVE_GAS",
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
    name: "VERSION",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_root",
        type: "bytes32",
      },
    ],
    name: "acceptableRoot",
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
    name: "committedRoot",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "confirmAt",
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
    inputs: [
      {
        internalType: "bytes32",
        name: "_oldRoot",
        type: "bytes32",
      },
      {
        internalType: "bytes32[2]",
        name: "_newRoot",
        type: "bytes32[2]",
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "_signature2",
        type: "bytes",
      },
    ],
    name: "doubleUpdate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "homeDomainHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_remoteDomain",
        type: "uint32",
      },
      {
        internalType: "address",
        name: "_updater",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_committedRoot",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "_optimisticSeconds",
        type: "uint256",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "localDomain",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "messages",
    outputs: [
      {
        internalType: "enum Replica.MessageStatus",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "optimisticSeconds",
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
        internalType: "bytes",
        name: "_message",
        type: "bytes",
      },
    ],
    name: "process",
    outputs: [
      {
        internalType: "bool",
        name: "_success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_leaf",
        type: "bytes32",
      },
      {
        internalType: "bytes32[32]",
        name: "_proof",
        type: "bytes32[32]",
      },
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
    ],
    name: "prove",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_message",
        type: "bytes",
      },
      {
        internalType: "bytes32[32]",
        name: "_proof",
        type: "bytes32[32]",
      },
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
    ],
    name: "proveAndProcess",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "remoteDomain",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
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
    inputs: [
      {
        internalType: "bytes32",
        name: "_root",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "_confirmAt",
        type: "uint256",
      },
    ],
    name: "setConfirmation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_optimisticSeconds",
        type: "uint256",
      },
    ],
    name: "setOptimisticTimeout",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_updater",
        type: "address",
      },
    ],
    name: "setUpdater",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "state",
    outputs: [
      {
        internalType: "enum NomadBase.States",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_oldRoot",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_newRoot",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "_signature",
        type: "bytes",
      },
    ],
    name: "update",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "updater",
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
];

const _bytecode =
  "0x60e06040523480156200001157600080fd5b50604051620025d2380380620025d28339810160408190526200003491620000d9565b63ffffffff8316608052620cf850821015620000865760405162461bcd60e51b815260206004820152600c60248201526b2170726f636573732067617360a01b60448201526064015b60405180910390fd5b613a98811015620000c95760405162461bcd60e51b815260206004820152600c60248201526b21726573657276652067617360a01b60448201526064016200007d565b60a09190915260c052506200011b565b600080600060608486031215620000ef57600080fd5b835163ffffffff811681146200010457600080fd5b602085015160409095015190969495509392505050565b60805160a05160c05161246b62000167600039600081816101a5015261091a01526000818161036b0152818161093b01526109c201526000818161029a01526107ce015261246b6000f3fe608060405234801561001057600080fd5b50600436106101735760003560e01c80638d3638f4116100de578063b31c01fb11610097578063df034cd011610071578063df034cd01461038d578063e7e7a7b7146103a0578063f2fde38b146103b3578063ffa1ad74146103c657600080fd5b8063b31c01fb1461033f578063c19d93fb14610352578063d88beda21461036657600080fd5b80638d3638f4146102955780638da5cb5b146102d1578063928bc4b2146102f6578063961681dc146103095780639d54f41914610319578063a3f81d681461032c57600080fd5b806345630b1a1161013057806345630b1a146102365780636188af0e1461023e57806367a6771d14610251578063715018a61461025a57806371bfb7b814610262578063885b5e2d1461028257600080fd5b8063088b5ed31461017857806319d9d21a1461018d57806325e3beda146101a05780632bbd59ca146101da578063371d30711461020a578063399926681461022d575b600080fd5b61018b610186366004611d1d565b6103e0565b005b61018b61019b366004611d81565b610469565b6101c77f000000000000000000000000000000000000000000000000000000000000000081565b6040519081526020015b60405180910390f35b6101fd6101e8366004611e10565b609a6020526000908152604090205460ff1681565b6040516101d19190611e5d565b61021d610218366004611e82565b6105ce565b60405190151581526020016101d1565b6101c760975481565b6101c76106ad565b61018b61024c366004611f5d565b6106c7565b6101c760665481565b61018b61071d565b6101c7610270366004611e10565b60996020526000908152604090205481565b61018b610290366004611e10565b610753565b6102bc7f000000000000000000000000000000000000000000000000000000000000000081565b60405163ffffffff90911681526020016101d1565b6033546001600160a01b03165b6040516001600160a01b0390911681526020016101d1565b61021d610304366004611fa6565b6107b8565b6096546102bc9063ffffffff1681565b61018b610327366004611ff7565b610b06565b61021d61033a366004611e10565b610b3c565b61018b61034d366004612012565b610b64565b6065546101fd90600160a01b900460ff1681565b6101c77f000000000000000000000000000000000000000000000000000000000000000081565b6065546102de906001600160a01b031681565b61018b6103ae366004612062565b610cbe565b61018b6103c1366004611ff7565b610db2565b6103ce600081565b60405160ff90911681526020016101d1565b6033546001600160a01b031633146104135760405162461bcd60e51b815260040161040a906120af565b60405180910390fd5b60008281526099602090815260409182902080549084905582518181529182018490529184917fe906d465281862f8f37a1bdd7d810e50347f06b0b493701cca6ccb8e6a7b2694910160405180910390a2505050565b6002606554600160a01b900460ff16600281111561048957610489611e29565b036104c55760405162461bcd60e51b815260206004820152600c60248201526b6661696c656420737461746560a01b604482015260640161040a565b604080516020601f86018190048102820181019092528481526105079188918835918890889081908401838280828437600092019190915250610e4a92505050565b8015610556575061055686866001602002013584848080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250610e4a92505050565b801561056757508435602086013514155b156105c6576105846065805460ff60a01b1916600160a11b179055565b7f2c3f60bab4170347826231b75a920b5053941ddebc6eed6fd2c25721648b186f8686868686866040516105bd96959493929190612123565b60405180910390a15b505050505050565b6000806000858152609a602052604090205460ff1660028111156105f4576105f4611e29565b146106375760405162461bcd60e51b8152602060048201526013602482015272214d6573736167655374617475732e4e6f6e6560681b604482015260640161040a565b600061066d858560208060200260405190810160405280929190826020800280828437600092019190915250879150610ebd9050565b905061067881610b3c565b156106a05750506000838152609a60205260409020805460ff191660019081179091556106a6565b60009150505b9392505050565b6096546000906106c29063ffffffff16610f6e565b905090565b6106d9838051906020012083836105ce565b61070e5760405162461bcd60e51b81526020600482015260066024820152652170726f766560d01b604482015260640161040a565b610717836107b8565b50505050565b6033546001600160a01b031633146107475760405162461bcd60e51b815260040161040a906120af565b6107516000610fb7565b565b6033546001600160a01b0316331461077d5760405162461bcd60e51b815260040161040a906120af565b60978190556040518181527fa8de34d9c26dbb20579bc8c8957813e3168af7c5092d7668390e34471dc4ffb49060200160405180910390a150565b6000806107c58382611009565b905063ffffffff7f0000000000000000000000000000000000000000000000000000000000000000166107fd62ffffff19831661102f565b63ffffffff161461083f5760405162461bcd60e51b815260206004820152600c60248201526b10b232b9ba34b730ba34b7b760a11b604482015260640161040a565b600061085062ffffff198316611044565b905060016000828152609a602052604090205460ff16600281111561087757610877611e29565b146108ae5760405162461bcd60e51b815260206004820152600760248201526610b83937bb32b760c91b604482015260640161040a565b60985460ff166001146108f05760405162461bcd60e51b815260206004820152600a602482015269085c99595b9d1c985b9d60b21b604482015260640161040a565b6098805460ff199081169091556000828152609a602052604090208054909116600217905561095f7f00000000000000000000000000000000000000000000000000000000000000007f000000000000000000000000000000000000000000000000000000000000000061217b565b5a10156109975760405162461bcd60e51b815260040161040a906020808252600490820152632167617360e01b604082015260600190565b60006109a862ffffff19841661108d565b6040805161010080825261012082019092529192506000917f0000000000000000000000000000000000000000000000000000000000000000908390836020820181803683370190505090506000610a0562ffffff19891661109e565b610a1462ffffff198a166110b2565b610a2362ffffff198b166110c7565b610a40610a3562ffffff198d166110dc565b62ffffff191661110a565b604051602401610a5394939291906121eb565b60408051601f198184030181529190526020810180516001600160e01b031663ab2dc3f560e01b17815281519192506000918291828a88f198503d945083851115610a9c578394505b848252846000602084013e81604051610ab5919061221a565b604051908190038120908a15159089907fd42de95a9b26f1be134c8ecce389dc4fcfa18753d01661b7b361233569e8fe4890600090a450506098805460ff1916600117905550949695505050505050565b6033546001600160a01b03163314610b305760405162461bcd60e51b815260040161040a906120af565b610b3981611153565b50565b600081815260996020526040812054808203610b5b5750600092915050565b42101592915050565b6002606554600160a01b900460ff166002811115610b8457610b84611e29565b03610bc05760405162461bcd60e51b815260206004820152600c60248201526b6661696c656420737461746560a01b604482015260640161040a565b6066548314610c065760405162461bcd60e51b81526020600482015260126024820152716e6f742063757272656e742075706461746560701b604482015260640161040a565b610c11838383610e4a565b610c4c5760405162461bcd60e51b815260206004820152600c60248201526b21757064617465722073696760a01b604482015260640161040a565b609754610c59904261217b565b6000838152609960205260409081902091909155606683905560965490518391859163ffffffff909116907f608828ad904a0c9250c09004ba7226efb08f35a5c815bb3f76b5a8a271cd08b290610cb1908690612236565b60405180910390a4505050565b600054610100900460ff16610cd95760005460ff1615610cdd565b303b155b610cf95760405162461bcd60e51b815260040161040a90612249565b600054610100900460ff16158015610d1b576000805461ffff19166101011790555b610d24846111b4565b60988054600160ff1990911681179091556096805463ffffffff191663ffffffff88161790556066849055600084815260996020908152604091829020929092556097849055518381527fa8de34d9c26dbb20579bc8c8957813e3168af7c5092d7668390e34471dc4ffb4910160405180910390a18015610dab576000805461ff00191690555b5050505050565b6033546001600160a01b03163314610ddc5760405162461bcd60e51b815260040161040a906120af565b6001600160a01b038116610e415760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b606482015260840161040a565b610b3981610fb7565b600080610e556106ad565b604080516020810192909252810186905260608101859052608001604051602081830303815290604052805190602001209050610e918161124b565b6065549091506001600160a01b0316610eaa8285611286565b6001600160a01b03161495945050505050565b8260005b6020811015610f6657600183821c166000858360208110610ee457610ee46120e4565b6020020151905081600103610f24576040805160208101839052908101859052606001604051602081830303815290604052805190602001209350610f51565b60408051602081018690529081018290526060016040516020818303038152906040528051906020012093505b50508080610f5e90612297565b915050610ec1565b509392505050565b6040516001600160e01b031960e083901b166020820152641393d3505160da1b60248201526000906029015b604051602081830303815290604052805190602001209050919050565b603380546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b81516000906020840161102464ffffffffff851682846112a2565b925050505b92915050565b600061102962ffffff198316602860046112e9565b60008061105a8360781c6001600160601b031690565b6001600160601b03169050600061107a8460181c6001600160601b031690565b6001600160601b03169091209392505050565b600061102961109b83611319565b90565b600061102962ffffff1983168260046112e9565b600061102962ffffff198316602460046112e9565b600061102962ffffff1983166004602061132a565b6000611029604c6110fa81601886901c6001600160601b03166122b0565b62ffffff19851691906000611486565b60606000806111228460181c6001600160601b031690565b6001600160601b0316905060405191508192506111428483602001611502565b508181016020016040529052919050565b606580546001600160a01b038381166001600160a01b031983168117909355604080519190921680825260208201939093527f0f20622a7af9e952a6fec654a196f29e04477b5d335772c26902bec35cc9f22a910160405180910390a15050565b600054610100900460ff166111cf5760005460ff16156111d3565b303b155b6111ef5760405162461bcd60e51b815260040161040a90612249565b600054610100900460ff16158015611211576000805461ffff19166101011790555b611219611663565b61122282611153565b6065805460ff60a01b1916600160a01b1790558015611247576000805461ff00191690555b5050565b6040517f19457468657265756d205369676e6564204d6573736167653a0a3332000000006020820152603c8101829052600090605c01610f9a565b60008060006112958585611692565b91509150610f6681611700565b6000806112af838561217b565b90506040518111156112bf575060005b806000036112d45762ffffff199150506106a6565b5050606092831b9190911790911b1760181b90565b60006112f68260206122c7565b6113019060086122ea565b60ff1661130f85858561132a565b901c949350505050565b600061102962ffffff198316602c60205b60008160ff1660000361133f575060006106a6565b6113528460181c6001600160601b031690565b6001600160601b031661136860ff84168561217b565b11156113cc576113b36113848560781c6001600160601b031690565b6001600160601b03166113a08660181c6001600160601b031690565b6001600160601b0316858560ff166118b6565b60405162461bcd60e51b815260040161040a9190612236565b60208260ff1611156114465760405162461bcd60e51b815260206004820152603a60248201527f54797065644d656d566965772f696e646578202d20417474656d70746564207460448201527f6f20696e646578206d6f7265207468616e203332206279746573000000000000606482015260840161040a565b60088202600061145f8660781c6001600160601b031690565b6001600160601b031690506000600160ff1b60001984011d91909501511695945050505050565b60008061149c8660781c6001600160601b031690565b6001600160601b031690506114b086611924565b846114bb878461217b565b6114c5919061217b565b11156114d85762ffffff199150506114fa565b6114e2858261217b565b90506114f68364ffffffffff1682866112a2565b9150505b949350505050565b600062ffffff198084160361156a5760405162461bcd60e51b815260206004820152602860248201527f54797065644d656d566965772f636f7079546f202d204e756c6c20706f696e7460448201526732b9103232b932b360c11b606482015260840161040a565b6115738361195d565b6115d35760405162461bcd60e51b815260206004820152602b60248201527f54797065644d656d566965772f636f7079546f202d20496e76616c696420706f60448201526a34b73a32b9103232b932b360a91b606482015260840161040a565b60006115e88460181c6001600160601b031690565b6001600160601b0316905060006116088560781c6001600160601b031690565b6001600160601b0316905060006040519050848111156116285760206060fd5b8285848460045afa5061165961163e8760d81c90565b64ffffffffff60601b606091821b168717901b841760181b90565b9695505050505050565b600054610100900460ff1661168a5760405162461bcd60e51b815260040161040a90612313565b61075161199a565b60008082516041036116c85760208301516040840151606085015160001a6116bc878285856119ca565b945094505050506116f9565b82516040036116f157602083015160408401516116e6868383611ab7565b9350935050506116f9565b506000905060025b9250929050565b600081600481111561171457611714611e29565b0361171c5750565b600181600481111561173057611730611e29565b0361177d5760405162461bcd60e51b815260206004820152601860248201527f45434453413a20696e76616c6964207369676e61747572650000000000000000604482015260640161040a565b600281600481111561179157611791611e29565b036117de5760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e67746800604482015260640161040a565b60038160048111156117f2576117f2611e29565b0361184a5760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604482015261756560f01b606482015260840161040a565b600481600481111561185e5761185e611e29565b03610b395760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202776272076616c604482015261756560f01b606482015260840161040a565b606060006118c386611af0565b91505060006118d186611af0565b91505060006118df86611af0565b91505060006118ed86611af0565b91505083838383604051602001611907949392919061235e565b604051602081830303815290604052945050505050949350505050565b60006119398260181c6001600160601b031690565b61194c8360781c6001600160601b031690565b016001600160601b03169050919050565b60006119698260d81c90565b64ffffffffff1664ffffffffff0361198357506000919050565b600061198e83611924565b60405110199392505050565b600054610100900460ff166119c15760405162461bcd60e51b815260040161040a90612313565b61075133610fb7565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0831115611a015750600090506003611aae565b8460ff16601b14158015611a1957508460ff16601c14155b15611a2a5750600090506004611aae565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa158015611a7e573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b038116611aa757600060019250925050611aae565b9150600090505b94509492505050565b6000806001600160ff1b03831681611ad460ff86901c601b61217b565b9050611ae2878288856119ca565b935093505050935093915050565b600080601f5b600f8160ff161115611b45576000611b0f8260086122ea565b60ff1685901c9050611b2081611b9e565b61ffff16841793508160ff16601014611b3b57601084901b93505b5060001901611af6565b50600f5b60ff8160ff161015611b98576000611b628260086122ea565b60ff1685901c9050611b7381611b9e565b61ffff16831792508160ff16600014611b8e57601083901b92505b5060001901611b49565b50915091565b6000611bb060048360ff16901c611bd0565b60ff1661ffff919091161760081b611bc782611bd0565b60ff1617919050565b600060f08083179060ff82169003611beb5750603092915050565b8060ff1660f103611bff5750603192915050565b8060ff1660f203611c135750603292915050565b8060ff1660f303611c275750603392915050565b8060ff1660f403611c3b5750603492915050565b8060ff1660f503611c4f5750603592915050565b8060ff1660f603611c635750603692915050565b8060ff1660f703611c775750603792915050565b8060ff1660f803611c8b5750603892915050565b8060ff1660f903611c9f5750603992915050565b8060ff1660fa03611cb35750606192915050565b8060ff1660fb03611cc75750606292915050565b8060ff1660fc03611cdb5750606392915050565b8060ff1660fd03611cef5750606492915050565b8060ff1660fe03611d035750606592915050565b8060ff1660ff03611d175750606692915050565b50919050565b60008060408385031215611d3057600080fd5b50508035926020909101359150565b60008083601f840112611d5157600080fd5b50813567ffffffffffffffff811115611d6957600080fd5b6020830191508360208285010111156116f957600080fd5b60008060008060008060a08789031215611d9a57600080fd5b863595506060870188811115611daf57600080fd5b6020880195503567ffffffffffffffff80821115611dcc57600080fd5b611dd88a838b01611d3f565b90965094506080890135915080821115611df157600080fd5b50611dfe89828a01611d3f565b979a9699509497509295939492505050565b600060208284031215611e2257600080fd5b5035919050565b634e487b7160e01b600052602160045260246000fd5b60038110610b3957634e487b7160e01b600052602160045260246000fd5b60208101611e6a83611e3f565b91905290565b80610400810183101561102957600080fd5b60008060006104408486031215611e9857600080fd5b83359250611ea98560208601611e70565b915061042084013590509250925092565b634e487b7160e01b600052604160045260246000fd5b600082601f830112611ee157600080fd5b813567ffffffffffffffff80821115611efc57611efc611eba565b604051601f8301601f19908116603f01168101908282118183101715611f2457611f24611eba565b81604052838152866020858801011115611f3d57600080fd5b836020870160208301376000602085830101528094505050505092915050565b60008060006104408486031215611f7357600080fd5b833567ffffffffffffffff811115611f8a57600080fd5b611f9686828701611ed0565b935050611ea98560208601611e70565b600060208284031215611fb857600080fd5b813567ffffffffffffffff811115611fcf57600080fd5b6114fa84828501611ed0565b80356001600160a01b0381168114611ff257600080fd5b919050565b60006020828403121561200957600080fd5b6106a682611fdb565b60008060006060848603121561202757600080fd5b8335925060208401359150604084013567ffffffffffffffff81111561204c57600080fd5b61205886828701611ed0565b9150509250925092565b6000806000806080858703121561207857600080fd5b843563ffffffff8116811461208c57600080fd5b935061209a60208601611fdb565b93969395505050506040820135916060013590565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b634e487b7160e01b600052603260045260246000fd5b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b868152604086602083013760a06060820152600061214560a0830186886120fa565b82810360808401526121588185876120fa565b9998505050505050505050565b634e487b7160e01b600052601160045260246000fd5b6000821982111561218e5761218e612165565b500190565b60005b838110156121ae578181015183820152602001612196565b838111156107175750506000910152565b600081518084526121d7816020860160208601612193565b601f01601f19169290920160200192915050565b600063ffffffff80871683528086166020840152508360408301526080606083015261165960808301846121bf565b6000825161222c818460208701612193565b9190910192915050565b6020815260006106a660208301846121bf565b6020808252602e908201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160408201526d191e481a5b9a5d1a585b1a5e995960921b606082015260800190565b6000600182016122a9576122a9612165565b5060010190565b6000828210156122c2576122c2612165565b500390565b600060ff821660ff8416808210156122e1576122e1612165565b90039392505050565b600060ff821660ff84168160ff048111821515161561230b5761230b612165565b029392505050565b6020808252602b908201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960408201526a6e697469616c697a696e6760a81b606082015260800190565b7f54797065644d656d566965772f696e646578202d204f76657272616e20746865815274040ecd2caee5c40a6d8d2c6ca40d2e640c2e84060f605b1b60208201526001600160d01b031960d086811b821660358401526e040eed2e8d040d8cadccee8d04060f608b1b603b840181905286821b8316604a8501527f2e20417474656d7074656420746f20696e646578206174206f666673657420306050850152600f60fb1b607085015285821b83166071850152607784015283901b166086820152601760f91b608c8201526000608d820161165956fea264697066735822122062b8748ec5c176071cc1169e25d6bdf8290205f0a91b90d23f1be1781b4ed6cf64736f6c634300080f0033";

type ReplicaConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ReplicaConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Replica__factory extends ContractFactory {
  constructor(...args: ReplicaConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _localDomain: PromiseOrValue<BigNumberish>,
    _processGas: PromiseOrValue<BigNumberish>,
    _reserveGas: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Replica> {
    return super.deploy(
      _localDomain,
      _processGas,
      _reserveGas,
      overrides || {}
    ) as Promise<Replica>;
  }
  override getDeployTransaction(
    _localDomain: PromiseOrValue<BigNumberish>,
    _processGas: PromiseOrValue<BigNumberish>,
    _reserveGas: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _localDomain,
      _processGas,
      _reserveGas,
      overrides || {}
    );
  }
  override attach(address: string): Replica {
    return super.attach(address) as Replica;
  }
  override connect(signer: Signer): Replica__factory {
    return super.connect(signer) as Replica__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ReplicaInterface {
    return new utils.Interface(_abi) as ReplicaInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Replica {
    return new Contract(address, _abi, signerOrProvider) as Replica;
  }
}