"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockNumber = exports.getTransactionsByIdsWithUserQuery = exports.getTransactionsByIdsQuery = exports.getTransactionByIdQuery = exports.getReceiverTransactionsQuery = exports.getSenderTransactionsQuery = void 0;
const graphql_request_1 = require("graphql-request");
exports.getSenderTransactionsQuery = graphql_request_1.gql `
  query GetSenderTransactions($userId: String!, $sendingChainId: BigInt!, $status: TransactionStatus) {
    transactions(
      where: { user: $userId, status: $status, sendingChainId: $sendingChainId }
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
exports.getReceiverTransactionsQuery = graphql_request_1.gql `
  query GetReceiverTransactions($userId: String!, $receivingChainId: BigInt!, $status: TransactionStatus) {
    transactions(
      where: { user: $userId, status: $status, receivingChainId: $receivingChainId }
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
exports.getTransactionByIdQuery = graphql_request_1.gql `
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
      #
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
exports.getTransactionsByIdsQuery = graphql_request_1.gql `
  query GetTransactions($transactionIds: [Bytes!]) {
    transactions(where: { transactionId_in: $transactionIds }) {
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
exports.getTransactionsByIdsWithUserQuery = graphql_request_1.gql `
  query GetTransactionsWithUser($transactionIds: [Bytes!], $userId: String!) {
    transactions(where: { transactionId_in: $transactionIds, user: $userId }) {
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
exports.getBlockNumber = graphql_request_1.gql `
  query GetBlockNumber {
    _meta {
      block {
        number
      }
    }
  }
`;
//# sourceMappingURL=queries.js.map