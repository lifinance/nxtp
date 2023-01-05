import { PrepareParams, Logger, TransactionPreparedEvent, TransactionFulfilledEvent, TransactionCancelledEvent, CrosschainTransaction, UserNxtpNatsMessagingService, ChainData } from "@connext/nxtp-utils";
import { Static } from "@sinclair/typebox";
import { providers, Signer } from "ethers";
export declare const SdkBaseChainConfigSchema: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TNumber, import("@sinclair/typebox").TObject<{
    providers: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>, import("@sinclair/typebox").TString, import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        url: import("@sinclair/typebox").TString;
        user: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        password: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>]>;
    transactionManagerAddress: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    priceOracleAddress: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    subgraph: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    subgraphSyncBuffer: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>>;
export declare const LogLevelScehma: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"fatal">, import("@sinclair/typebox").TLiteral<"error">, import("@sinclair/typebox").TLiteral<"warn">, import("@sinclair/typebox").TLiteral<"info">, import("@sinclair/typebox").TLiteral<"debug">, import("@sinclair/typebox").TLiteral<"trace">, import("@sinclair/typebox").TLiteral<"silent">]>;
export declare const NetworkSchema: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"local">, import("@sinclair/typebox").TLiteral<"testnet">, import("@sinclair/typebox").TLiteral<"mainnet">]>;
export declare type SdkBaseChainConfigParams = {
    [chainId: number]: {
        providers: string | string[] | {
            url: string;
            user?: string;
            password?: string;
        }[];
        transactionManagerAddress?: string;
        priceOracleAddress?: string;
        subgraph?: string | string[];
        subgraphSyncBuffer?: number;
        gelatoOracle?: boolean;
    };
};
export declare type SdkBaseConfigParams = {
    chainConfig: SdkBaseChainConfigParams;
    signerAddress: Promise<string> | string;
    signer?: Signer;
    messagingSigner?: Signer;
    logger?: Logger;
    network?: "testnet" | "mainnet" | "local";
    natsUrl?: string;
    authUrl?: string;
    messaging?: UserNxtpNatsMessagingService;
    skipPolling?: boolean;
    chainData?: Map<string, ChainData>;
};
export declare const CrossChainParamsSchema: import("@sinclair/typebox").TObject<{
    sendingChainId: import("@sinclair/typebox").TNumber;
    sendingAssetId: import("@sinclair/typebox").TString;
    receivingChainId: import("@sinclair/typebox").TNumber;
    receivingAssetId: import("@sinclair/typebox").TString;
    receivingAddress: import("@sinclair/typebox").TString;
    amount: import("@sinclair/typebox").TString;
    callTo: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    callData: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    encryptedCallData: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    expiry: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    transactionId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    slippageTolerance: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    dryRun: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    preferredRouters: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    initiator: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    auctionWaitTimeMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    numAuctionResponsesQuorum: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    relayerFee: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    callDataGas: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare type CrossChainParams = Static<typeof CrossChainParamsSchema>;
export declare const GetTransferQuoteSchema: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
    bid: import("@sinclair/typebox").TObject<{
        user: import("@sinclair/typebox").TString;
        router: import("@sinclair/typebox").TString;
        initiator: import("@sinclair/typebox").TString;
        sendingChainId: import("@sinclair/typebox").TNumber;
        sendingAssetId: import("@sinclair/typebox").TString;
        amount: import("@sinclair/typebox").TString;
        receivingChainId: import("@sinclair/typebox").TNumber;
        receivingAssetId: import("@sinclair/typebox").TString;
        amountReceived: import("@sinclair/typebox").TString;
        receivingAddress: import("@sinclair/typebox").TString;
        transactionId: import("@sinclair/typebox").TString;
        expiry: import("@sinclair/typebox").TNumber;
        callDataHash: import("@sinclair/typebox").TString;
        callTo: import("@sinclair/typebox").TString;
        encryptedCallData: import("@sinclair/typebox").TString;
        sendingChainTxManagerAddress: import("@sinclair/typebox").TString;
        receivingChainTxManagerAddress: import("@sinclair/typebox").TString;
        bidExpiry: import("@sinclair/typebox").TNumber;
    }>;
    gasFeeInReceivingToken: import("@sinclair/typebox").TString;
    bidSignature: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>, import("@sinclair/typebox").TObject<{
    totalFee: import("@sinclair/typebox").TString;
    routerFee: import("@sinclair/typebox").TString;
    metaTxRelayerFee: import("@sinclair/typebox").TString;
}>]>;
export declare type GetTransferQuote = Static<typeof GetTransferQuoteSchema>;
export declare const AuctionBidParamsSchema: import("@sinclair/typebox").TObject<{
    user: import("@sinclair/typebox").TString;
    router: import("@sinclair/typebox").TString;
    initiator: import("@sinclair/typebox").TString;
    sendingChainId: import("@sinclair/typebox").TNumber;
    sendingAssetId: import("@sinclair/typebox").TString;
    amount: import("@sinclair/typebox").TString;
    receivingChainId: import("@sinclair/typebox").TNumber;
    receivingAssetId: import("@sinclair/typebox").TString;
    amountReceived: import("@sinclair/typebox").TString;
    receivingAddress: import("@sinclair/typebox").TString;
    transactionId: import("@sinclair/typebox").TString;
    expiry: import("@sinclair/typebox").TNumber;
    callDataHash: import("@sinclair/typebox").TString;
    callTo: import("@sinclair/typebox").TString;
    encryptedCallData: import("@sinclair/typebox").TString;
    sendingChainTxManagerAddress: import("@sinclair/typebox").TString;
    receivingChainTxManagerAddress: import("@sinclair/typebox").TString;
    bidExpiry: import("@sinclair/typebox").TNumber;
}>;
export declare type AuctionBidParams = Static<typeof AuctionBidParamsSchema>;
export declare const ApproveSchema: import("@sinclair/typebox").TObject<{
    sendingAssetId: import("@sinclair/typebox").TString;
    sendingChainId: import("@sinclair/typebox").TNumber;
    amount: import("@sinclair/typebox").TString;
    transactionId: import("@sinclair/typebox").TString;
}>;
export declare type ApproveParams = Static<typeof ApproveSchema>;
export declare const CancelSchema: import("@sinclair/typebox").TObject<{
    txData: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
        receivingChainTxManagerAddress: import("@sinclair/typebox").TString;
        user: import("@sinclair/typebox").TString;
        router: import("@sinclair/typebox").TString;
        initiator: import("@sinclair/typebox").TString;
        sendingAssetId: import("@sinclair/typebox").TString;
        receivingAssetId: import("@sinclair/typebox").TString;
        sendingChainFallback: import("@sinclair/typebox").TString;
        callTo: import("@sinclair/typebox").TString;
        receivingAddress: import("@sinclair/typebox").TString;
        sendingChainId: import("@sinclair/typebox").TNumber;
        receivingChainId: import("@sinclair/typebox").TNumber;
        callDataHash: import("@sinclair/typebox").TString;
        transactionId: import("@sinclair/typebox").TString;
    }>, import("@sinclair/typebox").TObject<{
        amount: import("@sinclair/typebox").TString;
        expiry: import("@sinclair/typebox").TNumber;
        preparedBlockNumber: import("@sinclair/typebox").TNumber;
    }>]>;
    signature: import("@sinclair/typebox").TString;
}>;
export declare type CancelParams = Static<typeof CancelSchema>;
export declare const NxtpSdkEvents: {
    readonly SenderTokenApprovalSubmitted: "SenderTokenApprovalSubmitted";
    readonly SenderTokenApprovalMined: "SenderTokenApprovalMined";
    readonly SenderTransactionPrepareSubmitted: "SenderTransactionPrepareSubmitted";
    readonly SenderTransactionPrepared: "SenderTransactionPrepared";
    readonly SenderTransactionFulfilled: "SenderTransactionFulfilled";
    readonly SenderTransactionCancelled: "SenderTransactionCancelled";
    readonly ReceiverPrepareSigned: "ReceiverPrepareSigned";
    readonly ReceiverTransactionPrepared: "ReceiverTransactionPrepared";
    readonly ReceiverTransactionFulfilled: "ReceiverTransactionFulfilled";
    readonly ReceiverTransactionCancelled: "ReceiverTransactionCancelled";
};
export declare type NxtpSdkEvent = typeof NxtpSdkEvents[keyof typeof NxtpSdkEvents];
export declare type SenderTokenApprovalSubmittedPayload = {
    assetId: string;
    chainId: number;
    transactionResponse: providers.TransactionResponse;
};
export declare type SenderTokenApprovalMinedPayload = {
    assetId: string;
    chainId: number;
    transactionReceipt: providers.TransactionReceipt;
};
export declare type SenderTransactionPrepareSubmittedPayload = {
    prepareParams: PrepareParams;
    transactionResponse: providers.TransactionResponse;
};
export declare type ReceiverPrepareSignedPayload = {
    signature: string;
    signer: string;
    transactionId: string;
};
export declare type SdkEvent<T> = T & {
    transactionHash: string;
};
export declare type SenderTransactionPreparedPayload = SdkEvent<TransactionPreparedEvent>;
export declare type SenderTransactionFulfilledPayload = SdkEvent<TransactionFulfilledEvent>;
export declare type SenderTransactionCancelledPayload = SdkEvent<TransactionCancelledEvent>;
export declare type ReceiverTransactionPreparedPayload = SdkEvent<TransactionPreparedEvent>;
export declare type ReceiverTransactionFulfilledPayload = SdkEvent<TransactionFulfilledEvent>;
export declare type ReceiverTransactionCancelledPayload = SdkEvent<TransactionCancelledEvent>;
export interface NxtpSdkEventPayloads {
    [NxtpSdkEvents.SenderTokenApprovalSubmitted]: SenderTokenApprovalSubmittedPayload;
    [NxtpSdkEvents.SenderTokenApprovalMined]: SenderTokenApprovalMinedPayload;
    [NxtpSdkEvents.SenderTransactionPrepareSubmitted]: SenderTransactionPrepareSubmittedPayload;
    [NxtpSdkEvents.SenderTransactionPrepared]: SenderTransactionPreparedPayload;
    [NxtpSdkEvents.SenderTransactionFulfilled]: SenderTransactionFulfilledPayload;
    [NxtpSdkEvents.SenderTransactionCancelled]: SenderTransactionCancelledPayload;
    [NxtpSdkEvents.ReceiverPrepareSigned]: ReceiverPrepareSignedPayload;
    [NxtpSdkEvents.ReceiverTransactionPrepared]: ReceiverTransactionPreparedPayload;
    [NxtpSdkEvents.ReceiverTransactionFulfilled]: ReceiverTransactionFulfilledPayload;
    [NxtpSdkEvents.ReceiverTransactionCancelled]: ReceiverTransactionCancelledPayload;
}
export declare const HistoricalTransactionStatus: {
    readonly FULFILLED: "FULFILLED";
    readonly CANCELLED: "CANCELLED";
};
export declare type THistoricalTransactionStatus = typeof HistoricalTransactionStatus[keyof typeof HistoricalTransactionStatus];
export declare type HistoricalTransaction = {
    status: THistoricalTransactionStatus;
    crosschainTx: CrosschainTransaction;
    preparedTimestamp: number;
    fulfilledTxHash?: string;
};
export declare type ActiveTransaction = {
    crosschainTx: CrosschainTransaction;
    status: NxtpSdkEvent;
    bidSignature: string;
    encodedBid: string;
    encryptedCallData: string;
    preparedTimestamp: number;
};
export declare type SubgraphSyncRecord = {
    synced: boolean;
    latestBlock: number;
    syncedBlock: number;
};
//# sourceMappingURL=types.d.ts.map