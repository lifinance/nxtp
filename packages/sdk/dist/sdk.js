"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NxtpSdk = exports.createEvts = exports.createMessagingEvt = exports.META_TX_TIMEOUT = exports.AUCTION_TIMEOUT = exports.DEFAULT_SLIPPAGE_TOLERANCE = exports.MAX_SLIPPAGE_TOLERANCE = exports.MIN_SLIPPAGE_TOLERANCE = void 0;
const ethers_1 = require("ethers");
const evt_1 = require("evt");
const nxtp_utils_1 = require("@connext/nxtp-utils");
const error_1 = require("./error");
const types_1 = require("./types");
const utils_1 = require("./utils");
const subgraph_1 = require("./subgraph/subgraph");
const sdkBase_1 = require("./sdkBase");
exports.MIN_SLIPPAGE_TOLERANCE = "00.01"; // 0.01%;
exports.MAX_SLIPPAGE_TOLERANCE = "15.00"; // 15.0%
exports.DEFAULT_SLIPPAGE_TOLERANCE = "0.10"; // 0.10%
exports.AUCTION_TIMEOUT = 30000;
exports.META_TX_TIMEOUT = 300000;
/**
 * Used to make mocking easier
 */
const createMessagingEvt = () => {
    return evt_1.Evt.create();
};
exports.createMessagingEvt = createMessagingEvt;
/**
 * Helper to generate evt instances for all SDK events
 *
 * @returns A container keyed on event names whos values contain the EVT instance for the keyed event
 */
const createEvts = () => {
    return {
        [types_1.NxtpSdkEvents.SenderTokenApprovalSubmitted]: evt_1.Evt.create(),
        [types_1.NxtpSdkEvents.SenderTokenApprovalMined]: evt_1.Evt.create(),
        [types_1.NxtpSdkEvents.SenderTransactionPrepareSubmitted]: evt_1.Evt.create(),
        [types_1.NxtpSdkEvents.SenderTransactionPrepared]: evt_1.Evt.create(),
        [types_1.NxtpSdkEvents.SenderTransactionFulfilled]: evt_1.Evt.create(),
        [types_1.NxtpSdkEvents.SenderTransactionCancelled]: evt_1.Evt.create(),
        [types_1.NxtpSdkEvents.ReceiverPrepareSigned]: evt_1.Evt.create(),
        [types_1.NxtpSdkEvents.ReceiverTransactionPrepared]: evt_1.Evt.create(),
        [types_1.NxtpSdkEvents.ReceiverTransactionFulfilled]: evt_1.Evt.create(),
        [types_1.NxtpSdkEvents.ReceiverTransactionCancelled]: evt_1.Evt.create(),
    };
};
exports.createEvts = createEvts;
/**
 * @classdesc Lightweight class to facilitate interaction with the TransactionManager contract on configured chains.
 *
 */
class NxtpSdk {
    constructor(config) {
        this.config = config;
        this.evts = exports.createEvts();
        const { chainConfig, signer, messagingSigner, messaging, natsUrl, authUrl, logger, network, skipPolling, sdkBase, chainData, } = this.config;
        this.logger = logger !== null && logger !== void 0 ? logger : new nxtp_utils_1.Logger({ name: "NxtpSdk" });
        this.sdkBase =
            sdkBase !== null && sdkBase !== void 0 ? sdkBase : new sdkBase_1.NxtpSdkBase({
                chainConfig,
                signerAddress: signer.getAddress(),
                authUrl,
                messaging,
                natsUrl,
                signer,
                logger: this.logger.child({ name: "NxtpSdkBase" }),
                network,
                messagingSigner,
                skipPolling,
                chainData,
            });
        this.chainData = this.sdkBase.chainData;
    }
    /**
     * Retrieves ChainData and instantiates a new NxtpSdk instance using it.
     *
     * @param config - Sdk configuration params (without chainData).
     * @returns A new NxtpSdk instance.
     */
    static async create(config) {
        const chainData = await nxtp_utils_1.getChainData();
        return new NxtpSdk({ ...config, chainData });
    }
    async connectMessaging(bearerToken) {
        return this.sdkBase.connectMessaging(bearerToken);
    }
    /**
     * Gets all the transactions that could require user action from the subgraph across all configured chains
     *
     * @returns An array of the active transactions and their status
     */
    async getActiveTransactions() {
        return this.sdkBase.getActiveTransactions();
    }
    /**
     * Gets all the transactions that could require user action from the subgraph across all configured chains
     *
     * @returns An array of the active transactions and their status
     */
    async getRouterStatus(requestee) {
        return this.sdkBase.getRouterStatus(requestee);
    }
    /**
     * Gets the current sync status of the subgraph(s) for the specified chain.
     * @param chainId
     * @returns SubgraphSyncRecord for the specified chain.
     */
    getSubgraphSyncStatus(chainId) {
        return this.sdkBase.getSubgraphSyncStatus(chainId);
    }
    /**
     * Gets historical transactions
     *
     * @returns An array of historical transactions
     */
    async getHistoricalTransactions() {
        return this.sdkBase.getHistoricalTransactions();
    }
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
    async getEstimateReceiverAmount(params) {
        return this.sdkBase.getEstimateReceiverAmount(params);
    }
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
    async getTransferQuote(params) {
        var _a, _b;
        const user = await this.config.signer.getAddress();
        // WARNING: default true for now to work with all wallets. eventually fix this to properly encrypt
        const passCalldataUnencrypted = (_a = params.passCalldataUnencrypted) !== null && _a !== void 0 ? _a : true;
        const callData = (_b = params.callData) !== null && _b !== void 0 ? _b : "0x";
        let encryptedCallData = "0x";
        if (callData !== "0x" && !passCalldataUnencrypted) {
            try {
                const encryptionPublicKey = await utils_1.ethereumRequest("eth_getEncryptionPublicKey", [user]);
                encryptedCallData = await nxtp_utils_1.encrypt(callData, encryptionPublicKey);
            }
            catch (e) {
                throw new error_1.EncryptionError("public key encryption failed", nxtp_utils_1.jsonifyError(e));
            }
        }
        if (passCalldataUnencrypted) {
            encryptedCallData = callData;
        }
        return this.sdkBase.getTransferQuote({ ...params, encryptedCallData });
    }
    /**
     * Begins a crosschain transfer by calling `prepare` on the sending chain.
     *
     * @param transferParams - The auction result (winning bid and associated signature)
     * @param transferParams.bid - The winning action bid (includes all data needed to call prepare)
     * @param transferParams.bidSignature - The signature of the router on the winning bid
     * @param infiniteApprove - (optional) If true, will approve the TransactionManager on `transferParams.sendingChainId` for the max value. If false, will approve for only transferParams.amount. Defaults to false
     * @returns A promise with the transactionId and the `TransactionResponse` returned when the prepare transaction was submitted, not mined.
     */
    async prepareTransfer(transferParams, infiniteApprove = false, actualAmount) {
        const { requestContext, methodContext } = nxtp_utils_1.createLoggingContext(this.prepareTransfer.name, undefined, transferParams.bid.transactionId);
        this.logger.info("Method started", requestContext, methodContext, { transferParams });
        const { bid, bidSignature } = transferParams;
        const { user, router, sendingAssetId, receivingAssetId, receivingAddress, amount: _amount, expiry, callDataHash, encryptedCallData, sendingChainId, receivingChainId, callTo, transactionId, initiator, } = bid;
        const encodedBid = utils_1.encodeAuctionBid(bid);
        const amount = actualAmount !== null && actualAmount !== void 0 ? actualAmount : _amount;
        const signerAddr = await this.config.signer.getAddress();
        const connectedSigner = this.config.signer;
        const approveTxReq = await this.sdkBase.approveForPrepare({ sendingAssetId, sendingChainId, amount, transactionId }, infiniteApprove);
        const gasLimit = utils_1.getGasLimit(receivingChainId);
        if (approveTxReq) {
            const approveTx = await connectedSigner.sendTransaction({ ...approveTxReq, gasLimit });
            this.evts.SenderTokenApprovalSubmitted.post({
                assetId: sendingAssetId,
                chainId: sendingChainId,
                transactionResponse: approveTx,
            });
            const approveReceipt = await approveTx.wait(1);
            if ((approveReceipt === null || approveReceipt === void 0 ? void 0 : approveReceipt.status) === 0) {
                throw new error_1.SubmitError(transactionId, sendingChainId, signerAddr, "approve", sendingAssetId, { infiniteApprove, amount }, nxtp_utils_1.jsonifyError(new Error("Receipt status is 0")), {
                    approveReceipt,
                });
            }
            this.logger.info("Mined approve tx", requestContext, methodContext, {
                transactionHash: approveReceipt.transactionHash,
            });
            this.evts.SenderTokenApprovalMined.post({
                assetId: sendingAssetId,
                chainId: sendingChainId,
                transactionReceipt: approveReceipt,
            });
        }
        // Prepare sender side tx
        const prepareReq = await this.sdkBase.prepareTransfer(transferParams);
        this.logger.info("Generated prepareReq", requestContext, methodContext, { prepareReq });
        const prepareResponse = await connectedSigner.sendTransaction({ ...prepareReq, gasLimit });
        this.evts.SenderTransactionPrepareSubmitted.post({
            prepareParams: {
                txData: {
                    receivingChainTxManagerAddress: "",
                    user,
                    router,
                    initiator,
                    sendingAssetId,
                    receivingAssetId,
                    sendingChainFallback: user,
                    callTo,
                    receivingAddress,
                    sendingChainId,
                    receivingChainId,
                    callDataHash,
                    transactionId,
                },
                encryptedCallData,
                bidSignature: bidSignature,
                encodedBid,
                amount,
                expiry,
            },
            transactionResponse: prepareResponse,
        });
        return { prepareResponse, transactionId };
    }
    /**
     * Fulfills the transaction on the receiving chain.
     *
     * @param params - The `TransactionPrepared` event payload from the receiving chain
     * @param relayerFee - (optional) The fee paid to relayers. Comes out of the transaction amount the router prepared with. Defaults to 0
     * @param useRelayers - (optional) If true, will use a realyer to submit the fulfill transaction
     * @returns An object containing either the TransactionResponse from self-submitting the fulfill transaction, or the Meta-tx response (if you used meta transactions)
     */
    async fulfillTransfer(params, useRelayers = true) {
        const { requestContext, methodContext } = nxtp_utils_1.createLoggingContext(this.fulfillTransfer.name, undefined, params.txData.transactionId);
        this.logger.info("Method started", requestContext, methodContext, { params, useRelayers });
        const { txData, encryptedCallData } = params;
        if (!this.config.chainConfig[txData.sendingChainId]) {
            throw new error_1.ChainNotConfigured(txData.sendingChainId, Object.keys(this.config.chainConfig));
        }
        if (!this.config.chainConfig[txData.receivingChainId]) {
            throw new error_1.ChainNotConfigured(txData.receivingChainId, Object.keys(this.config.chainConfig));
        }
        const signerAddress = await this.config.signer.getAddress();
        const connectedSigner = this.config.signer;
        let callData = "0x";
        if (txData.callDataHash === ethers_1.utils.keccak256(encryptedCallData)) {
            // Call data was passed unencrypted
            callData = encryptedCallData;
        }
        else if (txData.callDataHash !== ethers_1.utils.keccak256(callData)) {
            try {
                callData = await utils_1.ethereumRequest("eth_decrypt", [encryptedCallData, txData.user]);
            }
            catch (e) {
                throw new error_1.EncryptionError("decryption failed", nxtp_utils_1.jsonifyError(e));
            }
        }
        let calculateRelayerFee = "0";
        if (useRelayers) {
            let relayerFee = params.relayerFee ? ethers_1.BigNumber.from(params.relayerFee) : undefined;
            if (!relayerFee) {
                relayerFee = await this.sdkBase.calculateGasFeeInReceivingTokenForFulfill(txData.receivingChainId, txData.receivingAssetId, {
                    callData,
                    callTo: txData.callTo,
                });
            }
            this.logger.info(`Calculating Gas Fee for fulfill tx. neededGas = ${relayerFee.toString()}`, requestContext, methodContext);
            calculateRelayerFee = relayerFee.toString();
        }
        this.logger.info("Generating fulfill signature", requestContext, methodContext, { calculateRelayerFee });
        const signature = await utils_1.signFulfillTransactionPayload(txData.transactionId, calculateRelayerFee, txData.receivingChainId, txData.receivingChainTxManagerAddress, this.config.signer);
        this.logger.info("Generated signature", requestContext, methodContext, { signature });
        this.evts.ReceiverPrepareSigned.post({ signature, transactionId: txData.transactionId, signer: signerAddress });
        this.logger.info("Preparing fulfill tx", requestContext, methodContext, { calculateRelayerFee });
        const response = await this.sdkBase.fulfillTransfer(params, signature, callData, calculateRelayerFee, useRelayers);
        if (useRelayers) {
            return { transactionHash: response.transactionResponse.transactionHash };
        }
        else {
            this.logger.info("Fulfilling with user's signer", requestContext, methodContext);
            const fulfillResponse = await connectedSigner.sendTransaction(response.transactionRequest);
            this.logger.info("Method complete", requestContext, methodContext, { txHash: fulfillResponse.hash });
            return { transactionHash: fulfillResponse.hash };
        }
    }
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
    async cancel(cancelParams, chainId) {
        const { requestContext, methodContext } = nxtp_utils_1.createLoggingContext(this.cancel.name, undefined, cancelParams.txData.transactionId);
        if (!this.config.chainConfig[chainId]) {
            throw new error_1.ChainNotConfigured(chainId, Object.keys(this.config.chainConfig));
        }
        this.logger.info("Method started", requestContext, methodContext, { chainId, cancelParams });
        const cancelReq = await this.sdkBase.cancel(cancelParams, chainId);
        const connectedSigner = this.config.signer;
        const cancelResponse = await connectedSigner.sendTransaction(cancelReq);
        this.logger.info("Method complete", requestContext, methodContext, { txHash: cancelResponse.hash });
        return cancelResponse;
    }
    /**
     * Get the balance of the given address on the given chain,
     *
     * @param chainId - Chain that the address is on.
     * @param address - Address whose balance we're getting.
     * @param assetId (default: native token) - Asset to get the balance for.
     * @param abi (default: ERC20) - ABI of the contract to get the balance from.
     * @returns BigNumber value of the balance.
     */
    async getBalance(chainId, address, assetId, abi) {
        return await this.sdkBase.chainReader.getBalance(chainId, address, assetId, abi);
    }
    /**
     * Get the decimal places for the specified asset on the specified chain.
     *
     * @param chainId - Chain that the asset is on.
     * @param assetId - Asset to get the decimal places for.
     * @returns number of decimal places.
     */
    async getDecimalsForAsset(chainId, assetId) {
        return await this.sdkBase.chainReader.getDecimalsForAsset(chainId, assetId);
    }
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
    async querySubgraph(chainId, query) {
        return this.sdkBase.querySubgraph(chainId, query);
    }
    /**
     * Changes the injected signer associated with the SDK.
     *
     * @param signer - New injected signer for the SDK to use.
     */
    changeInjectedSigner(signer) {
        this.config.signer = signer;
        this.sdkBase.changeInjectedSigner(signer);
    }
    /**
     * Turns off all listeners and disconnects messaging from the SDK.
     */
    removeAllListeners() {
        this.detach();
        this.sdkBase.removeAllListeners();
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
        if (Object.keys(subgraph_1.SubgraphEvents).includes(event)) {
            this.sdkBase.attach(event, callback, filter);
        }
        else {
            this.evts[event].pipe(filter).attach(...args);
        }
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
        if (Object.keys(subgraph_1.SubgraphEvents).includes(event)) {
            this.sdkBase.attachOnce(event, callback, filter, timeout);
        }
        else {
            this.evts[event].pipe(filter).attachOnce(...args);
        }
    }
    /**
     * Removes all attached handlers from the given event.
     *
     * @param event - (optional) The event name to remove handlers from. If not provided, will detach handlers from *all* subgraph events
     */
    detach(event) {
        if (event) {
            if (Object.keys(subgraph_1.SubgraphEvents).includes(event)) {
                this.sdkBase.detach(event);
            }
            else {
                this.evts[event].detach();
            }
            this.evts[event].detach();
        }
        else {
            Object.values(this.evts).forEach((evt) => evt.detach());
            this.sdkBase.detach();
        }
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
        if (Object.keys(subgraph_1.SubgraphEvents).includes(event)) {
            return this.sdkBase.waitFor(event, timeout, filter);
        }
        else {
            return this.evts[event].pipe(filter).waitFor(timeout);
        }
    }
}
exports.NxtpSdk = NxtpSdk;
//# sourceMappingURL=sdk.js.map