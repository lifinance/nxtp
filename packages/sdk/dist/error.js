"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidRelayerFee = exports.FulfillTimeout = exports.RelayFailed = exports.PollingNotActive = exports.ReceivingChainSubgraphsNotSynced = exports.SendingChainSubgraphsNotSynced = exports.InvalidTxStatus = exports.SubmitError = exports.UnknownAuctionError = exports.NoValidBids = exports.NoBids = exports.NotEnoughAmount = exports.EncryptionError = exports.InvalidBidSignature = exports.InvalidCallTo = exports.InvalidAmount = exports.InvalidExpiry = exports.InvalidSlippage = exports.InvalidParamStructure = exports.PriceOracleNotConfigured = exports.ChainNotConfigured = exports.NoSubgraph = exports.NoPriceOracle = exports.NoTransactionManager = exports.FulfillError = exports.SubgraphError = exports.TransactionManagerError = exports.RelayerError = exports.AuctionError = exports.ParamsError = exports.ConfigError = void 0;
const nxtp_utils_1 = require("@connext/nxtp-utils");
/**
 * @classdesc Represents errors having to do with config issues
 */
class ConfigError extends nxtp_utils_1.NxtpError {
}
exports.ConfigError = ConfigError;
ConfigError.type = ConfigError.name;
/**
 * @classdesc Represents errors having to do with invalid parameter issues
 */
class ParamsError extends nxtp_utils_1.NxtpError {
}
exports.ParamsError = ParamsError;
ParamsError.type = ParamsError.name;
/**
 * @classdesc Represents errors having to do with an auction
 */
class AuctionError extends nxtp_utils_1.NxtpError {
}
exports.AuctionError = AuctionError;
AuctionError.type = AuctionError.name;
/**
 * @classdesc Represents errors having to do with relayers
 */
class RelayerError extends nxtp_utils_1.NxtpError {
}
exports.RelayerError = RelayerError;
RelayerError.type = RelayerError.name;
/**
 * @classdesc Abstract error class thrown by the `TransactionManager` class.
 */
class TransactionManagerError extends nxtp_utils_1.NxtpError {
}
exports.TransactionManagerError = TransactionManagerError;
TransactionManagerError.type = TransactionManagerError.name;
/**
 * @classdesc Abstract error class thrown by the `Subgraph` class.
 */
class SubgraphError extends nxtp_utils_1.NxtpError {
}
exports.SubgraphError = SubgraphError;
SubgraphError.type = SubgraphError.name;
/**
 * @classdesc Abstract error class during fulfill.
 */
class FulfillError extends nxtp_utils_1.NxtpError {
}
exports.FulfillError = FulfillError;
FulfillError.type = FulfillError.name;
/**
 * @classdesc Thrown if no tx manager addr for chain
 */
class NoTransactionManager extends ConfigError {
    constructor(chainId, context = {}) {
        super(NoTransactionManager.getMessage(), { chainId, ...context }, ConfigError.type);
        this.chainId = chainId;
        this.context = context;
    }
    static getMessage() {
        return `No transaction manager found, please provide override`;
    }
}
exports.NoTransactionManager = NoTransactionManager;
/**
 * @classdesc Thrown if no price oracle addr for chain
 */
class NoPriceOracle extends ConfigError {
    constructor(chainId, context = {}) {
        super(NoPriceOracle.getMessage(), { chainId, ...context }, ConfigError.type);
        this.chainId = chainId;
        this.context = context;
    }
    static getMessage() {
        return `No price oracle found, please provide override`;
    }
}
exports.NoPriceOracle = NoPriceOracle;
/**
 * @classdesc Thrown if no subgraph addr for chain
 */
class NoSubgraph extends ConfigError {
    constructor(chainId, context = {}) {
        super(NoSubgraph.getMessage(), { chainId, ...context }, ConfigError.type);
        this.chainId = chainId;
        this.context = context;
    }
    static getMessage() {
        return `No subgraph uri found, please provide override`;
    }
}
exports.NoSubgraph = NoSubgraph;
/**
 * @classdesc Thrown if chain not found in config
 */
class ChainNotConfigured extends ConfigError {
    constructor(chainId, supported, context = {}) {
        super(ChainNotConfigured.getMessage(), { chainId, supported, ...context }, ConfigError.type);
        this.chainId = chainId;
        this.supported = supported;
        this.context = context;
    }
    static getMessage() {
        return `No chain config found, please check config`;
    }
}
exports.ChainNotConfigured = ChainNotConfigured;
/**
 * @classdesc Thrown if price oracle not configured
 */
class PriceOracleNotConfigured extends ConfigError {
    constructor(chainId, assetId, context = {}) {
        super(PriceOracleNotConfigured.getMessage(), { chainId, assetId, ...context }, ConfigError.type);
        this.chainId = chainId;
        this.assetId = assetId;
        this.context = context;
    }
    static getMessage() {
        return `Price oracle not configured, please check config`;
    }
}
exports.PriceOracleNotConfigured = PriceOracleNotConfigured;
/**
 * @classdesc Thrown if ajv validation on external params fails
 */
class InvalidParamStructure extends ParamsError {
    constructor(method, typename, error, invalidParams, context = {}) {
        super(InvalidParamStructure.getMessage(), { error, invalidParams, ...context }, ParamsError.type);
        this.error = error;
        this.invalidParams = invalidParams;
        this.context = context;
    }
    static getMessage() {
        return `Invalid Params`;
    }
}
exports.InvalidParamStructure = InvalidParamStructure;
/**
 * @classdesc Thrown if slippage is out of bounds
 */
class InvalidSlippage extends ParamsError {
    constructor(slippage, minSlippage, maxSlippage, context = {}) {
        super(InvalidSlippage.getMessage(), { slippage, min: minSlippage, max: maxSlippage, ...context }, ParamsError.type);
        this.slippage = slippage;
        this.minSlippage = minSlippage;
        this.maxSlippage = maxSlippage;
        this.context = context;
    }
    static getMessage() {
        return `Invalid slippage`;
    }
}
exports.InvalidSlippage = InvalidSlippage;
/**
 * @classdesc Thrown if expiry is out of bounds
 */
class InvalidExpiry extends ParamsError {
    constructor(expiry, minExpiryBuffer, maxExpiryBuffer, timestamp, context = {}) {
        super(InvalidExpiry.getMessage(), { expiry, minBuffer: minExpiryBuffer, maxBuffer: maxExpiryBuffer, timestamp, ...context }, ParamsError.type);
        this.expiry = expiry;
        this.minExpiryBuffer = minExpiryBuffer;
        this.maxExpiryBuffer = maxExpiryBuffer;
        this.timestamp = timestamp;
        this.context = context;
    }
    static getMessage() {
        return `Invalid expiry`;
    }
}
exports.InvalidExpiry = InvalidExpiry;
/**
 * @classdesc Thrown if there is insufficient balance for transfer of that amount
 */
class InvalidAmount extends ParamsError {
    constructor(transactionId, address, balance, amount, chainId, assetId, context = {}) {
        super(InvalidAmount.getMessage(), {
            address,
            transactionId,
            balance,
            amount,
            chainId,
            assetId,
            ...context,
        }, InvalidAmount.type);
        this.transactionId = transactionId;
        this.address = address;
        this.balance = balance;
        this.amount = amount;
        this.chainId = chainId;
        this.assetId = assetId;
        this.context = context;
    }
    static getMessage() {
        return `Insufficient Funds`;
    }
}
exports.InvalidAmount = InvalidAmount;
/**
 * @classdesc Thrown if there callTo is not a Contract
 */
class InvalidCallTo extends ParamsError {
    constructor(transactionId, callTo, context = {}) {
        super(InvalidCallTo.getMessage(), {
            transactionId,
            callTo,
            ...context,
        }, InvalidCallTo.type);
        this.transactionId = transactionId;
        this.callTo = callTo;
        this.context = context;
    }
    static getMessage() {
        return `Invalid CallTo`;
    }
}
exports.InvalidCallTo = InvalidCallTo;
/**
 * @classdesc Thrown when bid signature undefined
 */
class InvalidBidSignature extends ParamsError {
    constructor(transactionId, bid, router, recovered, signature, context = {}) {
        super(InvalidBidSignature.getMessage(), {
            transactionId,
            router,
            recovered,
            signature,
            bid,
            ...context,
        });
        this.transactionId = transactionId;
        this.bid = bid;
        this.router = router;
        this.recovered = recovered;
        this.signature = signature;
        this.context = context;
    }
    static getMessage() {
        return `bid signature invalid`;
    }
}
exports.InvalidBidSignature = InvalidBidSignature;
/**
 * @classdesc Thrown if encryption of calldata fails before auction
 */
class EncryptionError extends nxtp_utils_1.NxtpError {
    constructor(details, error, context = {}) {
        super(EncryptionError.getMessage(details), { encryptionError: error, ...context }, EncryptionError.type);
        this.details = details;
        this.error = error;
        this.context = context;
    }
    static getMessage(details) {
        return `Failed calldata encryption: ${details}`;
    }
}
exports.EncryptionError = EncryptionError;
EncryptionError.type = EncryptionError.name;
/**
 * @classdesc Thrown if receiver amount is less than total fee
 */
class NotEnoughAmount extends nxtp_utils_1.NxtpError {
    constructor(context = {}) {
        super(NotEnoughAmount.getMessage(), { ...context }, NotEnoughAmount.type);
        this.context = context;
    }
    static getMessage() {
        return `Not enough amount for swap`;
    }
}
exports.NotEnoughAmount = NotEnoughAmount;
NotEnoughAmount.type = NotEnoughAmount.name;
/**
 * @classdesc Thrown if no bids received in given timeout
 */
class NoBids extends AuctionError {
    constructor(timeout, transactionId, auction, context = {}) {
        super(NoBids.getMessage(timeout, transactionId), { transactionId, timeout, auction, ...context }, AuctionError.type);
        this.timeout = timeout;
        this.transactionId = transactionId;
        this.auction = auction;
        this.context = context;
    }
    static getMessage(timeout, transactionId) {
        return `No bids received within ${timeout}ms, txId ${transactionId}`;
    }
}
exports.NoBids = NoBids;
/**
 * @classdesc Thrown if no acceptable bids received in given timeout
 */
class NoValidBids extends AuctionError {
    constructor(transactionId, auction, reasons, auctionResponses, context = {}) {
        super(NoValidBids.getMessage(), { transactionId, auction, invalidReasons: reasons, bids: auctionResponses, ...context }, AuctionError.type);
        this.transactionId = transactionId;
        this.auction = auction;
        this.reasons = reasons;
        this.auctionResponses = auctionResponses;
        this.context = context;
    }
    static getMessage() {
        return `No valid bids received`;
    }
}
exports.NoValidBids = NoValidBids;
/**
 * @classdesc Thrown when auction fails in unknown way
 */
class UnknownAuctionError extends AuctionError {
    constructor(transactionId, error, auction, context = {}) {
        super(UnknownAuctionError.getMessage(), { transactionId, auction, auctionError: error, ...context }, AuctionError.type);
        this.transactionId = transactionId;
        this.error = error;
        this.auction = auction;
        this.context = context;
    }
    static getMessage() {
        return `Error validating or retrieving bids`;
    }
}
exports.UnknownAuctionError = UnknownAuctionError;
/**
 * @classdesc Defines the error thrown by the `TransactionManager` class when a transaction fails to be submitted.
 */
class SubmitError extends TransactionManagerError {
    constructor(transactionId, chainId, sender, method, to, params, txserviceError, context = {}) {
        super(SubmitError.getMessage(), {
            transactionId,
            chainId,
            sender,
            method,
            to,
            params,
            txserviceError: nxtp_utils_1.jsonifyError(txserviceError),
            ...context,
        }, SubmitError.type);
        this.transactionId = transactionId;
        this.chainId = chainId;
        this.sender = sender;
        this.method = method;
        this.to = to;
        this.params = params;
        this.txserviceError = txserviceError;
        this.context = context;
    }
    static getMessage() {
        return `failed to submit transaction`;
    }
}
exports.SubmitError = SubmitError;
/**
 * @classdesc Thrown when invalid status
 */
class InvalidTxStatus extends SubgraphError {
    constructor(transactionId, status, record, //ActiveTransaction,
    context = {}) {
        super(InvalidTxStatus.getMessage(), {
            transactionId,
            status,
            record,
            ...context,
        }, SubgraphError.type);
        this.transactionId = transactionId;
        this.status = status;
        this.record = record;
        this.context = context;
    }
    static getMessage() {
        return `Invalid tx status, check subgraph`;
    }
}
exports.InvalidTxStatus = InvalidTxStatus;
/**
 * @classdesc Thrown when subgraphs are not synced
 */
class SendingChainSubgraphsNotSynced extends SubgraphError {
    constructor(sendingSyncStatus, receivingSyncStatus, context = {}) {
        super(SendingChainSubgraphsNotSynced.getMessage(), {
            sendingSyncStatus,
            receivingSyncStatus,
            ...context,
        }, SubgraphError.type);
        this.sendingSyncStatus = sendingSyncStatus;
        this.receivingSyncStatus = receivingSyncStatus;
        this.context = context;
    }
    static getMessage() {
        return `Sending Chain Subgraph not synced`;
    }
}
exports.SendingChainSubgraphsNotSynced = SendingChainSubgraphsNotSynced;
class ReceivingChainSubgraphsNotSynced extends SubgraphError {
    constructor(sendingSyncStatus, receivingSyncStatus, context = {}) {
        super(ReceivingChainSubgraphsNotSynced.getMessage(), {
            sendingSyncStatus,
            receivingSyncStatus,
            ...context,
        }, SubgraphError.type);
        this.sendingSyncStatus = sendingSyncStatus;
        this.receivingSyncStatus = receivingSyncStatus;
        this.context = context;
    }
    static getMessage() {
        return `Subgraph not synced`;
    }
}
exports.ReceivingChainSubgraphsNotSynced = ReceivingChainSubgraphsNotSynced;
/**
 * @classdesc Thrown when polling is not active
 */
class PollingNotActive extends SubgraphError {
    constructor(context = {}) {
        super(PollingNotActive.getMessage(), {
            ...context,
        }, SubgraphError.type);
        this.context = context;
    }
    static getMessage() {
        return `Subgraph polling not active`;
    }
}
exports.PollingNotActive = PollingNotActive;
/**
 * @classdesc Thrown when subgraphs are not synced
 */
class RelayFailed extends FulfillError {
    constructor(transactionId, chainId, context = {}) {
        super(RelayFailed.getMessage(), {
            ...context,
        }, FulfillError.type);
        this.transactionId = transactionId;
        this.chainId = chainId;
        this.context = context;
    }
    static getMessage() {
        return `Relay failed!`;
    }
}
exports.RelayFailed = RelayFailed;
/**
 * @classdesc Thrown when no responses to meta tx request in some timeframe
 */
class FulfillTimeout extends FulfillError {
    constructor(transactionId, timeout, chainId, context = {}) {
        super(FulfillTimeout.getMessage(), {
            transactionId,
            timeout,
            ...context,
        }, FulfillError.type);
        this.transactionId = transactionId;
        this.timeout = timeout;
        this.chainId = chainId;
        this.context = context;
    }
    static getMessage() {
        return `No fulfill response`;
    }
}
exports.FulfillTimeout = FulfillTimeout;
/**
 * @classdesc Thrown when no responses to meta tx request in some timeframe
 */
class InvalidRelayerFee extends FulfillError {
    constructor(transactionId, chainId, context = {}) {
        super(InvalidRelayerFee.getMessage(transactionId, chainId), {
            transactionId,
            chainId,
            ...context,
        }, InvalidRelayerFee.type);
        this.transactionId = transactionId;
        this.chainId = chainId;
        this.context = context;
    }
    static getMessage(transactionId, chainId) {
        return `Relayer fee cannot be zero when using relayers for ${transactionId} on chain ${chainId}`;
    }
}
exports.InvalidRelayerFee = InvalidRelayerFee;
//# sourceMappingURL=error.js.map