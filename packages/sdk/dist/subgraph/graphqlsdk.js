"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSdk = exports.GetBlockNumberDocument = exports.GetTransactionsWithUserDocument = exports.GetTransactionsDocument = exports.GetTransactionDocument = exports.GetReceiverTransactionsDocument = exports.GetSenderTransactionsDocument = exports._SubgraphErrorPolicy_ = exports.User_OrderBy = exports.Transaction_OrderBy = exports.TransactionStatus = exports.Router_OrderBy = exports.OrderDirection = exports.AssetBalance_OrderBy = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
var AssetBalance_OrderBy;
(function (AssetBalance_OrderBy) {
    AssetBalance_OrderBy["Id"] = "id";
    AssetBalance_OrderBy["Amount"] = "amount";
    AssetBalance_OrderBy["Router"] = "router";
    AssetBalance_OrderBy["AssetId"] = "assetId";
})(AssetBalance_OrderBy = exports.AssetBalance_OrderBy || (exports.AssetBalance_OrderBy = {}));
var OrderDirection;
(function (OrderDirection) {
    OrderDirection["Asc"] = "asc";
    OrderDirection["Desc"] = "desc";
})(OrderDirection = exports.OrderDirection || (exports.OrderDirection = {}));
var Router_OrderBy;
(function (Router_OrderBy) {
    Router_OrderBy["Id"] = "id";
    Router_OrderBy["AssetBalances"] = "assetBalances";
    Router_OrderBy["Transactions"] = "transactions";
})(Router_OrderBy = exports.Router_OrderBy || (exports.Router_OrderBy = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["Prepared"] = "Prepared";
    TransactionStatus["Fulfilled"] = "Fulfilled";
    TransactionStatus["Cancelled"] = "Cancelled";
})(TransactionStatus = exports.TransactionStatus || (exports.TransactionStatus = {}));
var Transaction_OrderBy;
(function (Transaction_OrderBy) {
    Transaction_OrderBy["Id"] = "id";
    Transaction_OrderBy["Status"] = "status";
    Transaction_OrderBy["ChainId"] = "chainId";
    Transaction_OrderBy["PreparedTimestamp"] = "preparedTimestamp";
    Transaction_OrderBy["ReceivingChainTxManagerAddress"] = "receivingChainTxManagerAddress";
    Transaction_OrderBy["User"] = "user";
    Transaction_OrderBy["Router"] = "router";
    Transaction_OrderBy["Initiator"] = "initiator";
    Transaction_OrderBy["SendingAssetId"] = "sendingAssetId";
    Transaction_OrderBy["ReceivingAssetId"] = "receivingAssetId";
    Transaction_OrderBy["SendingChainFallback"] = "sendingChainFallback";
    Transaction_OrderBy["CallTo"] = "callTo";
    Transaction_OrderBy["ReceivingAddress"] = "receivingAddress";
    Transaction_OrderBy["CallDataHash"] = "callDataHash";
    Transaction_OrderBy["TransactionId"] = "transactionId";
    Transaction_OrderBy["SendingChainId"] = "sendingChainId";
    Transaction_OrderBy["ReceivingChainId"] = "receivingChainId";
    Transaction_OrderBy["Amount"] = "amount";
    Transaction_OrderBy["Expiry"] = "expiry";
    Transaction_OrderBy["PreparedBlockNumber"] = "preparedBlockNumber";
    Transaction_OrderBy["EncryptedCallData"] = "encryptedCallData";
    Transaction_OrderBy["PrepareCaller"] = "prepareCaller";
    Transaction_OrderBy["BidSignature"] = "bidSignature";
    Transaction_OrderBy["EncodedBid"] = "encodedBid";
    Transaction_OrderBy["PrepareTransactionHash"] = "prepareTransactionHash";
    Transaction_OrderBy["PrepareMeta"] = "prepareMeta";
    Transaction_OrderBy["RelayerFee"] = "relayerFee";
    Transaction_OrderBy["Signature"] = "signature";
    Transaction_OrderBy["CallData"] = "callData";
    Transaction_OrderBy["ExternalCallSuccess"] = "externalCallSuccess";
    Transaction_OrderBy["ExternalCallIsContract"] = "externalCallIsContract";
    Transaction_OrderBy["ExternalCallReturnData"] = "externalCallReturnData";
    Transaction_OrderBy["FulfillCaller"] = "fulfillCaller";
    Transaction_OrderBy["FulfillTransactionHash"] = "fulfillTransactionHash";
    Transaction_OrderBy["FulfillMeta"] = "fulfillMeta";
    Transaction_OrderBy["FulfillTimestamp"] = "fulfillTimestamp";
    Transaction_OrderBy["CancelCaller"] = "cancelCaller";
    Transaction_OrderBy["CancelTransactionHash"] = "cancelTransactionHash";
    Transaction_OrderBy["CancelMeta"] = "cancelMeta";
    Transaction_OrderBy["CancelTimestamp"] = "cancelTimestamp";
})(Transaction_OrderBy = exports.Transaction_OrderBy || (exports.Transaction_OrderBy = {}));
var User_OrderBy;
(function (User_OrderBy) {
    User_OrderBy["Id"] = "id";
    User_OrderBy["Transactions"] = "transactions";
})(User_OrderBy = exports.User_OrderBy || (exports.User_OrderBy = {}));
var _SubgraphErrorPolicy_;
(function (_SubgraphErrorPolicy_) {
    /** Data will be returned even if the subgraph has indexing errors */
    _SubgraphErrorPolicy_["Allow"] = "allow";
    /** If the subgraph has indexing errors, data will be omitted. The default. */
    _SubgraphErrorPolicy_["Deny"] = "deny";
})(_SubgraphErrorPolicy_ = exports._SubgraphErrorPolicy_ || (exports._SubgraphErrorPolicy_ = {}));
exports.GetSenderTransactionsDocument = graphql_tag_1.default `
    query GetSenderTransactions($userId: String!, $sendingChainId: BigInt!, $status: TransactionStatus) {
  transactions(
    where: {user: $userId, status: $status, sendingChainId: $sendingChainId}
    orderBy: preparedBlockNumber
    orderDirection: desc
  ) {
    id
    status
    chainId
    preparedTimestamp
    user {
      id
    }
    router {
      id
    }
    initiator
    receivingChainTxManagerAddress
    sendingAssetId
    receivingAssetId
    sendingChainFallback
    receivingAddress
    callTo
    sendingChainId
    receivingChainId
    callDataHash
    transactionId
    amount
    expiry
    preparedBlockNumber
    encryptedCallData
    encodedBid
    bidSignature
    prepareCaller
    fulfillCaller
    cancelCaller
    prepareTransactionHash
    fulfillTransactionHash
    cancelTransactionHash
  }
}
    `;
exports.GetReceiverTransactionsDocument = graphql_tag_1.default `
    query GetReceiverTransactions($userId: String!, $receivingChainId: BigInt!, $status: TransactionStatus) {
  transactions(
    where: {user: $userId, status: $status, receivingChainId: $receivingChainId}
    orderBy: preparedBlockNumber
    orderDirection: desc
  ) {
    id
    status
    chainId
    preparedTimestamp
    user {
      id
    }
    router {
      id
    }
    initiator
    receivingChainTxManagerAddress
    sendingAssetId
    receivingAssetId
    sendingChainFallback
    receivingAddress
    callTo
    sendingChainId
    receivingChainId
    callDataHash
    transactionId
    amount
    expiry
    preparedBlockNumber
    encryptedCallData
    encodedBid
    bidSignature
    prepareCaller
    fulfillCaller
    cancelCaller
    prepareTransactionHash
    fulfillTransactionHash
    cancelTransactionHash
  }
}
    `;
exports.GetTransactionDocument = graphql_tag_1.default `
    query GetTransaction($transactionId: ID!) {
  transaction(id: $transactionId) {
    id
    status
    chainId
    preparedTimestamp
    user {
      id
    }
    router {
      id
    }
    initiator
    receivingChainTxManagerAddress
    sendingAssetId
    receivingAssetId
    sendingChainFallback
    receivingAddress
    callTo
    sendingChainId
    receivingChainId
    callDataHash
    transactionId
    amount
    expiry
    preparedBlockNumber
    encryptedCallData
    encodedBid
    bidSignature
    relayerFee
    signature
    prepareCaller
    fulfillCaller
    cancelCaller
    prepareTransactionHash
    fulfillTransactionHash
    cancelTransactionHash
  }
}
    `;
exports.GetTransactionsDocument = graphql_tag_1.default `
    query GetTransactions($transactionIds: [Bytes!]) {
  transactions(where: {transactionId_in: $transactionIds}) {
    id
    status
    chainId
    preparedTimestamp
    user {
      id
    }
    router {
      id
    }
    initiator
    receivingChainTxManagerAddress
    sendingAssetId
    receivingAssetId
    sendingChainFallback
    receivingAddress
    callTo
    sendingChainId
    receivingChainId
    callDataHash
    transactionId
    amount
    expiry
    preparedBlockNumber
    encryptedCallData
    encodedBid
    bidSignature
    relayerFee
    signature
    callData
    prepareCaller
    fulfillCaller
    cancelCaller
    prepareTransactionHash
    fulfillTransactionHash
    cancelTransactionHash
  }
}
    `;
exports.GetTransactionsWithUserDocument = graphql_tag_1.default `
    query GetTransactionsWithUser($transactionIds: [Bytes!], $userId: String!) {
  transactions(where: {transactionId_in: $transactionIds, user: $userId}) {
    id
    status
    chainId
    preparedTimestamp
    user {
      id
    }
    router {
      id
    }
    initiator
    receivingChainTxManagerAddress
    sendingAssetId
    receivingAssetId
    sendingChainFallback
    receivingAddress
    callTo
    sendingChainId
    receivingChainId
    callDataHash
    transactionId
    amount
    expiry
    preparedBlockNumber
    encryptedCallData
    encodedBid
    bidSignature
    relayerFee
    signature
    callData
    prepareCaller
    fulfillCaller
    cancelCaller
    prepareTransactionHash
    fulfillTransactionHash
    cancelTransactionHash
  }
}
    `;
exports.GetBlockNumberDocument = graphql_tag_1.default `
    query GetBlockNumber {
  _meta {
    block {
      number
    }
  }
}
    `;
const defaultWrapper = (action, _operationName) => action();
function getSdk(client, withWrapper = defaultWrapper) {
    return {
        GetSenderTransactions(variables, requestHeaders) {
            return withWrapper((wrappedRequestHeaders) => client.request(exports.GetSenderTransactionsDocument, variables, { ...requestHeaders, ...wrappedRequestHeaders }), 'GetSenderTransactions');
        },
        GetReceiverTransactions(variables, requestHeaders) {
            return withWrapper((wrappedRequestHeaders) => client.request(exports.GetReceiverTransactionsDocument, variables, { ...requestHeaders, ...wrappedRequestHeaders }), 'GetReceiverTransactions');
        },
        GetTransaction(variables, requestHeaders) {
            return withWrapper((wrappedRequestHeaders) => client.request(exports.GetTransactionDocument, variables, { ...requestHeaders, ...wrappedRequestHeaders }), 'GetTransaction');
        },
        GetTransactions(variables, requestHeaders) {
            return withWrapper((wrappedRequestHeaders) => client.request(exports.GetTransactionsDocument, variables, { ...requestHeaders, ...wrappedRequestHeaders }), 'GetTransactions');
        },
        GetTransactionsWithUser(variables, requestHeaders) {
            return withWrapper((wrappedRequestHeaders) => client.request(exports.GetTransactionsWithUserDocument, variables, { ...requestHeaders, ...wrappedRequestHeaders }), 'GetTransactionsWithUser');
        },
        GetBlockNumber(variables, requestHeaders) {
            return withWrapper((wrappedRequestHeaders) => client.request(exports.GetBlockNumberDocument, variables, { ...requestHeaders, ...wrappedRequestHeaders }), 'GetBlockNumber');
        }
    };
}
exports.getSdk = getSdk;
//# sourceMappingURL=graphqlsdk.js.map