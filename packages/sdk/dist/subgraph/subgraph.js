"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subgraph = exports.createSubgraphEvts = exports.SubgraphEvents = exports.convertTransactionToTxData = void 0;
const graphql_request_1 = require("graphql-request");
const evt_1 = require("evt");
const nxtp_utils_1 = require("@connext/nxtp-utils");
const error_1 = require("../error");
const types_1 = require("../types");
const graphqlsdk_1 = require("./graphqlsdk");
/**
 * Converts subgraph transactions to properly typed TransactionData
 *
 * @param transaction Subgraph data
 * @returns Properly formatted TransactionData
 */
const convertTransactionToTxData = (transaction) => {
    return {
        receivingChainTxManagerAddress: transaction.receivingChainTxManagerAddress,
        user: transaction.user.id,
        initiator: transaction.initiator,
        router: transaction.router.id,
        sendingChainId: parseInt(transaction.sendingChainId),
        sendingAssetId: transaction.sendingAssetId,
        sendingChainFallback: transaction.sendingChainFallback,
        amount: transaction.amount.toString(),
        receivingChainId: parseInt(transaction.receivingChainId),
        receivingAssetId: transaction.receivingAssetId,
        receivingAddress: transaction.receivingAddress,
        expiry: parseInt(transaction.expiry),
        callDataHash: transaction.callDataHash,
        callTo: transaction.callTo,
        transactionId: transaction.transactionId,
        preparedBlockNumber: parseInt(transaction.preparedBlockNumber),
    };
};
exports.convertTransactionToTxData = convertTransactionToTxData;
exports.SubgraphEvents = {
    SenderTransactionPrepared: "SenderTransactionPrepared",
    SenderTransactionCancelled: "SenderTransactionCancelled",
    ReceiverTransactionPrepared: "ReceiverTransactionPrepared",
    ReceiverTransactionFulfilled: "ReceiverTransactionFulfilled",
    ReceiverTransactionCancelled: "ReceiverTransactionCancelled",
};
/**
 * Creates an evt container to be used for translating subgraph events into an easy to use and strongly typed format
 * @returns A container keyed on event names with values of the Evt instance used for that event
 */
const createSubgraphEvts = () => {
    return {
        [exports.SubgraphEvents.SenderTransactionPrepared]: evt_1.Evt.create(),
        [exports.SubgraphEvents.SenderTransactionCancelled]: evt_1.Evt.create(),
        [exports.SubgraphEvents.ReceiverTransactionPrepared]: evt_1.Evt.create(),
        [exports.SubgraphEvents.ReceiverTransactionFulfilled]: evt_1.Evt.create(),
        [exports.SubgraphEvents.ReceiverTransactionCancelled]: evt_1.Evt.create(),
    };
};
exports.createSubgraphEvts = createSubgraphEvts;
const DEFAULT_SUBGRAPH_SYNC_BUFFER = 50;
/**
 * @classdesc Handles all user-facing subgraph queries
 */
class Subgraph {
    constructor(userAddress, _chainConfig, chainReader, logger, pollInterval = 10000) {
        this.userAddress = userAddress;
        this.chainReader = chainReader;
        this.logger = logger;
        this.pollInterval = pollInterval;
        this.sdks = {};
        this.evts = exports.createSubgraphEvts();
        this.activeTxs = new Map();
        this.syncStatus = {};
        this.pollingStopperBlock = {};
        this.chainConfig = {};
        Object.entries(_chainConfig).forEach(([chainId, { subgraph, subgraphSyncBuffer: _subgraphSyncBuffer }]) => {
            const cId = parseInt(chainId);
            const fallbackSubgraph = new nxtp_utils_1.FallbackSubgraph(cId, (url) => graphqlsdk_1.getSdk(new graphql_request_1.GraphQLClient(url)), _subgraphSyncBuffer !== null && _subgraphSyncBuffer !== void 0 ? _subgraphSyncBuffer : DEFAULT_SUBGRAPH_SYNC_BUFFER, nxtp_utils_1.SubgraphDomain.COMMON, typeof subgraph === "string" ? [subgraph] : subgraph);
            this.sdks[cId] = fallbackSubgraph;
            this.syncStatus[cId] = {
                latestBlock: 0,
                synced: true,
                syncedBlock: 0,
            };
            this.chainConfig[cId] = {
                subgraph,
                subgraphSyncBuffer: _subgraphSyncBuffer !== null && _subgraphSyncBuffer !== void 0 ? _subgraphSyncBuffer : DEFAULT_SUBGRAPH_SYNC_BUFFER,
            };
        });
    }
    stopPolling() {
        if (this.pollingLoop != null) {
            clearInterval(this.pollingLoop);
            this.pollingLoop = undefined;
        }
    }
    updatePollingStopperBlock(chainId, blockNumber) {
        this.pollingStopperBlock[chainId] = blockNumber;
    }
    async startPolling() {
        Object.keys(this.sdks).map(async (_chainId) => {
            const chainId = parseInt(_chainId);
            this.pollingStopperBlock[chainId] = await this.chainReader.getBlockNumber(chainId);
        });
        if (this.pollingLoop == null) {
            this.pollingLoop = setInterval(async () => {
                const { methodContext, requestContext } = nxtp_utils_1.createLoggingContext("pollingLoop");
                try {
                    const activeTxs = await this.getActiveTransactions();
                    if (activeTxs.length < 1) {
                        let shouldStop = false;
                        await Promise.all(Object.keys(this.sdks).map(async (_chainId) => {
                            const chainId = parseInt(_chainId);
                            if (!this.pollingStopperBlock[chainId] ||
                                this.pollingStopperBlock[chainId] > this.syncStatus[chainId].syncedBlock) {
                                shouldStop = false;
                                return;
                            }
                            else {
                                shouldStop = true;
                            }
                        }));
                        if (shouldStop) {
                            this.stopPolling();
                        }
                    }
                }
                catch (err) {
                    this.logger.error("Error in subgraph loop", requestContext, methodContext, err);
                }
            }, this.pollInterval);
        }
    }
    getSyncStatus(chainId) {
        const { requestContext, methodContext } = nxtp_utils_1.createLoggingContext(this.getSyncStatus.name);
        const records = this.sdks[chainId].records;
        this.logger.debug("Retrieved subgraph sync status.", requestContext, methodContext, {
            chainId,
            records,
            // For easy searching of "no records found" in logs.
            recordsFound: records.length,
        });
        return records[0];
    }
    /**
     * Gets the transactions that the user may need to take action on, or is waiting for the router to take action on. Specifically,
     * transactions that have been prepared on the sending chain, but have yet to be fulfilled on the receiving chain, or have yet
     * to be cancelled on the sending chain
     *
     * @returns All active transactions for the instantiated user
     */
    async getActiveTransactions(_requestContext) {
        const { requestContext, methodContext } = nxtp_utils_1.createLoggingContext(this.getActiveTransactions.name, _requestContext);
        // Step 1: handle any already listed as active transactions.
        // This is important to make sure the events are properly emitted
        // when sdks remain online for the duration of the transaction.
        // i.e. consider the case the sender tx is fulfilled before the loop
        // begins again. then it would not be captured by the subgraph only
        // loop but would exist in the class memory
        // Get all ids organized in an object with keyed on their receiving chain id
        const idsBySendingChains = {};
        [...this.activeTxs.entries()].forEach(([id, tx]) => {
            if (!idsBySendingChains[tx.crosschainTx.invariant.sendingChainId]) {
                idsBySendingChains[tx.crosschainTx.invariant.sendingChainId] = [id];
            }
            else {
                idsBySendingChains[tx.crosschainTx.invariant.sendingChainId].push(id);
            }
        });
        // Gather matching sending-chain records from the subgraph that will *not*
        // be handled by step 2 (i.e. statuses are *not* prepared)
        const nonPreparedSendingTxs = [];
        const user = await this.userAddress;
        const correspondingReceiverTxIdsByChain = {};
        await Promise.all(Object.keys(idsBySendingChains).map(async (sendingChainId) => {
            const chainId = parseInt(sendingChainId);
            const subgraph = this.sdks[chainId];
            if (!subgraph) {
                return;
            }
            const ids = idsBySendingChains[sendingChainId];
            if (ids.length === 0) {
                return;
            }
            const { transactions } = await subgraph.request((client) => client.GetTransactionsWithUser({ transactionIds: ids, userId: user.toLowerCase() }));
            if (transactions.length === 0) {
                return;
            }
            // Get transactions to add
            const toAdd = transactions.filter((x) => !!x && x.status !== graphqlsdk_1.TransactionStatus.Prepared);
            // Add results to sending tx array
            nonPreparedSendingTxs.push(...toAdd);
        }));
        // Get corresponding receiver transaction records
        nonPreparedSendingTxs.forEach((transaction) => {
            if (!correspondingReceiverTxIdsByChain[transaction.receivingChainId]) {
                correspondingReceiverTxIdsByChain[transaction.receivingChainId] = [transaction.transactionId];
            }
            else {
                correspondingReceiverTxIdsByChain[transaction.receivingChainId].push(transaction.transactionId);
            }
        });
        // For each chain, update subgraph sync status
        await this.updateSyncStatus();
        const correspondingReceiverTxs = [];
        await Promise.all(Object.keys(correspondingReceiverTxIdsByChain).map(async (receivingChain) => {
            const subgraph = this.sdks[parseInt(receivingChain)];
            if (!subgraph) {
                return;
            }
            const ids = correspondingReceiverTxIdsByChain[receivingChain];
            if (ids.length === 0) {
                return;
            }
            const { transactions } = await subgraph.request((client) => client.GetTransactionsWithUser({ transactionIds: ids, userId: user.toLowerCase() }));
            if (transactions.length === 0) {
                return;
            }
            // Get transactions to add
            const toAdd = transactions.filter((x) => !!x);
            // Add results to sending tx array
            correspondingReceiverTxs.push(...toAdd);
        }));
        // For all non-prepared sending transactions, post to the correct evt
        // and update the transaction map
        nonPreparedSendingTxs.map((transaction) => {
            const record = this.activeTxs.get(transaction.transactionId);
            const receivingMatches = correspondingReceiverTxs.filter((x) => x.transactionId === transaction.transactionId);
            if (receivingMatches.length > 1) {
                throw new Error("Duplicate transaction ids");
            }
            const [match] = receivingMatches;
            if (transaction.status === graphqlsdk_1.TransactionStatus.Cancelled) {
                // Remove from active transactions
                this.activeTxs.delete(transaction.transactionId);
                // Post data to evt
                const { invariant, sending } = record.crosschainTx;
                this.evts.SenderTransactionCancelled.post({
                    txData: { ...invariant, ...sending },
                    caller: transaction.cancelCaller,
                    transactionHash: transaction.cancelTransactionHash,
                });
                return;
            }
            if (transaction.status === graphqlsdk_1.TransactionStatus.Fulfilled) {
                // Remove from active transactions
                this.activeTxs.delete(transaction.transactionId);
                // Find the matching receiver subgraph tx
                if (!match || match.status !== graphqlsdk_1.TransactionStatus.Fulfilled) {
                    // This should never happen
                    throw new Error("Sender fulfilled, no fulfilled receiver transaction");
                }
                // Post to receiver transaction fulfilled evt
                const { invariant, receiving } = record.crosschainTx;
                this.evts.ReceiverTransactionFulfilled.post({
                    transactionHash: match.fulfillTransactionHash,
                    txData: {
                        ...invariant,
                        amount: receiving.amount,
                        expiry: receiving.expiry,
                        preparedBlockNumber: receiving.preparedBlockNumber,
                    },
                    signature: match.signature,
                    relayerFee: match.relayerFee,
                    callData: match.callData,
                    caller: match.fulfillCaller,
                });
            }
        });
        // Step 2: handle any not-listed active transactions (i.e. sdk has
        // gone offline at some point during the transactions)
        const errors = new Map();
        const txs = await Promise.all(Object.keys(this.sdks).map(async (c) => {
            const chainId = parseInt(c);
            try {
                const user = (await this.userAddress).toLowerCase();
                const subgraph = this.sdks[chainId];
                // get all sender prepared
                const { transactions: senderPrepared } = await subgraph.request((client) => client.GetSenderTransactions({
                    sendingChainId: chainId,
                    userId: user,
                    status: graphqlsdk_1.TransactionStatus.Prepared,
                }));
                // for each, break up receiving txs by chain
                const senderPerChain = {};
                senderPrepared.forEach((tx) => {
                    if (!senderPerChain[tx.receivingChainId]) {
                        senderPerChain[tx.receivingChainId] = [tx];
                    }
                    else {
                        senderPerChain[tx.receivingChainId].push(tx);
                    }
                });
                // for each chain in each of the sets of txs, get the corresponding receiver txs
                const activeTxs = await Promise.all(Object.entries(senderPerChain).map(async ([chainId, senderTxs]) => {
                    const _sdk = this.sdks[parseInt(chainId)];
                    if (!_sdk) {
                        return undefined;
                    }
                    const { transactions: correspondingReceiverTxs } = await _sdk.request((client) => client.GetTransactionsWithUser({
                        transactionIds: senderTxs.map((tx) => tx.transactionId),
                        userId: user.toLowerCase(),
                    }));
                    const active = senderTxs.map((senderTx) => {
                        const correspondingReceiverTx = correspondingReceiverTxs.find((tx) => tx.transactionId === senderTx.transactionId);
                        const sendingTxData = exports.convertTransactionToTxData(senderTx);
                        const { amount: sendingAmount, preparedBlockNumber: sendingPreparedBlockNumber, expiry: sendingExpiry, ...invariant } = sendingTxData;
                        const sendingVariant = {
                            amount: sendingAmount,
                            preparedBlockNumber: sendingPreparedBlockNumber,
                            expiry: sendingExpiry,
                        };
                        const active = this.activeTxs.get(senderTx.transactionId);
                        if (!correspondingReceiverTx) {
                            // if receiver doesnt exist, its a sender prepared
                            // if we are not tracking it
                            const common = {
                                bidSignature: senderTx.bidSignature,
                                caller: senderTx.prepareCaller,
                                encodedBid: senderTx.encodedBid,
                                encryptedCallData: senderTx.encryptedCallData,
                                transactionHash: senderTx.prepareTransactionHash,
                                preparedTimestamp: senderTx.preparedTimestamp,
                            };
                            const tx = {
                                ...common,
                                crosschainTx: {
                                    invariant,
                                    sending: sendingVariant,
                                },
                                status: exports.SubgraphEvents.SenderTransactionPrepared,
                            };
                            if (!active) {
                                this.activeTxs.set(senderTx.transactionId, tx);
                                this.evts.SenderTransactionPrepared.post({
                                    ...common,
                                    txData: sendingTxData,
                                });
                            }
                            return tx;
                            // otherwise we are already tracking, no change
                        }
                        if (correspondingReceiverTx.status === graphqlsdk_1.TransactionStatus.Prepared) {
                            const receiverData = exports.convertTransactionToTxData(correspondingReceiverTx);
                            const common = {
                                bidSignature: correspondingReceiverTx.bidSignature,
                                caller: correspondingReceiverTx.prepareCaller,
                                encodedBid: correspondingReceiverTx.encodedBid,
                                encryptedCallData: correspondingReceiverTx.encryptedCallData,
                                transactionHash: correspondingReceiverTx.prepareTransactionHash,
                                preparedTimestamp: senderTx.preparedTimestamp,
                            };
                            const { amount, expiry, preparedBlockNumber, ...invariant } = receiverData;
                            const tx = {
                                ...common,
                                crosschainTx: {
                                    invariant,
                                    receiving: { amount, expiry, preparedBlockNumber },
                                    sending: sendingVariant,
                                },
                                status: exports.SubgraphEvents.ReceiverTransactionPrepared,
                            };
                            if (!active) {
                                this.logger.warn("Missing active sender tx", requestContext, methodContext, {
                                    transactionId: invariant.transactionId,
                                    active: Array.from(this.activeTxs.keys()).toString(),
                                });
                            }
                            // if receiver is prepared, its a receiver prepared
                            // if we are not tracking it or the status changed post an event
                            if (!active || active.status !== exports.SubgraphEvents.ReceiverTransactionPrepared) {
                                this.activeTxs.set(senderTx.transactionId, tx);
                                this.evts.ReceiverTransactionPrepared.post({
                                    ...common,
                                    txData: receiverData,
                                    transactionHash: correspondingReceiverTx.prepareTransactionHash,
                                });
                            }
                            return tx;
                            // otherwise we are already tracking, no change
                        }
                        if (correspondingReceiverTx.status === graphqlsdk_1.TransactionStatus.Fulfilled) {
                            const tx = {
                                txData: exports.convertTransactionToTxData(correspondingReceiverTx),
                                signature: correspondingReceiverTx.signature,
                                relayerFee: correspondingReceiverTx.relayerFee,
                                callData: correspondingReceiverTx.callData,
                                caller: correspondingReceiverTx.fulfillCaller,
                                transactionHash: correspondingReceiverTx.fulfillTransactionHash,
                            };
                            // if receiver is fulfilled, its a receiver fulfilled
                            // if we are not tracking it or the status changed post an event
                            if (!active || active.status !== exports.SubgraphEvents.ReceiverTransactionFulfilled) {
                                this.activeTxs.delete(senderTx.transactionId);
                                this.evts.ReceiverTransactionFulfilled.post(tx);
                            }
                            return undefined; // no longer active
                        }
                        if (correspondingReceiverTx.status === graphqlsdk_1.TransactionStatus.Cancelled) {
                            const tx = {
                                txData: exports.convertTransactionToTxData(correspondingReceiverTx),
                                relayerFee: correspondingReceiverTx.relayerFee,
                                caller: correspondingReceiverTx.fulfillCaller,
                                transactionHash: correspondingReceiverTx.cancelTransactionHash,
                            };
                            // if receiver is cancelled, its a receiver cancelled
                            if (!active || active.status !== exports.SubgraphEvents.ReceiverTransactionCancelled) {
                                this.activeTxs.delete(senderTx.transactionId);
                                this.evts.ReceiverTransactionCancelled.post(tx);
                            }
                            return undefined; // no longer active
                        }
                        // Unrecognized corresponding status, likely an error with the
                        // subgraph. Throw an error
                        throw new error_1.InvalidTxStatus(correspondingReceiverTx.transactionId, correspondingReceiverTx.status, correspondingReceiverTx);
                    });
                    return active;
                }));
                const activeFlattened = activeTxs.flat().filter((x) => !!x);
                return activeFlattened;
            }
            catch (e) {
                errors.set(chainId, e);
                this.logger.error("Error getting active transactions", requestContext, methodContext, nxtp_utils_1.jsonifyError(e), {
                    chainId,
                });
                return [];
            }
        }));
        // Check to see if errors occurred for all chains (i.e. no active transactions were retrieved).
        if (errors.size > 0 && errors.size === Object.keys(this.sdks).length) {
            throw new nxtp_utils_1.NxtpError("Failed to get active transactions for all chains due to errors", { errors });
        }
        const all = txs.flat();
        if (all.length > 0) {
            this.logger.info("Queried active txs", requestContext, methodContext, {
                active: all.length,
            });
            this.logger.debug("Queried active txs", requestContext, methodContext, { all });
        }
        return all;
    }
    async getHistoricalTransactions(_requestContext) {
        const { requestContext, methodContext } = nxtp_utils_1.createLoggingContext(this.getHistoricalTransactions.name, _requestContext);
        // update subgraphs sync status
        await this.updateSyncStatus();
        const fulfilledTxs = await Promise.all(Object.keys(this.sdks).map(async (c) => {
            const user = (await this.userAddress).toLowerCase();
            const chainId = parseInt(c);
            const subgraph = this.sdks[chainId];
            // get all receiver fulfilled
            const { transactions: receiverFulfilled } = await subgraph.request((client) => client.GetReceiverTransactions({
                receivingChainId: chainId,
                userId: user,
                status: graphqlsdk_1.TransactionStatus.Fulfilled,
            }));
            // for each, break up receiving txs by chain
            const receiverPerChain = {};
            receiverFulfilled.forEach((tx) => {
                if (!receiverPerChain[tx.sendingChainId]) {
                    receiverPerChain[tx.sendingChainId] = [tx];
                }
                else {
                    receiverPerChain[tx.sendingChainId].push(tx);
                }
            });
            const historicalTxs = await Promise.all(Object.entries(receiverPerChain).map(async ([chainId, receiverTxs]) => {
                const _sdk = this.sdks[parseInt(chainId)];
                if (!_sdk) {
                    this.logger.warn("No SDK for chainId", requestContext, methodContext, { chainId });
                    return undefined;
                }
                const { transactions: correspondingSenderTxs } = await _sdk.request((client) => client.GetTransactionsWithUser({
                    transactionIds: receiverTxs.map((tx) => tx.transactionId),
                    userId: user.toLowerCase(),
                }));
                return receiverTxs.map((receiverTx) => {
                    const correspondingSenderTx = correspondingSenderTxs.find((tx) => tx.transactionId === receiverTx.transactionId);
                    if (!correspondingSenderTx) {
                        this.logger.warn("No corresponding sender tx, this should never happen", requestContext, methodContext, { receiverTx });
                        return undefined;
                    }
                    return {
                        status: types_1.HistoricalTransactionStatus.FULFILLED,
                        fulfilledTxHash: receiverTx.fulfillTransactionHash,
                        preparedTimestamp: correspondingSenderTx.preparedTimestamp,
                        crosschainTx: {
                            invariant: {
                                user,
                                router: receiverTx.router.id,
                                initiator: receiverTx.initiator,
                                sendingChainId: Number(receiverTx.sendingChainId),
                                sendingAssetId: receiverTx.sendingAssetId,
                                sendingChainFallback: receiverTx.sendingChainFallback,
                                receivingChainId: Number(receiverTx.receivingChainId),
                                receivingAssetId: receiverTx.receivingAssetId,
                                receivingAddress: receiverTx.receivingAddress,
                                callTo: receiverTx.callTo,
                                callDataHash: receiverTx.callDataHash,
                                transactionId: receiverTx.transactionId,
                                receivingChainTxManagerAddress: receiverTx.receivingChainTxManagerAddress,
                            },
                            sending: {
                                amount: correspondingSenderTx.amount,
                                expiry: Number(correspondingSenderTx.expiry),
                                preparedBlockNumber: Number(correspondingSenderTx.preparedBlockNumber),
                            },
                            receiving: {
                                amount: receiverTx.amount,
                                expiry: Number(receiverTx.expiry),
                                preparedBlockNumber: Number(receiverTx.preparedBlockNumber),
                            },
                        },
                    };
                });
            }));
            return historicalTxs
                .filter((x) => !!x)
                .flat()
                .filter((x) => !!x);
        }));
        const cancelledTxs = await Promise.all(Object.keys(this.sdks).map(async (c) => {
            const user = (await this.userAddress).toLowerCase();
            const chainId = parseInt(c);
            const subgraph = this.sdks[chainId];
            // get all receiver fulfilled
            const { transactions: senderCancelled } = await subgraph.request((client) => client.GetSenderTransactions({
                sendingChainId: chainId,
                userId: user,
                status: graphqlsdk_1.TransactionStatus.Cancelled,
            }));
            const cancelled = senderCancelled.map((tx) => {
                return {
                    status: types_1.HistoricalTransactionStatus.CANCELLED,
                    preparedTimestamp: tx.preparedTimestamp,
                    crosschainTx: {
                        invariant: {
                            user,
                            initiator: tx.initiator,
                            router: tx.router.id,
                            sendingChainId: Number(tx.sendingChainId),
                            sendingAssetId: tx.sendingAssetId,
                            sendingChainFallback: tx.sendingChainFallback,
                            receivingChainId: Number(tx.receivingChainId),
                            receivingAssetId: tx.receivingAssetId,
                            receivingAddress: tx.receivingAddress,
                            callTo: tx.callTo,
                            callDataHash: tx.callDataHash,
                            transactionId: tx.transactionId,
                            receivingChainTxManagerAddress: tx.receivingChainTxManagerAddress,
                        },
                        sending: {
                            amount: tx.amount,
                            expiry: Number(tx.expiry),
                            preparedBlockNumber: Number(tx.preparedBlockNumber),
                        },
                    },
                };
            });
            return cancelled
                .filter((x) => !!x)
                .flat()
                .filter((x) => !!x);
        }));
        return fulfilledTxs.flat().concat(cancelledTxs.flat());
    }
    async query(chainId, query) {
        const subgraph = this.sdks[chainId];
        return await subgraph.query(query);
    }
    /**
     * Update the sync statuses of subgraph providers for each chain.
     * This will enable FallbackSubgraph to use the most in-sync subgraph provider.
     */
    async updateSyncStatus() {
        await Promise.all(Object.keys(this.sdks).map(async (_chainId) => {
            var _a, _b, _c;
            const chainId = parseInt(_chainId);
            const subgraph = this.sdks[chainId];
            const records = await subgraph.sync(() => this.chainReader.getBlockNumber(chainId));
            const mostSynced = records.length > 0 ? records.sort((r) => r.latestBlock - r.syncedBlock)[0] : undefined;
            this.logger.info("Got most synced.", undefined, undefined, {
                subgraph,
                records,
                mostSynced: typeof mostSynced === "undefined" ? "undefined" : mostSynced,
            });
            this.syncStatus[chainId] = {
                latestBlock: (_a = records[0]) === null || _a === void 0 ? void 0 : _a.latestBlock,
                syncedBlock: (_b = mostSynced === null || mostSynced === void 0 ? void 0 : mostSynced.syncedBlock) !== null && _b !== void 0 ? _b : -1,
                synced: (_c = mostSynced === null || mostSynced === void 0 ? void 0 : mostSynced.synced) !== null && _c !== void 0 ? _c : true,
            };
        }));
    }
    // Listener methods
    /**
     * Attaches a callback to the emitted event
     *
     * @param event - The event name to attach a handler for
     * @param callback - The callback to invoke on event emission
     * @param filter - (optional) A filter where callbacks are only invoked if the filter returns true
     * @param timeout - (optional) A timeout to detach the handler within. I.e. if no events fired within the timeout, then the handler is detached
     */
    attach(event, callback, filter = (_data) => true, timeout) {
        const args = [timeout, callback].filter((x) => !!x);
        this.evts[event].pipe(filter).attach(...args);
    }
    /**
     * Attaches a callback to the emitted event that will be executed one time and then detached.
     *
     * @param event - The event name to attach a handler for
     * @param callback - The callback to invoke on event emission
     * @param filter - (optional) A filter where callbacks are only invoked if the filter returns true
     * @param timeout - (optional) A timeout to detach the handler within. I.e. if no events fired within the timeout, then the handler is detached
     *
     */
    attachOnce(event, callback, filter = (_data) => true, timeout) {
        const args = [timeout, callback].filter((x) => !!x);
        this.evts[event].pipe(filter).attachOnce(...args);
    }
    /**
     * Removes all attached handlers from the given event.
     *
     * @param event - (optional) The event name to remove handlers from. If not provided, will detach handlers from *all* subgraph events
     */
    detach(event) {
        if (event) {
            this.evts[event].detach();
            return;
        }
        Object.values(this.evts).forEach((evt) => evt.detach());
    }
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
    waitFor(event, timeout, filter = (_data) => true) {
        if (!this.pollingLoop) {
            this.startPolling();
        }
        return this.evts[event].pipe(filter).waitFor(timeout);
    }
}
exports.Subgraph = Subgraph;
//# sourceMappingURL=subgraph.js.map