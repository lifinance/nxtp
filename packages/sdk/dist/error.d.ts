import { AuctionBid, AuctionPayload, AuctionResponse, NxtpError, NxtpErrorJson } from "@connext/nxtp-utils";
import { SubgraphSyncRecord } from "./types";
/**
 * @classdesc Represents errors having to do with config issues
 */
export declare abstract class ConfigError extends NxtpError {
    static readonly type: string;
}
/**
 * @classdesc Represents errors having to do with invalid parameter issues
 */
export declare abstract class ParamsError extends NxtpError {
    static readonly type: string;
}
/**
 * @classdesc Represents errors having to do with an auction
 */
export declare abstract class AuctionError extends NxtpError {
    static readonly type: string;
}
/**
 * @classdesc Represents errors having to do with relayers
 */
export declare abstract class RelayerError extends NxtpError {
    static readonly type: string;
}
/**
 * @classdesc Abstract error class thrown by the `TransactionManager` class.
 */
export declare abstract class TransactionManagerError extends NxtpError {
    static readonly type: string;
}
/**
 * @classdesc Abstract error class thrown by the `Subgraph` class.
 */
export declare abstract class SubgraphError extends NxtpError {
    static readonly type: string;
}
/**
 * @classdesc Abstract error class during fulfill.
 */
export declare abstract class FulfillError extends NxtpError {
    static readonly type: string;
}
/**
 * @classdesc Thrown if no tx manager addr for chain
 */
export declare class NoTransactionManager extends ConfigError {
    readonly chainId: number;
    readonly context: any;
    static getMessage(): string;
    constructor(chainId: number, context?: any);
}
/**
 * @classdesc Thrown if no price oracle addr for chain
 */
export declare class NoPriceOracle extends ConfigError {
    readonly chainId: number;
    readonly context: any;
    static getMessage(): string;
    constructor(chainId: number, context?: any);
}
/**
 * @classdesc Thrown if no subgraph addr for chain
 */
export declare class NoSubgraph extends ConfigError {
    readonly chainId: number;
    readonly context: any;
    static getMessage(): string;
    constructor(chainId: number, context?: any);
}
/**
 * @classdesc Thrown if chain not found in config
 */
export declare class ChainNotConfigured extends ConfigError {
    readonly chainId: number;
    readonly supported: string[];
    readonly context: any;
    static getMessage(): string;
    constructor(chainId: number, supported: string[], context?: any);
}
/**
 * @classdesc Thrown if price oracle not configured
 */
export declare class PriceOracleNotConfigured extends ConfigError {
    readonly chainId: number;
    readonly assetId: string;
    readonly context: any;
    static getMessage(): string;
    constructor(chainId: number, assetId: string, context?: any);
}
/**
 * @classdesc Thrown if ajv validation on external params fails
 */
export declare class InvalidParamStructure extends ParamsError {
    readonly error: string;
    readonly invalidParams: any;
    readonly context: any;
    static getMessage(): string;
    constructor(method: string, typename: string, error: string, invalidParams: any, context?: any);
}
/**
 * @classdesc Thrown if slippage is out of bounds
 */
export declare class InvalidSlippage extends ParamsError {
    readonly slippage: string;
    readonly minSlippage: string;
    readonly maxSlippage: string;
    readonly context: any;
    static getMessage(): string;
    constructor(slippage: string, minSlippage: string, maxSlippage: string, context?: any);
}
/**
 * @classdesc Thrown if expiry is out of bounds
 */
export declare class InvalidExpiry extends ParamsError {
    readonly expiry: number;
    readonly minExpiryBuffer: number;
    readonly maxExpiryBuffer: number;
    readonly timestamp: number;
    readonly context: any;
    static getMessage(): string;
    constructor(expiry: number, minExpiryBuffer: number, maxExpiryBuffer: number, timestamp: number, context?: any);
}
/**
 * @classdesc Thrown if there is insufficient balance for transfer of that amount
 */
export declare class InvalidAmount extends ParamsError {
    readonly transactionId: string;
    readonly address: string;
    readonly balance: string;
    readonly amount: string;
    readonly chainId: number;
    readonly assetId: string;
    readonly context: any;
    static getMessage(): string;
    constructor(transactionId: string, address: string, balance: string, amount: string, chainId: number, assetId: string, context?: any);
}
/**
 * @classdesc Thrown if there callTo is not a Contract
 */
export declare class InvalidCallTo extends ParamsError {
    readonly transactionId: string;
    readonly callTo: string;
    readonly context: any;
    static getMessage(): string;
    constructor(transactionId: string, callTo: string, context?: any);
}
/**
 * @classdesc Thrown when bid signature undefined
 */
export declare class InvalidBidSignature extends ParamsError {
    readonly transactionId: string;
    readonly bid: AuctionBid;
    readonly router: string;
    readonly recovered?: string | undefined;
    readonly signature?: string | undefined;
    readonly context: any;
    static getMessage(): string;
    constructor(transactionId: string, bid: AuctionBid, router: string, recovered?: string | undefined, signature?: string | undefined, context?: any);
}
/**
 * @classdesc Thrown if encryption of calldata fails before auction
 */
export declare class EncryptionError extends NxtpError {
    readonly details: string;
    readonly error?: NxtpErrorJson | undefined;
    readonly context: any;
    static readonly type: string;
    static getMessage(details: string): string;
    constructor(details: string, error?: NxtpErrorJson | undefined, context?: any);
}
/**
 * @classdesc Thrown if receiver amount is less than total fee
 */
export declare class NotEnoughAmount extends NxtpError {
    readonly context: any;
    static readonly type: string;
    static getMessage(): string;
    constructor(context?: any);
}
/**
 * @classdesc Thrown if no bids received in given timeout
 */
export declare class NoBids extends AuctionError {
    readonly timeout: number;
    readonly transactionId: string;
    readonly auction: AuctionPayload;
    readonly context: any;
    static getMessage(timeout: number, transactionId: string): string;
    constructor(timeout: number, transactionId: string, auction: AuctionPayload, context?: any);
}
/**
 * @classdesc Thrown if no acceptable bids received in given timeout
 */
export declare class NoValidBids extends AuctionError {
    readonly transactionId: string;
    readonly auction: AuctionPayload;
    readonly reasons: string;
    readonly auctionResponses: (AuctionResponse | string)[];
    readonly context: any;
    static getMessage(): string;
    constructor(transactionId: string, auction: AuctionPayload, reasons: string, auctionResponses: (AuctionResponse | string)[], context?: any);
}
/**
 * @classdesc Thrown when auction fails in unknown way
 */
export declare class UnknownAuctionError extends AuctionError {
    readonly transactionId: string;
    readonly error: NxtpErrorJson;
    readonly auction: AuctionPayload;
    readonly context: any;
    static getMessage(): string;
    constructor(transactionId: string, error: NxtpErrorJson, auction: AuctionPayload, context?: any);
}
/**
 * @classdesc Defines the error thrown by the `TransactionManager` class when a transaction fails to be submitted.
 */
export declare class SubmitError extends TransactionManagerError {
    readonly transactionId: string;
    readonly chainId: number;
    readonly sender: string;
    readonly method: string;
    readonly to: string;
    readonly params: any;
    readonly txserviceError: NxtpErrorJson;
    readonly context: any;
    static getMessage(): string;
    constructor(transactionId: string, chainId: number, sender: string, method: string, to: string, params: any, txserviceError: NxtpErrorJson, context?: any);
}
/**
 * @classdesc Thrown when invalid status
 */
export declare class InvalidTxStatus extends SubgraphError {
    readonly transactionId: string;
    readonly status: string;
    readonly record: any;
    readonly context: any;
    static getMessage(): string;
    constructor(transactionId: string, status: string, record: any, //ActiveTransaction,
    context?: any);
}
/**
 * @classdesc Thrown when subgraphs are not synced
 */
export declare class SendingChainSubgraphsNotSynced extends SubgraphError {
    readonly sendingSyncStatus: SubgraphSyncRecord;
    readonly receivingSyncStatus: SubgraphSyncRecord;
    readonly context: any;
    static getMessage(): string;
    constructor(sendingSyncStatus: SubgraphSyncRecord, receivingSyncStatus: SubgraphSyncRecord, context?: any);
}
export declare class ReceivingChainSubgraphsNotSynced extends SubgraphError {
    readonly sendingSyncStatus: SubgraphSyncRecord;
    readonly receivingSyncStatus: SubgraphSyncRecord;
    readonly context: any;
    static getMessage(): string;
    constructor(sendingSyncStatus: SubgraphSyncRecord, receivingSyncStatus: SubgraphSyncRecord, context?: any);
}
/**
 * @classdesc Thrown when polling is not active
 */
export declare class PollingNotActive extends SubgraphError {
    readonly context: any;
    static getMessage(): string;
    constructor(context?: any);
}
/**
 * @classdesc Thrown when subgraphs are not synced
 */
export declare class RelayFailed extends FulfillError {
    readonly transactionId: string;
    readonly chainId: number;
    readonly context: any;
    static getMessage(): string;
    constructor(transactionId: string, chainId: number, context?: any);
}
/**
 * @classdesc Thrown when no responses to meta tx request in some timeframe
 */
export declare class FulfillTimeout extends FulfillError {
    readonly transactionId: string;
    readonly timeout: number;
    readonly chainId: number;
    readonly context: any;
    static getMessage(): string;
    constructor(transactionId: string, timeout: number, chainId: number, context?: any);
}
/**
 * @classdesc Thrown when no responses to meta tx request in some timeframe
 */
export declare class InvalidRelayerFee extends FulfillError {
    readonly transactionId: string;
    readonly chainId: number;
    readonly context: any;
    static getMessage(transactionId: string, chainId: number): string;
    constructor(transactionId: string, chainId: number, context?: any);
}
//# sourceMappingURL=error.d.ts.map