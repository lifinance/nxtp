import { utils } from "ethers";
export declare const getTransactionId: (chainId: string, signerAddress: string, randomSalt: string) => string;
/**
 * Get gas limit if it's hardcoded for some chains
 * @param chainId
 * @returns Gas Limit
 */
export declare const getGasLimit: (_chainId: number) => number | undefined;
/**
 * Utility to convert the number of hours into seconds
 *
 * @param hours - Number of hours to convert
 * @returns Equivalent seconds
 */
export declare const hoursToSeconds: (hours: number) => number;
/**
 * Utility to convert the number of days into seconds
 *
 * @param days - Number of days to convert
 * @returns Equivalent seconds
 */
export declare const daysToSeconds: (days: number) => number;
/**
 * Gets the expiry to use for new transfers
 *
 * @param latestBlockTimestamp - Timestamp of the latest block on the sending chain (from `getTimestampInSeconds`)
 * @returns Default expiry of 3 days + 3 hours (in seconds)
 */
export declare const getExpiry: (latestBlockTimestamp: number) => number;
/**
 * Gets the minimum expiry buffer
 *
 * @returns Equivalent of 2days + 1 hour in seconds
 */
export declare const getMinExpiryBuffer: () => number;
/**
 * Gets the maximum expiry buffer
 *
 * @remarks This is *not* the same as the contract maximum of 30days
 *
 * @returns Equivalent of 4 days
 */
export declare const getMaxExpiryBuffer: () => number;
/**
 * Gets metaTxBuffer in percentage
 *
 * @returns Percentage value to be added
 */
export declare const getMetaTxBuffer: () => number;
export declare const signFulfillTransactionPayload: (transactionId: string, relayerFee: string, receivingChainId: number, receivingChainTxManagerAddress: string, signer: import("ethers").Signer | import("ethers").Wallet) => Promise<string>;
export declare const getFulfillTransactionHashToSign: (transactionId: string, relayerFee: string, receivingChainId: number, receivingChainTxManagerAddress: string) => string;
export declare const generateMessagingInbox: () => string;
export declare const recoverAuctionBid: (bid: import("@sinclair/typebox").ReduceModifiers<import("@sinclair/typebox").StaticModifiers<{
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
}>>, signature: string) => string;
export declare const getTimestampInSeconds: () => Promise<number>;
export declare const getOnchainBalance: (assetId: string, address: string, provider: import("@ethersproject/abstract-provider").Provider) => Promise<import("ethers").BigNumber>;
export declare const encodeAuctionBid: (bid: import("@sinclair/typebox").ReduceModifiers<import("@sinclair/typebox").StaticModifiers<{
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
}>>) => string;
export declare const ethereumRequest: (method: string, params: string[]) => Promise<any>;
export declare const encrypt: (message: string, publicKey: string) => Promise<string>;
export declare const gelatoFulfill: (chainId: number, address: string, abi: utils.Interface, fulfillArgs: import("@connext/nxtp-utils").FulfillParams) => Promise<any>;
export declare const isChainSupportedByGelato: (chainId: number) => Promise<boolean>;
export declare const getChainData: () => Promise<Map<string, import("@connext/nxtp-utils").ChainData> | undefined>;
export declare const getDecimalsForAsset: (assetId: string, chainId: number, provider: import("@ethersproject/abstract-provider").Provider, chainData?: Map<string, import("@connext/nxtp-utils").ChainData> | undefined) => Promise<number>;
//# sourceMappingURL=utils.d.ts.map