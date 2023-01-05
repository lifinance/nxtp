import { Evt } from "evt";
import { ChainReader } from "@connext/nxtp-txservice";
import { Logger, RequestContext, TransactionData } from "@connext/nxtp-utils";
import { SenderTransactionPreparedPayload, SenderTransactionCancelledPayload, ReceiverTransactionPreparedPayload, ReceiverTransactionFulfilledPayload, ReceiverTransactionCancelledPayload, HistoricalTransaction, ActiveTransaction, SubgraphSyncRecord } from "../types";
/**
 * Converts subgraph transactions to properly typed TransactionData
 *
 * @param transaction Subgraph data
 * @returns Properly formatted TransactionData
 */
export declare const convertTransactionToTxData: (transaction: any) => TransactionData;
export declare const SubgraphEvents: {
    readonly SenderTransactionPrepared: "SenderTransactionPrepared";
    readonly SenderTransactionCancelled: "SenderTransactionCancelled";
    readonly ReceiverTransactionPrepared: "ReceiverTransactionPrepared";
    readonly ReceiverTransactionFulfilled: "ReceiverTransactionFulfilled";
    readonly ReceiverTransactionCancelled: "ReceiverTransactionCancelled";
};
export declare type SubgraphEvent = typeof SubgraphEvents[keyof typeof SubgraphEvents];
export interface SubgraphEventPayloads {
    [SubgraphEvents.SenderTransactionPrepared]: SenderTransactionPreparedPayload;
    [SubgraphEvents.SenderTransactionCancelled]: SenderTransactionCancelledPayload;
    [SubgraphEvents.ReceiverTransactionPrepared]: ReceiverTransactionPreparedPayload;
    [SubgraphEvents.ReceiverTransactionFulfilled]: ReceiverTransactionFulfilledPayload;
    [SubgraphEvents.ReceiverTransactionCancelled]: ReceiverTransactionCancelledPayload;
}
/**
 * Creates an evt container to be used for translating subgraph events into an easy to use and strongly typed format
 * @returns A container keyed on event names with values of the Evt instance used for that event
 */
export declare const createSubgraphEvts: () => {
    SenderTransactionPrepared: import("evt/lib/types").Evt<SenderTransactionPreparedPayload>;
    SenderTransactionCancelled: import("evt/lib/types").Evt<SenderTransactionCancelledPayload>;
    ReceiverTransactionPrepared: import("evt/lib/types").Evt<ReceiverTransactionPreparedPayload>;
    ReceiverTransactionFulfilled: import("evt/lib/types").Evt<ReceiverTransactionFulfilledPayload>;
    ReceiverTransactionCancelled: import("evt/lib/types").Evt<ReceiverTransactionCancelledPayload>;
};
export declare type SubgraphChainConfig = {
    subgraph: string | string[];
    subgraphSyncBuffer: number;
};
/**
 * @classdesc Handles all user-facing subgraph queries
 */
export declare class Subgraph {
    private readonly userAddress;
    private readonly chainReader;
    private readonly logger;
    private readonly pollInterval;
    private sdks;
    private evts;
    private activeTxs;
    private pollingLoop;
    private syncStatus;
    private chainConfig;
    pollingStopperBlock: Record<number, number>;
    constructor(userAddress: Promise<string> | string, _chainConfig: Record<number, Omit<SubgraphChainConfig, "subgraphSyncBuffer"> & {
        subgraphSyncBuffer?: number;
    }>, chainReader: ChainReader, logger: Logger, pollInterval?: number);
    stopPolling(): void;
    updatePollingStopperBlock(chainId: number, blockNumber: number): void;
    startPolling(): Promise<void>;
    getSyncStatus(chainId: number): SubgraphSyncRecord | undefined;
    /**
     * Gets the transactions that the user may need to take action on, or is waiting for the router to take action on. Specifically,
     * transactions that have been prepared on the sending chain, but have yet to be fulfilled on the receiving chain, or have yet
     * to be cancelled on the sending chain
     *
     * @returns All active transactions for the instantiated user
     */
    getActiveTransactions(_requestContext?: RequestContext): Promise<ActiveTransaction[]>;
    getHistoricalTransactions(_requestContext?: RequestContext): Promise<HistoricalTransaction[]>;
    query(chainId: number, query: string): Promise<any>;
    /**
     * Update the sync statuses of subgraph providers for each chain.
     * This will enable FallbackSubgraph to use the most in-sync subgraph provider.
     */
    updateSyncStatus(): Promise<void>;
    /**
     * Attaches a callback to the emitted event
     *
     * @param event - The event name to attach a handler for
     * @param callback - The callback to invoke on event emission
     * @param filter - (optional) A filter where callbacks are only invoked if the filter returns true
     * @param timeout - (optional) A timeout to detach the handler within. I.e. if no events fired within the timeout, then the handler is detached
     */
    attach<T extends SubgraphEvent>(event: T, callback: (data: SubgraphEventPayloads[T]) => void, filter?: (data: SubgraphEventPayloads[T]) => boolean, timeout?: number): void;
    /**
     * Attaches a callback to the emitted event that will be executed one time and then detached.
     *
     * @param event - The event name to attach a handler for
     * @param callback - The callback to invoke on event emission
     * @param filter - (optional) A filter where callbacks are only invoked if the filter returns true
     * @param timeout - (optional) A timeout to detach the handler within. I.e. if no events fired within the timeout, then the handler is detached
     *
     */
    attachOnce<T extends SubgraphEvent>(event: T, callback: (data: SubgraphEventPayloads[T]) => void, filter?: (data: SubgraphEventPayloads[T]) => boolean, timeout?: number): void;
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
    waitFor<T extends SubgraphEvent>(event: T, timeout: number, filter?: (data: SubgraphEventPayloads[T]) => boolean): Promise<SubgraphEventPayloads[T]>;
}
//# sourceMappingURL=subgraph.d.ts.map