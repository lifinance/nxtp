import { providers, Signer, BigNumber } from "ethers";
import { TransactionPreparedEvent, AuctionResponse, Logger, RequestContext, ChainData, StatusResponse } from "@connext/nxtp-utils";
import { ChainReader } from "@connext/nxtp-txservice";
import { SdkBaseConfigParams, NxtpSdkEventPayloads, CrossChainParams, HistoricalTransaction, SubgraphSyncRecord, ActiveTransaction, CancelParams, GetTransferQuote, SdkBaseChainConfigParams, ApproveParams } from "./types";
import { SubgraphEvent } from "./subgraph/subgraph";
export declare const MIN_SLIPPAGE_TOLERANCE = "00.01";
export declare const MAX_SLIPPAGE_TOLERANCE = "15.00";
export declare const DEFAULT_SLIPPAGE_TOLERANCE = "0.10";
export declare const DEFAULT_AUCTION_TIMEOUT = 6000;
export declare const FULFILL_TIMEOUT = 300000;
export declare const DELAY_BETWEEN_RETRIES = 5000;
/**
 * Used to make mocking easier
 */
export declare const createMessagingEvt: <T>() => import("evt/lib/types").Evt<{
    inbox: string;
    data?: T | undefined;
    err?: any;
}>;
export declare const setupChainReader: (logger: Logger, chainConfig: SdkBaseChainConfigParams) => ChainReader;
/**
 * @classdesc Lightweight class to facilitate interaction with the TransactionManager contract on configured chains.
 *
 */
export declare class NxtpSdkBase {
    private readonly config;
    static BID_DEVIATION_TOLERANCE: number;
    private readonly transactionManager;
    readonly chainReader: ChainReader;
    private readonly messaging;
    private subgraph;
    private readonly logger;
    readonly chainData?: Map<string, ChainData>;
    private readonly auctionResponseEvt;
    private readonly statusResponseEvt;
    constructor(config: SdkBaseConfigParams);
    connectMessaging(bearerToken?: string): Promise<string>;
    /**
     * Gets all the transactions that could require user action from the subgraph across all configured chains
     *
     * @returns An array of the active transactions and their status
     */
    getActiveTransactions(): Promise<ActiveTransaction[]>;
    /**
     *
     * @param chainId
     * @returns
     */
    getSubgraphSyncStatus(chainId: number): SubgraphSyncRecord;
    /**
     * Gets historical transactions
     *
     * @returns An array of historical transactions
     */
    getHistoricalTransactions(): Promise<HistoricalTransaction[]>;
    calculateGasFeeInReceivingTokenForFulfill(receivingChainId: number, receivingAssetId: string, callDataParams: {
        callData?: string;
        callTo?: string;
        callDataGas?: string;
    }): Promise<BigNumber>;
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
    getRouterStatus(requestee: string): Promise<StatusResponse[]>;
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
    getTransferQuote(params: CrossChainParams): Promise<GetTransferQuote>;
    approveForPrepare(approveParams: ApproveParams, infiniteApprove?: boolean): Promise<providers.TransactionRequest | undefined>;
    /**
     * Begins a crosschain transfer by calling `prepare` on the sending chain.
     *
     * @param transferParams - The auction result (winning bid and associated signature)
     * @param transferParams.bid - The winning action bid (includes all data needed to call prepare)
     * @param transferParams.bidSignature - The signature of the router on the winning bid
     * @param infiniteApprove - (optional) If true, will approve the TransactionManager on `transferParams.sendingChainId` for the max value. If false, will approve for only transferParams.amount. Defaults to false
     * @returns A promise with the transactionId and the `TransactionResponse` returned when the prepare transaction was submitted, not mined.
     */
    prepareTransfer(transferParams: AuctionResponse, actualAmount?: string): Promise<providers.TransactionRequest>;
    /**
     * Fulfills the transaction on the receiving chain.
     *
     * @param params - The `TransactionPrepared` event payload from the receiving chain
     * @param relayerFee - (optional) The fee paid to relayers. Comes out of the transaction amount the router prepared with. Defaults to 0
     * @param useRelayers - (optional) If true, will use a realyer to submit the fulfill transaction
     * @returns An object containing either the TransactionResponse from self-submitting the fulfill transaction, or the Meta-tx response (if you used meta transactions)
     */
    fulfillTransfer(params: Omit<TransactionPreparedEvent, "caller">, fulfillSignature: string, decryptedCallData: string, relayerFee?: string, useRelayers?: boolean): Promise<{
        transactionResponse?: {
            transactionHash: string;
            chainId: number;
        };
        transactionRequest?: providers.TransactionRequest;
    }>;
    /**
     * Cancels the given transaction
     *
     * @param cancelParams - Arguments to submit to chain
     * @param cancelParams.txData - TransactionData (invariant + variant) to be cancelled
     * @param cancelParams.relayerFee - Fee to be paid for relaying transaction (only respected on sending chain cancellations post-expiry by the user)
     * @param cancelParams.signature - User signature for relayer to use
     * @param chainId - Chain to cancel the transaction on
     * @returns A TransactionResponse when the transaction was submitted, not mined
     */
    cancel(cancelParams: CancelParams, chainId: number): Promise<providers.TransactionRequest>;
    /**
     * Gets gas price in target chain
     *
     * @param chainId The network identifier
     *
     * @returns Gas price in BigNumber
     */
    getGasPrice(chainId: number, requestContext: RequestContext): Promise<BigNumber>;
    querySubgraph(chainId: number, query: string): Promise<any>;
    /**
     * Changes the signer associated with the sdk
     *
     * @param signer - Signer to change to
     */
    changeInjectedSigner(signer: Signer): void;
    /**
     * Turns off all listeners and disconnects messaging from the sdk
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
    attach<T extends SubgraphEvent>(event: T, callback: (data: NxtpSdkEventPayloads[T]) => void, filter?: (data: NxtpSdkEventPayloads[T]) => boolean): void;
    /**
     * Attaches a callback to the emitted event that will be executed one time and then detached.
     *
     * @param event - The event name to attach a handler for
     * @param callback - The callback to invoke on event emission
     * @param filter - (optional) A filter where callbacks are only invoked if the filter returns true
     * @param timeout - (optional) A timeout to detach the handler within. I.e. if no events fired within the timeout, then the handler is detached
     *
     */
    attachOnce<T extends SubgraphEvent>(event: T, callback: (data: NxtpSdkEventPayloads[T]) => void, filter?: (data: NxtpSdkEventPayloads[T]) => boolean, timeout?: number): void;
    /**
     * Removes all attached handlers from the given event.
     *
     * @param event - (optional) The event name to remove handlers from. If not provided, will detach handlers from *all* subgraph events
     */
    detach<T extends SubgraphEvent>(event?: T): void;
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
    waitFor<T extends SubgraphEvent>(event: T, timeout: number, filter?: (data: NxtpSdkEventPayloads[T]) => boolean): Promise<NxtpSdkEventPayloads[T]>;
    assertChainIsConfigured(chainId: number): void;
}
//# sourceMappingURL=sdkBase.d.ts.map