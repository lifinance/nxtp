"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NxtpSdkBase = exports.setupChainReader = exports.createMessagingEvt = exports.DELAY_BETWEEN_RETRIES = exports.FULFILL_TIMEOUT = exports.DEFAULT_AUCTION_TIMEOUT = exports.DEFAULT_SLIPPAGE_TOLERANCE = exports.MAX_SLIPPAGE_TOLERANCE = exports.MIN_SLIPPAGE_TOLERANCE = void 0;
const ethers_1 = require("ethers");
const evt_1 = require("evt");
const nxtp_utils_1 = require("@connext/nxtp-utils");
const utils_1 = require("ethers/lib/utils");
const TransactionManager_json_1 = require("@connext/nxtp-contracts/artifacts/contracts/TransactionManager.sol/TransactionManager.json");
const Router_json_1 = require("@connext/nxtp-contracts/artifacts/contracts/Router.sol/Router.json");
const nxtp_txservice_1 = require("@connext/nxtp-txservice");
const error_1 = require("./error");
const transactionManager_1 = require("./transactionManager/transactionManager");
const types_1 = require("./types");
const utils_2 = require("./utils");
const subgraph_1 = require("./subgraph/subgraph");
exports.MIN_SLIPPAGE_TOLERANCE = "00.01"; // 0.01%;
exports.MAX_SLIPPAGE_TOLERANCE = "15.00"; // 15.0%
exports.DEFAULT_SLIPPAGE_TOLERANCE = "0.10"; // 0.10%
exports.DEFAULT_AUCTION_TIMEOUT = 6000;
exports.FULFILL_TIMEOUT = 300000;
exports.DELAY_BETWEEN_RETRIES = 5000;
evt_1.Evt.setDefaultMaxHandlers(250);
/**
 * Used to make mocking easier
 */
const createMessagingEvt = () => {
    return evt_1.Evt.create();
};
exports.createMessagingEvt = createMessagingEvt;
const setupChainReader = (logger, chainConfig) => {
    return new nxtp_txservice_1.ChainReader(logger, chainConfig);
};
exports.setupChainReader = setupChainReader;
/**
 * @classdesc Lightweight class to facilitate interaction with the TransactionManager contract on configured chains.
 *
 */
class NxtpSdkBase {
    constructor(config) {
        this.config = config;
        // Keep messaging evts separate from the evt container that has things
        // attached to it
        this.auctionResponseEvt = exports.createMessagingEvt();
        this.statusResponseEvt = exports.createMessagingEvt();
        const { signerAddress, chainConfig, messagingSigner, messaging, natsUrl, authUrl, logger, network, skipPolling, chainData, } = this.config;
        this.logger = logger !== null && logger !== void 0 ? logger : new nxtp_utils_1.Logger({ name: "NxtpSdk", level: "info" });
        this.config.network = network !== null && network !== void 0 ? network : "testnet";
        this.config.skipPolling = skipPolling !== null && skipPolling !== void 0 ? skipPolling : false;
        this.chainData = chainData;
        if (messaging) {
            this.messaging = messaging;
        }
        else {
            let _natsUrl;
            let _authUrl;
            switch (this.config.network) {
                case "mainnet": {
                    _natsUrl = natsUrl !== null && natsUrl !== void 0 ? natsUrl : (nxtp_utils_1.isNode() ? nxtp_utils_1.NATS_CLUSTER_URL : nxtp_utils_1.NATS_WS_URL);
                    _authUrl = authUrl !== null && authUrl !== void 0 ? authUrl : nxtp_utils_1.NATS_AUTH_URL;
                    break;
                }
                case "testnet": {
                    _natsUrl = natsUrl !== null && natsUrl !== void 0 ? natsUrl : (nxtp_utils_1.isNode() ? nxtp_utils_1.NATS_CLUSTER_URL_TESTNET : nxtp_utils_1.NATS_WS_URL_TESTNET);
                    _authUrl = authUrl !== null && authUrl !== void 0 ? authUrl : nxtp_utils_1.NATS_AUTH_URL_TESTNET;
                    break;
                }
                case "local": {
                    _natsUrl = natsUrl !== null && natsUrl !== void 0 ? natsUrl : (nxtp_utils_1.isNode() ? nxtp_utils_1.NATS_CLUSTER_URL_LOCAL : nxtp_utils_1.NATS_WS_URL_LOCAL);
                    _authUrl = authUrl !== null && authUrl !== void 0 ? authUrl : nxtp_utils_1.NATS_AUTH_URL_LOCAL;
                    break;
                }
            }
            this.messaging = new nxtp_utils_1.UserNxtpNatsMessagingService({
                signer: messagingSigner !== null && messagingSigner !== void 0 ? messagingSigner : ethers_1.Wallet.createRandom(),
                logger: this.logger.child({ module: "UserNxtpNatsMessagingService" }),
                natsUrl: _natsUrl,
                authUrl: _authUrl,
            });
        }
        this.chainReader = exports.setupChainReader(this.logger, chainConfig);
        const txManagerConfig = {};
        const subgraphConfig = {};
        // create configs for subclasses based on passed-in config
        Object.entries(chainConfig).forEach(([_chainId, { transactionManagerAddress: _transactionManagerAddress, priceOracleAddress: _priceOracleAddress, subgraph: _subgraph, subgraphSyncBuffer, },]) => {
            const chainId = parseInt(_chainId);
            let transactionManagerAddress = _transactionManagerAddress;
            if (!transactionManagerAddress) {
                const res = transactionManager_1.getDeployedTransactionManagerContract(chainId);
                if (!res || !res.address) {
                    throw new error_1.NoTransactionManager(chainId);
                }
                transactionManagerAddress = res.address;
            }
            this.config.chainConfig[chainId].transactionManagerAddress = transactionManagerAddress;
            let priceOracleAddress = _priceOracleAddress;
            const chainIdsForGasFee = transactionManager_1.getDeployedChainIdsForGasFee();
            if (!priceOracleAddress && chainIdsForGasFee.includes(chainId)) {
                const res = transactionManager_1.getDeployedPriceOracleContract(chainId);
                if (!res || !res.address) {
                    throw new error_1.NoPriceOracle(chainId);
                }
                priceOracleAddress = res.address;
            }
            txManagerConfig[chainId] = {
                transactionManagerAddress,
                priceOracleAddress: priceOracleAddress || ethers_1.constants.AddressZero,
            };
            // Ensure subgraph is configured properly; may be a CSV env string or an array of subgraph urls.
            const subgraph = Array.isArray(_subgraph)
                ? _subgraph
                : typeof _subgraph === "string"
                    ? _subgraph.replace("]", "").replace("[", "").split(",")
                    : [];
            subgraphConfig[chainId] = {
                subgraph,
                subgraphSyncBuffer,
            };
        });
        this.transactionManager = new transactionManager_1.TransactionManager(txManagerConfig, this.chainReader, signerAddress, this.logger.child({ module: "TransactionManager" }, "debug"));
        this.subgraph = new subgraph_1.Subgraph(signerAddress, subgraphConfig, this.chainReader, this.logger.child({ module: "Subgraph" }));
        if (!skipPolling) {
            this.subgraph.startPolling();
        }
    }
    async connectMessaging(bearerToken) {
        // Setup the subscriptions
        const token = await this.messaging.connect(bearerToken);
        await this.messaging.subscribeToAuctionResponse((_from, inbox, data, err) => {
            this.auctionResponseEvt.post({ inbox, data, err });
        });
        await this.messaging.subscribeToStatusResponse((_from, inbox, data, err) => {
            this.statusResponseEvt.post({ inbox, data, err });
        });
        await nxtp_utils_1.delay(1000);
        return token;
    }
    /**
     * Gets all the transactions that could require user action from the subgraph across all configured chains
     *
     * @returns An array of the active transactions and their status
     */
    async getActiveTransactions() {
        return this.subgraph.getActiveTransactions();
    }
    /**
     *
     * @param chainId
     * @returns
     */
    getSubgraphSyncStatus(chainId) {
        const record = this.subgraph.getSyncStatus(chainId);
        return (record !== null && record !== void 0 ? record : {
            synced: true,
            syncedBlock: 0,
            latestBlock: 0,
        });
    }
    /**
     * Gets historical transactions
     *
     * @returns An array of historical transactions
     */
    async getHistoricalTransactions() {
        return this.subgraph.getHistoricalTransactions();
    }
    async calculateGasFeeInReceivingTokenForFulfill(receivingChainId, receivingAssetId, callDataParams) {
        const { requestContext, methodContext } = nxtp_utils_1.createLoggingContext(this.calculateGasFeeInReceivingTokenForFulfill.name, undefined);
        this.logger.info("Method started", requestContext, methodContext);
        const outputDecimals = await this.chainReader.getDecimalsForAsset(receivingChainId, receivingAssetId);
        return await this.chainReader.calculateGasFeeInReceivingTokenForFulfill(receivingChainId, receivingAssetId, outputDecimals, callDataParams, this.chainData);
    }
    async getEstimateReceiverAmount(params) {
        const { requestContext, methodContext } = nxtp_utils_1.createLoggingContext(this.getEstimateReceiverAmount.name, undefined);
        const { amount, sendingChainId, receivingChainId, sendingAssetId, receivingAssetId, callDataParams, relayerFee: _relayerFee, } = params;
        this.logger.debug("Estimating receiver amount", requestContext, methodContext, {
            amount,
            sendingChainId,
            sendingAssetId,
            receivingChainId,
            receivingAssetId,
        });
        // validate that assets/chains are supported and there is enough liquidity
        const inputDecimals = await this.chainReader.getDecimalsForAsset(sendingChainId, sendingAssetId);
        const outputDecimals = await this.chainReader.getDecimalsForAsset(receivingChainId, receivingAssetId);
        // calculate router fee
        const { receivingAmount: swapAmount, routerFee } = await nxtp_utils_1.getReceiverAmount(amount, inputDecimals, outputDecimals);
        // calculate gas fee
        const gasFee = await this.chainReader.calculateGasFeeInReceivingToken(sendingChainId, sendingAssetId, receivingChainId, receivingAssetId, outputDecimals, this.chainData, requestContext);
        let relayerFee = ethers_1.constants.Zero;
        if (!_relayerFee) {
            relayerFee = await this.chainReader.calculateGasFeeInReceivingTokenForFulfill(receivingChainId, receivingAssetId, outputDecimals, callDataParams, this.chainData, requestContext);
        }
        const totalGasFee = gasFee.add(relayerFee);
        const receiverAmount = ethers_1.BigNumber.from(swapAmount).sub(totalGasFee);
        const totalFee = totalGasFee.add(routerFee);
        return {
            receiverAmount: receiverAmount.toString(),
            totalFee: totalFee.toString(),
            routerFee,
            gasFee: gasFee.toString(),
            relayerFee: relayerFee.toString(),
        };
    }
    async getRouterStatus(requestee) {
        const { requestContext, methodContext } = nxtp_utils_1.createLoggingContext(this.getRouterStatus.name, undefined, "");
        this.logger.debug("Method started", requestContext, methodContext);
        if (!this.messaging.isConnected()) {
            await this.connectMessaging();
        }
        const inbox = utils_2.generateMessagingInbox();
        const statusWaitTimeMs = 2000;
        const statusCtx = evt_1.Evt.newCtx();
        const statusPromise = new Promise(async (resolve) => {
            const statusResponses = [];
            this.statusResponseEvt
                .pipe(statusCtx)
                .pipe((data) => data.inbox === inbox)
                .pipe((data) => !!data.data)
                .attach((data) => {
                statusResponses.push(data.data);
            });
            setTimeout(async () => {
                this.statusResponseEvt.detach(statusCtx);
                return resolve(statusResponses);
            }, statusWaitTimeMs);
        });
        await this.messaging.publishStatusRequest({ requestee }, inbox);
        this.logger.debug(`Waiting up to ${statusWaitTimeMs} ms for responses`, requestContext, methodContext, {
            inbox,
        });
        const receviedStatusResponses = await statusPromise;
        return receviedStatusResponses;
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
        var _a, _b, _c;
        const user = await this.config.signerAddress;
        const transactionId = params.transactionId || utils_2.getTransactionId(params.sendingChainId.toString(), user, nxtp_utils_1.getRandomBytes32());
        const { requestContext, methodContext } = nxtp_utils_1.createLoggingContext(this.getTransferQuote.name, undefined, transactionId);
        this.logger.info("Method started", requestContext, methodContext, { params });
        // Validate params schema
        const validate = nxtp_utils_1.ajv.compile(types_1.CrossChainParamsSchema);
        const valid = validate(params);
        if (!valid) {
            const msg = ((_a = validate.errors) !== null && _a !== void 0 ? _a : []).map((err) => `${err.instancePath} - ${err.message}`).join(",");
            const error = new error_1.InvalidParamStructure("getTransferQuote", "CrossChainParams", msg, params);
            this.logger.error("Invalid transfer params", requestContext, methodContext, nxtp_utils_1.jsonifyError(error), {
                validationError: msg,
                params,
            });
            throw error;
        }
        const { sendingAssetId, sendingChainId, amount, receivingChainId, receivingAssetId, receivingAddress, callTo: _callTo, callData: _callData, encryptedCallData: _encryptedCallData, slippageTolerance = exports.DEFAULT_SLIPPAGE_TOLERANCE, expiry: _expiry, dryRun, preferredRouters: _preferredRouters, initiator, auctionWaitTimeMs = exports.DEFAULT_AUCTION_TIMEOUT, numAuctionResponsesQuorum, relayerFee, callDataGas, } = params;
        const sendingChainProvider = (_b = this.config.chainConfig[sendingChainId]) === null || _b === void 0 ? void 0 : _b.providers;
        const receivingChainProvider = (_c = this.config.chainConfig[receivingChainId]) === null || _c === void 0 ? void 0 : _c.providers;
        if (!sendingChainProvider) {
            throw new error_1.ChainNotConfigured(sendingChainId, Object.keys(this.config.chainConfig));
        }
        if (!receivingChainProvider) {
            throw new error_1.ChainNotConfigured(receivingChainId, Object.keys(this.config.chainConfig));
        }
        const sendingSyncStatus = this.getSubgraphSyncStatus(sendingChainId);
        const receivingSyncStatus = this.getSubgraphSyncStatus(receivingChainId);
        if (!sendingSyncStatus.synced) {
            throw new error_1.SendingChainSubgraphsNotSynced(sendingSyncStatus, receivingSyncStatus, {
                sendingChainId,
                receivingChainId,
            });
        }
        if (!receivingSyncStatus.synced) {
            throw new error_1.ReceivingChainSubgraphsNotSynced(sendingSyncStatus, receivingSyncStatus, {
                sendingChainId,
                receivingChainId,
            });
        }
        if (parseFloat(slippageTolerance) < parseFloat(exports.MIN_SLIPPAGE_TOLERANCE)) {
            throw new error_1.InvalidSlippage(slippageTolerance, exports.MIN_SLIPPAGE_TOLERANCE, exports.MAX_SLIPPAGE_TOLERANCE);
        }
        if (parseFloat(slippageTolerance) > parseFloat(exports.MAX_SLIPPAGE_TOLERANCE)) {
            throw new error_1.InvalidSlippage(slippageTolerance, exports.MIN_SLIPPAGE_TOLERANCE, exports.MAX_SLIPPAGE_TOLERANCE);
        }
        const preferredRouters = (_preferredRouters !== null && _preferredRouters !== void 0 ? _preferredRouters : []).map((a) => ethers_1.utils.getAddress(a));
        const blockTimestamp = await utils_2.getTimestampInSeconds();
        const expiry = _expiry !== null && _expiry !== void 0 ? _expiry : utils_2.getExpiry(blockTimestamp);
        if (expiry - blockTimestamp < utils_2.getMinExpiryBuffer()) {
            throw new error_1.InvalidExpiry(expiry, utils_2.getMinExpiryBuffer(), utils_2.getMaxExpiryBuffer(), blockTimestamp);
        }
        if (expiry - blockTimestamp > utils_2.getMaxExpiryBuffer()) {
            throw new error_1.InvalidExpiry(expiry, utils_2.getMinExpiryBuffer(), utils_2.getMaxExpiryBuffer(), blockTimestamp);
        }
        const callTo = _callTo !== null && _callTo !== void 0 ? _callTo : ethers_1.constants.AddressZero;
        const callData = _callData !== null && _callData !== void 0 ? _callData : "0x";
        const callDataHash = ethers_1.utils.keccak256(callData);
        const encryptedCallData = _encryptedCallData !== null && _encryptedCallData !== void 0 ? _encryptedCallData : "0x";
        if (callData !== "0x" && encryptedCallData === "0x") {
            throw new error_1.EncryptionError("bad public key encryption", undefined, { callData, encryptedCallData });
        }
        const { receiverAmount, totalFee, relayerFee: metaTxRelayerFee, routerFee, gasFee, } = await this.getEstimateReceiverAmount({
            amount,
            sendingChainId,
            sendingAssetId,
            receivingChainId,
            receivingAssetId,
            callDataParams: { callData, callTo, callDataGas },
            relayerFee,
        });
        this.logger.info("Calculated fees", requestContext, methodContext, {
            receiverAmount,
            totalFee,
            metaTxRelayerFee,
            routerFee,
            gasFee,
        });
        if (ethers_1.BigNumber.from(receiverAmount).lt(0)) {
            throw new error_1.NotEnoughAmount({ receiverAmount, totalFee, routerFee, gasFee, relayerFee: metaTxRelayerFee });
        }
        if (!this.messaging.isConnected()) {
            await this.connectMessaging();
        }
        const inbox = utils_2.generateMessagingInbox();
        let receivedBids;
        const auctionBidsPromise = new Promise(async (resolve, reject) => {
            if (dryRun) {
                try {
                    const result = await this.auctionResponseEvt
                        .pipe((data) => data.inbox === inbox)
                        .pipe((data) => !!data.data)
                        .pipe((data) => !data.err)
                        .waitFor(auctionWaitTimeMs);
                    return resolve([result.data]);
                }
                catch (e) {
                    return reject(e);
                }
            }
            if (preferredRouters.length > 0) {
                this.logger.warn("Waiting for preferred routers", requestContext, methodContext, {
                    preferredRouters,
                });
                try {
                    const result = await this.auctionResponseEvt
                        .pipe((data) => data.inbox === inbox)
                        .pipe((data) => !!data.data)
                        .pipe((data) => !data.err)
                        .pipe((data) => preferredRouters.includes(ethers_1.utils.getAddress(data.data.bid.router)))
                        .waitFor(auctionWaitTimeMs * 2); // wait extra for preferred router
                    return resolve([result.data]);
                }
                catch (e) {
                    return reject(e);
                }
            }
            const auctionCtx = evt_1.Evt.newCtx();
            const bids = [];
            this.auctionResponseEvt
                .pipe(auctionCtx)
                .pipe((data) => data.inbox === inbox)
                .pipe((data) => !!data.data)
                .pipe((data) => {
                if (data.err) {
                    this.logger.warn("Invalid bid received", requestContext, methodContext, { inbox, err: data.err });
                    return false;
                }
                return true;
            })
                .attach((data) => {
                bids.push(data.data);
                if (numAuctionResponsesQuorum) {
                    if (bids.length >= numAuctionResponsesQuorum) {
                        return resolve(bids);
                    }
                }
            });
            setTimeout(async () => {
                this.auctionResponseEvt.detach(auctionCtx);
                return resolve(bids);
            }, auctionWaitTimeMs);
        });
        const payload = {
            user,
            initiator: initiator !== null && initiator !== void 0 ? initiator : user,
            sendingChainId,
            sendingAssetId,
            amount,
            receivingChainId,
            receivingAssetId,
            receivingAddress,
            callTo,
            callDataHash,
            encryptedCallData,
            expiry,
            transactionId,
            dryRun: !!dryRun,
        };
        await this.messaging.publishAuctionRequest(payload, inbox);
        this.logger.info(`Waiting up to ${auctionWaitTimeMs} ms for responses`, requestContext, methodContext, {
            inbox,
        });
        try {
            const auctionResponses = await auctionBidsPromise;
            this.logger.info("Auction closed", requestContext, methodContext, {
                auctionResponses,
                transactionId,
                inbox,
            });
            if (dryRun) {
                return { ...auctionResponses[0], totalFee, metaTxRelayerFee, routerFee };
            }
            receivedBids = await Promise.all(auctionResponses.map(async (data) => {
                var _a;
                // validate bid
                // check router sig on bid
                const signer = utils_2.recoverAuctionBid(data.bid, (_a = data.bidSignature) !== null && _a !== void 0 ? _a : "");
                if (signer !== data.bid.router) {
                    const code = await this.chainReader.getCode(receivingChainId, data.bid.router);
                    if (code !== "0x") {
                        const encodedData = new utils_1.Interface(Router_json_1.abi).encodeFunctionData("routerSigner");
                        let routerSigner = await this.chainReader.readTx({
                            to: data.bid.router,
                            data: encodedData,
                            chainId: receivingChainId,
                        });
                        routerSigner = ethers_1.utils.getAddress(ethers_1.utils.hexDataSlice(routerSigner, 12)); // convert 32 bytes to 20 bytes
                        if (routerSigner !== signer) {
                            const msg = "Invalid routerContract signature on bid";
                            this.logger.warn(msg, requestContext, methodContext, { signer, router: data.bid.router, routerSigner });
                            return msg;
                        }
                    }
                    else {
                        const msg = "Invalid router signature on bid";
                        this.logger.warn(msg, requestContext, methodContext, { signer, router: data.bid.router });
                        return msg;
                    }
                }
                // check contract for router liquidity
                try {
                    const routerLiq = await this.transactionManager.getRouterLiquidity(receivingChainId, data.bid.router, receivingAssetId);
                    if (routerLiq.lt(data.bid.amountReceived)) {
                        const msg = "Router's liquidity low";
                        this.logger.warn(msg, requestContext, methodContext, {
                            signer,
                            receivingChainId,
                            receivingAssetId,
                            router: data.bid.router,
                            routerLiq: routerLiq.toString(),
                            amountReceived: data.bid.amountReceived,
                        });
                        return msg;
                    }
                }
                catch (err) {
                    const msg = "Error getting router liquidity";
                    this.logger.error(msg, requestContext, methodContext, nxtp_utils_1.jsonifyError(err), {
                        sendingChainId,
                        receivingChainId,
                    });
                    return msg;
                }
                // check if the price changes unfovorably by more than the slippage tolerance(percentage).
                const lowerBoundExchangeRate = (1 - parseFloat(slippageTolerance) / 100).toString();
                const amtMinusGas = ethers_1.BigNumber.from(data.bid.amountReceived).sub(data.gasFeeInReceivingToken);
                const lowerBound = nxtp_utils_1.calculateExchangeAmount(amtMinusGas.toString(), lowerBoundExchangeRate).split(".")[0];
                // safe calculation if the amountReceived is greater than 4 decimals
                if (ethers_1.BigNumber.from(data.bid.amountReceived).lt(lowerBound)) {
                    const msg = "Invalid bid price: price impact is more than the slippage tolerance";
                    this.logger.warn(msg, requestContext, methodContext, {
                        signer,
                        lowerBound: lowerBound.toString(),
                        bidAmount: data.bid.amount,
                        amtMinusGas: amtMinusGas.toString(),
                        gasFeeInReceivingToken: data.gasFeeInReceivingToken,
                        amountReceived: data.bid.amountReceived,
                        slippageTolerance: slippageTolerance,
                        router: data.bid.router,
                    });
                    return msg;
                }
                return data;
            }));
        }
        catch (e) {
            this.logger.error("Auction error", requestContext, methodContext, nxtp_utils_1.jsonifyError(e), {
                transactionId,
            });
            throw new error_1.UnknownAuctionError(transactionId, nxtp_utils_1.jsonifyError(e), payload, { transactionId });
        }
        if (receivedBids.length === 0) {
            throw new error_1.NoBids(auctionWaitTimeMs, transactionId, payload, { requestContext, methodContext });
        }
        const validBids = receivedBids.filter((x) => typeof x !== "string");
        const invalidBids = receivedBids.filter((x) => typeof x === "string");
        if (validBids.length === 0) {
            throw new error_1.NoValidBids(transactionId, payload, invalidBids.join(","), receivedBids);
        }
        const maximumBid = validBids.sort((a, b) => {
            return ethers_1.BigNumber.from(a.bid.amountReceived).gt(b.bid.amountReceived) ? -1 : 1;
        })[0];
        const filteredBids = validBids.filter((a) => ethers_1.BigNumber.from(a.bid.amountReceived)
            .sub(maximumBid.bid.amountReceived)
            .abs()
            .lte(ethers_1.BigNumber.from(maximumBid.bid.amountReceived).mul(NxtpSdkBase.BID_DEVIATION_TOLERANCE).div(100)));
        const chosen = filteredBids[Math.floor(Math.random() * (filteredBids.length - 1))];
        return { ...chosen, totalFee, metaTxRelayerFee, routerFee };
    }
    async approveForPrepare(approveParams, infiniteApprove = false) {
        const { requestContext, methodContext } = nxtp_utils_1.createLoggingContext(this.approveForPrepare.name, undefined, approveParams.transactionId);
        this.logger.info("Method started", requestContext, methodContext, { approveParams });
        const { sendingAssetId, sendingChainId, amount } = approveParams;
        if (sendingAssetId !== ethers_1.constants.AddressZero) {
            const approveTx = await this.transactionManager.approveTokensIfNeeded(sendingChainId, sendingAssetId, amount, infiniteApprove, requestContext);
            return approveTx;
        }
        return undefined;
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
    async prepareTransfer(transferParams, actualAmount) {
        var _a;
        const { requestContext, methodContext } = nxtp_utils_1.createLoggingContext(this.prepareTransfer.name, undefined, transferParams.bid.transactionId);
        this.logger.info("Method started", requestContext, methodContext, { transferParams, actualAmount });
        const sendingSyncStatus = this.getSubgraphSyncStatus(transferParams.bid.sendingChainId);
        const receivingSyncStatus = this.getSubgraphSyncStatus(transferParams.bid.receivingChainId);
        if (!sendingSyncStatus.synced) {
            throw new error_1.SendingChainSubgraphsNotSynced(sendingSyncStatus, receivingSyncStatus, {
                sendingChainId: transferParams.bid.sendingChainId,
                receivingChainId: transferParams.bid.receivingChainId,
            });
        }
        if (!receivingSyncStatus.synced) {
            throw new error_1.ReceivingChainSubgraphsNotSynced(sendingSyncStatus, receivingSyncStatus, {
                sendingChainId: transferParams.bid.sendingChainId,
                receivingChainId: transferParams.bid.receivingChainId,
            });
        }
        const { bid, bidSignature } = transferParams;
        // Validate params schema
        const validate = nxtp_utils_1.ajv.compile(types_1.AuctionBidParamsSchema);
        const valid = validate(bid);
        if (!valid) {
            const msg = ((_a = validate.errors) !== null && _a !== void 0 ? _a : []).map((err) => `${err.instancePath} - ${err.message}`).join(",");
            const error = new error_1.InvalidParamStructure("prepareTransfer", "AuctionResponse", msg, transferParams, {
                transactionId: transferParams.bid.transactionId,
            });
            this.logger.error("Invalid transfer params", requestContext, methodContext, nxtp_utils_1.jsonifyError(error), {
                validationErrors: validate.errors,
                transferParams,
                bidSignature,
            });
            throw error;
        }
        const { user, router, initiator, sendingAssetId, receivingAssetId, receivingAddress, amount: _amount, expiry, callDataHash, encryptedCallData, sendingChainId, receivingChainId, callTo, transactionId, } = bid;
        const encodedBid = utils_2.encodeAuctionBid(bid);
        const amount = actualAmount || _amount;
        if (!this.config.chainConfig[sendingChainId]) {
            throw new error_1.ChainNotConfigured(sendingChainId, Object.keys(this.config.chainConfig));
        }
        if (!this.config.chainConfig[receivingChainId]) {
            throw new error_1.ChainNotConfigured(receivingChainId, Object.keys(this.config.chainConfig));
        }
        if (!bidSignature) {
            throw new error_1.InvalidBidSignature(transactionId, bid, router);
        }
        if (callTo !== ethers_1.constants.AddressZero) {
            const callToContractCode = await this.chainReader.getCode(receivingChainId, callTo);
            if (!callToContractCode || callToContractCode === "0x") {
                throw new error_1.InvalidCallTo(transactionId, callTo);
            }
        }
        // Prepare sender side tx
        const txData = {
            receivingChainTxManagerAddress: this.transactionManager.getTransactionManagerAddress(receivingChainId),
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
        };
        const params = {
            txData,
            encryptedCallData,
            bidSignature,
            encodedBid,
            amount,
            expiry,
        };
        const tx = await this.transactionManager.prepare(sendingChainId, params, requestContext);
        await this.subgraph.startPolling();
        return tx;
    }
    /**
     * Fulfills the transaction on the receiving chain.
     *
     * @param params - The `TransactionPrepared` event payload from the receiving chain
     * @param relayerFee - (optional) The fee paid to relayers. Comes out of the transaction amount the router prepared with. Defaults to 0
     * @param useRelayers - (optional) If true, will use a realyer to submit the fulfill transaction
     * @returns An object containing either the TransactionResponse from self-submitting the fulfill transaction, or the Meta-tx response (if you used meta transactions)
     */
    async fulfillTransfer(params, fulfillSignature, decryptedCallData, relayerFee = "0", useRelayers = false) {
        var _a;
        const { requestContext, methodContext } = nxtp_utils_1.createLoggingContext(this.fulfillTransfer.name, undefined, params.txData.transactionId);
        this.logger.info("Method started", requestContext, methodContext, { params, useRelayers });
        const transactionId = params.txData.transactionId;
        // Validate params schema
        const validate = nxtp_utils_1.ajv.compile(nxtp_utils_1.TransactionPreparedEventSchema);
        const valid = validate(params);
        if (!valid) {
            const msg = ((_a = validate.errors) !== null && _a !== void 0 ? _a : []).map((err) => `${err.instancePath} - ${err.message}`).join(",");
            const error = new error_1.InvalidParamStructure("fulfillTransfer", "TransactionPrepareEventParams", msg, params, {
                transactionId: transactionId,
            });
            this.logger.error("Invalid Params", requestContext, methodContext, nxtp_utils_1.jsonifyError(error), {
                validationError: msg,
                params,
            });
            throw error;
        }
        const { txData } = params;
        if (!this.config.chainConfig[txData.sendingChainId]) {
            throw new error_1.ChainNotConfigured(txData.sendingChainId, Object.keys(this.config.chainConfig));
        }
        if (!this.config.chainConfig[txData.receivingChainId]) {
            throw new error_1.ChainNotConfigured(txData.receivingChainId, Object.keys(this.config.chainConfig));
        }
        if (useRelayers) {
            const fulfillTxProm = this.waitFor(subgraph_1.SubgraphEvents.ReceiverTransactionFulfilled, exports.FULFILL_TIMEOUT, (data) => {
                return data.txData.transactionId === params.txData.transactionId;
            });
            if (await utils_2.isChainSupportedByGelato(txData.receivingChainId)) {
                this.logger.info("Fulfilling using Gelato Relayer", requestContext, methodContext);
                const deployedContract = this.config.chainConfig[txData.receivingChainId].transactionManagerAddress;
                for (let i = 0; i < 3; i++) {
                    try {
                        const data = await utils_2.gelatoFulfill(txData.receivingChainId, deployedContract, new utils_1.Interface(TransactionManager_json_1.abi), {
                            txData,
                            relayerFee,
                            signature: fulfillSignature,
                            callData: decryptedCallData,
                        });
                        if (!data.taskId) {
                            throw new Error("No taskId returned");
                        }
                        this.logger.info("Submitted using Gelato Relayer", requestContext, methodContext, { data });
                        try {
                            const response = await fulfillTxProm;
                            const ret = {
                                transactionHash: response.transactionHash,
                                chainId: response.txData.receivingChainId,
                            };
                            this.logger.info("Method complete", requestContext, methodContext, ret);
                            return { transactionResponse: ret };
                        }
                        catch (e) {
                            throw e.message.includes("Evt timeout")
                                ? new error_1.FulfillTimeout(txData.transactionId, exports.FULFILL_TIMEOUT, params.txData.receivingChainId, {
                                    requestContext,
                                    methodContext,
                                })
                                : e;
                        }
                    }
                    catch (err) {
                        this.logger.error("Error using Gelato Relayer", requestContext, methodContext, nxtp_utils_1.jsonifyError(err), {
                            attemptNum: i + 1,
                        });
                        await nxtp_utils_1.delay(exports.DELAY_BETWEEN_RETRIES);
                    }
                }
            }
            // If Gelato relayer is not supported or otherwise failed, fall back to using router network.
            this.logger.info("Fulfilling using router network", requestContext, methodContext);
            if (!this.messaging.isConnected()) {
                await this.connectMessaging();
            }
            // send through messaging to metatx relayers
            const responseInbox = utils_2.generateMessagingInbox();
            const request = {
                type: nxtp_utils_1.MetaTxTypes.Fulfill,
                relayerFee,
                to: this.transactionManager.getTransactionManagerAddress(txData.receivingChainId),
                chainId: txData.receivingChainId,
                data: {
                    relayerFee,
                    signature: fulfillSignature,
                    txData,
                    callData: decryptedCallData,
                },
            };
            await this.messaging.publishMetaTxRequest(request, responseInbox);
            this.logger.info("Submitted using router network", requestContext, methodContext, { request });
            try {
                const response = await fulfillTxProm;
                const ret = {
                    transactionHash: response.transactionHash,
                    chainId: response.txData.receivingChainId,
                };
                this.logger.info("Method complete", requestContext, methodContext, ret);
                return { transactionResponse: ret };
            }
            catch (e) {
                throw e.message.includes("Evt timeout")
                    ? new error_1.FulfillTimeout(txData.transactionId, exports.FULFILL_TIMEOUT, params.txData.receivingChainId, {
                        requestContext,
                        methodContext,
                    })
                    : e;
            }
        }
        else {
            this.logger.info("Creating transaction request", requestContext, methodContext);
            const fulfillRequest = await this.transactionManager.fulfill(txData.receivingChainId, {
                callData: decryptedCallData,
                relayerFee,
                signature: fulfillSignature,
                txData,
            }, requestContext);
            this.logger.info("Method complete", requestContext, methodContext, { fulfillRequest });
            return { transactionRequest: fulfillRequest };
        }
    }
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
    async cancel(cancelParams, chainId) {
        var _a;
        const { requestContext, methodContext } = nxtp_utils_1.createLoggingContext(this.cancel.name, undefined, cancelParams.txData.transactionId);
        this.logger.info("Method started", requestContext, methodContext, { chainId, cancelParams });
        const transactionId = cancelParams.txData.transactionId;
        // Validate params schema
        const validate = nxtp_utils_1.ajv.compile(types_1.CancelSchema);
        const valid = validate(cancelParams);
        if (!valid) {
            const msg = ((_a = validate.errors) !== null && _a !== void 0 ? _a : []).map((err) => `${err.instancePath} - ${err.message}`).join(",");
            const error = new error_1.InvalidParamStructure("cancel", "CancelParams", msg, cancelParams, {
                transactionId: transactionId,
            });
            this.logger.error("Invalid Params", requestContext, methodContext, nxtp_utils_1.jsonifyError(error), {
                validationError: msg,
                cancelParams,
            });
            throw error;
        }
        const cancelRequest = await this.transactionManager.cancel(chainId, cancelParams, requestContext);
        this.logger.info("Method complete", requestContext, methodContext, { cancelRequest });
        return cancelRequest;
    }
    /**
     * Gets gas price in target chain
     *
     * @param chainId The network identifier
     *
     * @returns Gas price in BigNumber
     */
    async getGasPrice(chainId, requestContext) {
        this.assertChainIsConfigured(chainId);
        // get gas price
        let gasPrice = ethers_1.BigNumber.from(0);
        try {
            gasPrice = await this.chainReader.getGasPrice(chainId, requestContext);
        }
        catch (e) { }
        return gasPrice;
    }
    async querySubgraph(chainId, query) {
        return this.subgraph.query(chainId, query);
    }
    /**
     * Changes the signer associated with the sdk
     *
     * @param signer - Signer to change to
     */
    changeInjectedSigner(signer) {
        this.config.signer = signer;
    }
    /**
     * Turns off all listeners and disconnects messaging from the sdk
     */
    removeAllListeners() {
        this.auctionResponseEvt.detach();
        this.messaging.disconnect();
        this.subgraph.stopPolling();
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
    attach(event, callback, filter = (_data) => true) {
        this.subgraph.attach(event, callback, filter);
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
        this.subgraph.attachOnce(event, callback, filter, timeout);
    }
    /**
     * Removes all attached handlers from the given event.
     *
     * @param event - (optional) The event name to remove handlers from. If not provided, will detach handlers from *all* subgraph events
     */
    detach(event) {
        this.subgraph.detach(event);
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
        return this.subgraph.waitFor(event, timeout, filter);
    }
    assertChainIsConfigured(chainId) {
        if (!this.config.chainConfig[chainId] || !this.chainReader.isSupportedChain(chainId)) {
            throw new error_1.ChainNotConfigured(chainId, Object.keys(this.config.chainConfig));
        }
    }
}
exports.NxtpSdkBase = NxtpSdkBase;
// Tolerance is a percentage (5 = 5%).
NxtpSdkBase.BID_DEVIATION_TOLERANCE = 5;
//# sourceMappingURL=sdkBase.js.map