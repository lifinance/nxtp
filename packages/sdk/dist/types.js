"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoricalTransactionStatus = exports.NxtpSdkEvents = exports.CancelSchema = exports.ApproveSchema = exports.AuctionBidParamsSchema = exports.GetTransferQuoteSchema = exports.CrossChainParamsSchema = exports.NetworkSchema = exports.LogLevelScehma = exports.SdkBaseChainConfigSchema = void 0;
const nxtp_utils_1 = require("@connext/nxtp-utils");
const typebox_1 = require("@sinclair/typebox");
exports.SdkBaseChainConfigSchema = typebox_1.Type.Record(typebox_1.Type.Number(), typebox_1.Type.Object({
    providers: typebox_1.Type.Union([
        typebox_1.Type.Array(typebox_1.Type.String()),
        typebox_1.Type.String(),
        typebox_1.Type.Array(typebox_1.Type.Object({ url: typebox_1.Type.String(), user: typebox_1.Type.Optional(typebox_1.Type.String()), password: typebox_1.Type.Optional(typebox_1.Type.String()) })),
    ]),
    transactionManagerAddress: typebox_1.Type.Optional(typebox_1.Type.String()),
    priceOracleAddress: typebox_1.Type.Optional(typebox_1.Type.String()),
    subgraph: typebox_1.Type.Optional(typebox_1.Type.String()),
    subgraphSyncBuffer: typebox_1.Type.Optional(typebox_1.Type.Number()),
}));
exports.LogLevelScehma = typebox_1.Type.Union([
    typebox_1.Type.Literal("fatal"),
    typebox_1.Type.Literal("error"),
    typebox_1.Type.Literal("warn"),
    typebox_1.Type.Literal("info"),
    typebox_1.Type.Literal("debug"),
    typebox_1.Type.Literal("trace"),
    typebox_1.Type.Literal("silent"),
]);
exports.NetworkSchema = typebox_1.Type.Union([typebox_1.Type.Literal("local"), typebox_1.Type.Literal("testnet"), typebox_1.Type.Literal("mainnet")]);
exports.CrossChainParamsSchema = typebox_1.Type.Object({
    sendingChainId: nxtp_utils_1.TChainId,
    sendingAssetId: nxtp_utils_1.TAddress,
    receivingChainId: nxtp_utils_1.TChainId,
    receivingAssetId: nxtp_utils_1.TAddress,
    receivingAddress: nxtp_utils_1.TAddress,
    amount: nxtp_utils_1.TIntegerString,
    callTo: typebox_1.Type.Optional(nxtp_utils_1.TAddress),
    callData: typebox_1.Type.Optional(typebox_1.Type.RegEx(/^0x[a-fA-F0-9]*$/)),
    encryptedCallData: typebox_1.Type.Optional(typebox_1.Type.String()),
    expiry: typebox_1.Type.Optional(typebox_1.Type.Number()),
    transactionId: typebox_1.Type.Optional(typebox_1.Type.RegEx(/^0x[a-fA-F0-9]{64}$/)),
    slippageTolerance: typebox_1.Type.Optional(typebox_1.Type.String()),
    dryRun: typebox_1.Type.Optional(typebox_1.Type.Boolean()),
    preferredRouters: typebox_1.Type.Optional(typebox_1.Type.Array(nxtp_utils_1.TAddress)),
    initiator: typebox_1.Type.Optional(nxtp_utils_1.TAddress),
    auctionWaitTimeMs: typebox_1.Type.Optional(typebox_1.Type.Number()),
    numAuctionResponsesQuorum: typebox_1.Type.Optional(typebox_1.Type.Number()),
    relayerFee: typebox_1.Type.Optional(nxtp_utils_1.TIntegerString),
    callDataGas: typebox_1.Type.Optional(nxtp_utils_1.TIntegerString),
});
exports.GetTransferQuoteSchema = typebox_1.Type.Intersect([
    nxtp_utils_1.AuctionResponseSchema,
    typebox_1.Type.Object({ totalFee: nxtp_utils_1.TIntegerString, routerFee: nxtp_utils_1.TIntegerString, metaTxRelayerFee: nxtp_utils_1.TIntegerString }),
]);
exports.AuctionBidParamsSchema = typebox_1.Type.Object({
    user: nxtp_utils_1.TAddress,
    router: nxtp_utils_1.TAddress,
    initiator: nxtp_utils_1.TAddress,
    sendingChainId: nxtp_utils_1.TChainId,
    sendingAssetId: nxtp_utils_1.TAddress,
    amount: nxtp_utils_1.TIntegerString,
    receivingChainId: nxtp_utils_1.TChainId,
    receivingAssetId: nxtp_utils_1.TAddress,
    amountReceived: nxtp_utils_1.TIntegerString,
    receivingAddress: nxtp_utils_1.TAddress,
    transactionId: typebox_1.Type.RegEx(/^0x[a-fA-F0-9]{64}$/),
    expiry: typebox_1.Type.Number(),
    callDataHash: typebox_1.Type.RegEx(/^0x[a-fA-F0-9]{64}$/),
    callTo: nxtp_utils_1.TAddress,
    encryptedCallData: typebox_1.Type.String(),
    sendingChainTxManagerAddress: nxtp_utils_1.TAddress,
    receivingChainTxManagerAddress: nxtp_utils_1.TAddress,
    bidExpiry: typebox_1.Type.Number(),
});
exports.ApproveSchema = typebox_1.Type.Object({
    sendingAssetId: nxtp_utils_1.TAddress,
    sendingChainId: nxtp_utils_1.TChainId,
    amount: nxtp_utils_1.TIntegerString,
    transactionId: typebox_1.Type.RegEx(/^0x[a-fA-F0-9]{64}$/),
});
exports.CancelSchema = typebox_1.Type.Object({
    txData: nxtp_utils_1.TransactionDataSchema,
    signature: typebox_1.Type.String(),
});
exports.NxtpSdkEvents = {
    SenderTokenApprovalSubmitted: "SenderTokenApprovalSubmitted",
    SenderTokenApprovalMined: "SenderTokenApprovalMined",
    SenderTransactionPrepareSubmitted: "SenderTransactionPrepareSubmitted",
    SenderTransactionPrepared: "SenderTransactionPrepared",
    SenderTransactionFulfilled: "SenderTransactionFulfilled",
    SenderTransactionCancelled: "SenderTransactionCancelled",
    ReceiverPrepareSigned: "ReceiverPrepareSigned",
    ReceiverTransactionPrepared: "ReceiverTransactionPrepared",
    ReceiverTransactionFulfilled: "ReceiverTransactionFulfilled",
    ReceiverTransactionCancelled: "ReceiverTransactionCancelled",
};
exports.HistoricalTransactionStatus = {
    FULFILLED: "FULFILLED",
    CANCELLED: "CANCELLED",
};
//# sourceMappingURL=types.js.map