import { BigNumber, providers, Signer } from "ethers";
import { Evt } from "evt";
import { UserNxtpNatsMessagingService, TransactionPreparedEvent, AuctionResponse, Logger, ChainData, StatusResponse } from "@connext/nxtp-utils";
import { NxtpSdkEvent, NxtpSdkEventPayloads, SenderTokenApprovalSubmittedPayload, SenderTokenApprovalMinedPayload, SenderTransactionPrepareSubmittedPayload, SenderTransactionPreparedPayload, SenderTransactionFulfilledPayload, SenderTransactionCancelledPayload, ReceiverPrepareSignedPayload, ReceiverTransactionPreparedPayload, ReceiverTransactionFulfilledPayload, ReceiverTransactionCancelledPayload, CrossChainParams, HistoricalTransaction, SubgraphSyncRecord, ActiveTransaction, CancelParams, GetTransferQuote, SdkBaseChainConfigParams } from "./types";
import { NxtpSdkBase } from "./sdkBase";
export declare const MIN_SLIPPAGE_TOLERANCE = "00.01";
export declare const MAX_SLIPPAGE_TOLERANCE = "15.00";
export declare const DEFAULT_SLIPPAGE_TOLERANCE = "0.10";
export declare const AUCTION_TIMEOUT = 30000;
export declare const META_TX_TIMEOUT = 300000;
/**
 * Used to make mocking easier
 */
export declare const createMessagingEvt: <T>() => import("evt/lib/types").Evt<{
    inbox: string;
    data?: T | undefined;
    err?: any;
}>;
/**
 * Helper to generate evt instances for all SDK events
 *
 * @returns A container keyed on event names whos values contain the EVT instance for the keyed event
 */
export declare const createEvts: () => {
    SenderTokenApprovalSubmitted: import("evt/lib/types").Evt<SenderTokenApprovalSubmittedPayload>;
    SenderTokenApprovalMined: import("evt/lib/types").Evt<SenderTokenApprovalMinedPayload>;
    SenderTransactionPrepareSubmitted: import("evt/lib/types").Evt<SenderTransactionPrepareSubmittedPayload>;
    SenderTransactionPrepared: import("evt/lib/types").Evt<SenderTransactionPreparedPayload>;
    SenderTransactionFulfilled: import("evt/lib/types").Evt<SenderTransactionFulfilledPayload>;
    SenderTransactionCancelled: import("evt/lib/types").Evt<SenderTransactionCancelledPayload>;
    ReceiverPrepareSigned: import("evt/lib/types").Evt<ReceiverPrepareSignedPayload>;
    ReceiverTransactionPrepared: import("evt/lib/types").Evt<ReceiverTransactionPreparedPayload>;
    ReceiverTransactionFulfilled: import("evt/lib/types").Evt<ReceiverTransactionFulfilledPayload>;
    ReceiverTransactionCancelled: import("evt/lib/types").Evt<ReceiverTransactionCancelledPayload>;
};
/**
 * @classdesc Lightweight class to facilitate interaction with the TransactionManager contract on configured chains.
 *
 */
export declare class NxtpSdk {
    private readonly config;
    private evts;
    private readonly sdkBase;
    private readonly logger;
    readonly chainData?: Map<string, ChainData>;
    constructor(config: {
        chainConfig: SdkBaseChainConfigParams;
        signer: Signer;
        messagingSigner?: Signer;
        logger?: Logger;
        network?: "testnet" | "mainnet" | "local";
        natsUrl?: string;
        authUrl?: string;
        messaging?: UserNxtpNatsMessagingService;
        skipPolling?: boolean;
        sdkBase?: NxtpSdkBase;
        chainData?: Map<string, ChainData>;
    });
    /**
     * Retrieves ChainData and instantiates a new NxtpSdk instance using it.
     *
     * @param config - Sdk configuration params (without chainData).
     * @returns A new NxtpSdk instance.
     */
    static create(config: {
        chainConfig: SdkBaseChainConfigParams;
        signer: Signer;
        messagingSigner?: Signer;
        logger?: Logger;
        network?: "testnet" | "mainnet" | "local";
        natsUrl?: string;
        authUrl?: string;
        messaging?: UserNxtpNatsMessagingService;
        skipPolling?: boolean;
        sdkBase?: NxtpSdkBase;
    }): Promise<NxtpSdk>;
    connectMessaging(bearerToken?: string): Promise<string>;
    /**
     * Gets all the transactions that could require user action from the subgraph across all configured chains
     *
     * @returns An array of the active transactions and their status
     */
    getActiveTransactions(): Promise<ActiveTransaction[]>;
    /**
     * Gets all the transactions that could require user action from the subgraph across all configured chains
     *
     * @returns An array of the active transactions and their status
     */
    getRouterStatus(requestee: string): Promise<StatusResponse[]>;
    /**
     * Gets the current sync status of the subgraph(s) for the specified chain.
     * @param chainId
     * @returns SubgraphSyncRecord for the specified chain.
     */
    getSubgraphSyncStatus(chainId: number): SubgraphSyncRecord;
    /**
     * Gets historical transactions
     *
     * @returns An array of historical transactions
     */
    getHistoricalTransactions(): Promise<HistoricalTransaction[]>;
    /**
     * Gets gas fee in sending token for router transfer
     *
     * @param params.amount - amount
     * @param params.sendingChainId - The network id of sending chain
     * @param params.sendingAssetId - The sending asset address
     * @param params.receivingChainId - The network id of receiving chain
     * @param params.receivingAssetId - The receiving asset address
     * @returns Gas fee for router transfer in sending token
     */
    getEstimateReceiverAmount(params: {
        amount: string;
        sendingChainId: number;
        sendingAssetId: string;
        receivingChainId: number;
        receivingAssetId: string;
        callDataParams: {
            callData?: string;
            callTo?: string;
            callDataGas?: string;
        };
        relayerFee?: string;
    }): Promise<{
        receiverAmount: string;
        totalFee: string;
        routerFee: string;
        gasFee: string;
        relayerFee: string;
    }>;
    /**
     * Fetches an estimated quote for a proposed crosschain transfer. Runs an auction to determine the `router` for a transaction and the estimated received value.
     *
     * @param params - Params to create crosschain transfer with
     * @param params.callData - The calldata to execute on the receiving chain
     * @param params.sendingChainId - The originating chain (where user is sending funds from)
     * @param params.sendingAssetId - The originating asset of the funds the user is sending
     * @param params.receivingChainId - The destination chain (where user wants the funds)
     * @param params.receivingAssetId - The assetId of funds the user would like to receive on the receiving chain
     * @param params.callTo - The address on the receiving chain to execute the callData on
     * @param params.receivingAddress - The address the funds should be sent to on the destination chain if callTo/callData is empty, or the fallback address if the callTo/callData is specified
     * @param params.amount - The amount the user will send on the sending chain. This is not necessarily the amount they will receive
     * @param params.expiry - The expiry on the sending chain for the transfer
     * @param params.transactionId - The unique identifier for the transfer
     *
     * @returns The auction response for the given transacton
     *
     * @remarks
     * The user chooses the transactionId, and they are incentivized to keep the transactionId unique otherwise their signature could e replayed and they would lose funds.
     */
    getTransferQuote(params: Omit<CrossChainParams, "encryptedCallData"> & {
        passCalldataUnencrypted?: boolean;
    }): Promise<GetTransferQuote>;
    /**
     * Begins a crosschain transfer by calling `prepare` on the sending chain.
     *
     * @param transferParams - The auction result (winning bid and associated signature)
     * @param transferParams.bid - The winning action bid (includes all data needed to call prepare)
     * @param transferParams.bidSignature - The signature of the router on the winning bid
     * @param infiniteApprove - (optional) If true, will approve the TransactionManager on `transferParams.sendingChainId` for the max value. If false, will approve for only transferParams.amount. Defaults to false
     * @returns A promise with the transactionId and the `TransactionResponse` returned when the prepare transaction was submitted, not mined.
     */
    prepareTransfer(transferParams: AuctionResponse, infiniteApprove?: boolean, actualAmount?: string): Promise<{
        prepareResponse: providers.TransactionResponse;
        transactionId: string;
    }>;
    /**
     * Fulfills the transaction on the receiving chain.
     *
     * @param params - The `TransactionPrepared` event payload from the receiving chain
     * @param relayerFee - (optional) The fee paid to relayers. Comes out of the transaction amount the router prepared with. Defaults to 0
     * @param useRelayers - (optional) If true, will use a realyer to submit the fulfill transaction
     * @returns An object containing either the TransactionResponse from self-submitting the fulfill transaction, or the Meta-tx response (if you used meta transactions)
     */
    fulfillTransfer(params: Omit<TransactionPreparedEvent, "caller"> & {
        relayerFee?: string;
    }, useRelayers?: boolean): Promise<{
        transactionHash: string;
    }>;
    /**
     * Cancels the given transaction.
     *
     * @param cancelParams - Arguments to submit to chain
     * @param cancelParams.txData - TransactionData (invariant + variant) to be cancelled
     * @param cancelParams.relayerFee - Fee to be paid for relaying transaction (only respected on sending chain cancellations post-expiry by the user)
     * @param cancelParams.signature - User signature for relayer to use
     * @param chainId - Chain to cancel the transaction on
     * @returns A TransactionResponse when the transaction was submitted, not mined
     */
    cancel(cancelParams: CancelParams, chainId: number): Promise<providers.TransactionResponse>;
    /**
     * Get the balance of the given address on the given chain,
     *
     * @param chainId - Chain that the address is on.
     * @param address - Address whose balance we're getting.
     * @param assetId (default: native token) - Asset to get the balance for.
     * @param abi (default: ERC20) - ABI of the contract to get the balance from.
     * @returns BigNumber value of the balance.
     */
    getBalance(chainId: number, address: string, assetId?: string, abi?: string[]): Promise<BigNumber>;
    /**
     * Get the decimal places for the specified asset on the specified chain.
     *
     * @param chainId - Chain that the asset is on.
     * @param assetId - Asset to get the decimal places for.
     * @returns number of decimal places.
     */
    getDecimalsForAsset(chainId: number, assetId: string): Promise<number>;
    /**
     * Query subgraph(s) on given chain with a given query string. This is a convenience method
     * that enables SDK users to query directly if necessary - however, it is recommended to
     * use this class's endpoints for things like subgraph health, active txs, historical
     * txs, etc. as much as possible.
     *
     * Note that we'll be querying the most in-sync subgraph first and then resorting to less
     * in-sync subgraphs if necessary.
     *
     * @param chainId - Chain that the subgraph(s) are on.
     * @param query - GraphQL query string to send to the subgraph(s). (For more information
     * on writing your own queries, see: https://graphql.org/learn/)
     *
     * @returns Query response from the (first) subgraph that responded.
     */
    querySubgraph(chainId: number, query: string): Promise<any>;
    /**
     * Changes the injected signer associated with the SDK.
     *
     * @param signer - New injected signer for the SDK to use.
     */
    changeInjectedSigner(signer: Signer): void;
    /**
     * Turns off all listeners and disconnects messaging from the SDK.
     */
    removeAllListeners(): void;
    /**
     * Attaches a callback to the emitted event
     *
     * @param event - The event name to attach a handler for
     * @param callback - The callback to invoke on event emission
     * @param filter - (optional) A filter where callbacks are only invoked if the filter returns true
     * @param timeout - (optional) A timeout to detach the handler within. I.e. if no events fired within the timeout, then the handler is detached
     */
    attach<T extends NxtpSdkEvent>(event: T, callback: (data: NxtpSdkEventPayloads[T]) => void, filter?: (data: NxtpSdkEventPayloads[T]) => boolean, timeout?: number): void;
    /**
     * Attaches a callback to the emitted event that will be executed one time and then detached.
     *
     * @param event - The event name to attach a handler for
     * @param callback - The callback to invoke on event emission
     * @param filter - (optional) A filter where callbacks are only invoked if the filter returns true
     * @param timeout - (optional) A timeout to detach the handler within. I.e. if no events fired within the timeout, then the handler is detached
     *
     */
    attachOnce<T extends NxtpSdkEvent>(event: T, callback: (data: NxtpSdkEventPayloads[T]) => void, filter?: (data: NxtpSdkEventPayloads[T]) => boolean, timeout?: number): void;
    /**
     * Removes all attached handlers from the given event.
     *
     * @param event - (optional) The event name to remove handlers from. If not provided, will detach handlers from *all* subgraph events
     */
    detach<T extends NxtpSdkEvent>(event?: T): void;
    /**
     * Returns a promise that resolves when the event matching the filter is emitted
     *
     * @param event - The event name to wait for
     * @param timeout - The ms to continue waiting before rejecting
     * @param filter - (optional) A filter where the promise is only resolved if the filter returns true
     *
     * @returns Promise that will resolve with the event payload once the event is emitted, or rejects if the timeout is reached.
     *
     */
    waitFor<T extends NxtpSdkEvent>(event: T, timeout: number, filter?: (data: NxtpSdkEventPayloads[T]) => boolean): Promise<NxtpSdkEventPayloads[T]>;
}
//# sourceMappingURL=sdk.d.ts.map