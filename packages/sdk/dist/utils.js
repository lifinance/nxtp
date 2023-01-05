"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDecimalsForAsset = exports.getChainData = exports.isChainSupportedByGelato = exports.gelatoFulfill = exports.encrypt = exports.ethereumRequest = exports.encodeAuctionBid = exports.getOnchainBalance = exports.getTimestampInSeconds = exports.recoverAuctionBid = exports.generateMessagingInbox = exports.getFulfillTransactionHashToSign = exports.signFulfillTransactionPayload = exports.getMetaTxBuffer = exports.getMaxExpiryBuffer = exports.getMinExpiryBuffer = exports.getExpiry = exports.daysToSeconds = exports.hoursToSeconds = exports.getGasLimit = exports.getTransactionId = void 0;
const nxtp_utils_1 = require("@connext/nxtp-utils");
const ethers_1 = require("ethers");
const getTransactionId = (chainId, signerAddress, randomSalt) => {
    return ethers_1.utils.keccak256(ethers_1.utils.hexlify(ethers_1.utils.concat([ethers_1.utils.toUtf8Bytes(chainId), ethers_1.utils.toUtf8Bytes(signerAddress), ethers_1.utils.toUtf8Bytes(randomSalt)])));
};
exports.getTransactionId = getTransactionId;
/**
 * Get gas limit if it's hardcoded for some chains
 * @param chainId
 * @returns Gas Limit
 */
const getGasLimit = (_chainId) => {
    return undefined;
};
exports.getGasLimit = getGasLimit;
/**
 * Utility to convert the number of hours into seconds
 *
 * @param hours - Number of hours to convert
 * @returns Equivalent seconds
 */
const hoursToSeconds = (hours) => hours * 60 * 60;
exports.hoursToSeconds = hoursToSeconds;
/**
 * Utility to convert the number of days into seconds
 *
 * @param days - Number of days to convert
 * @returns Equivalent seconds
 */
const daysToSeconds = (days) => exports.hoursToSeconds(days * 24);
exports.daysToSeconds = daysToSeconds;
/**
 * Gets the expiry to use for new transfers
 *
 * @param latestBlockTimestamp - Timestamp of the latest block on the sending chain (from `getTimestampInSeconds`)
 * @returns Default expiry of 3 days + 3 hours (in seconds)
 */
const getExpiry = (latestBlockTimestamp) => latestBlockTimestamp + exports.daysToSeconds(3) + exports.hoursToSeconds(3);
exports.getExpiry = getExpiry;
/**
 * Gets the minimum expiry buffer
 *
 * @returns Equivalent of 2days + 1 hour in seconds
 */
const getMinExpiryBuffer = () => exports.daysToSeconds(2) + exports.hoursToSeconds(1); // 2 days + 1 hour
exports.getMinExpiryBuffer = getMinExpiryBuffer;
/**
 * Gets the maximum expiry buffer
 *
 * @remarks This is *not* the same as the contract maximum of 30days
 *
 * @returns Equivalent of 4 days
 */
const getMaxExpiryBuffer = () => exports.daysToSeconds(4); // 4 days
exports.getMaxExpiryBuffer = getMaxExpiryBuffer;
/**
 * Gets metaTxBuffer in percentage
 *
 * @returns Percentage value to be added
 */
const getMetaTxBuffer = () => {
    return 10; // 10%
};
exports.getMetaTxBuffer = getMetaTxBuffer;
// FOR TEST MOCKING
exports.signFulfillTransactionPayload = nxtp_utils_1.signFulfillTransactionPayload;
exports.getFulfillTransactionHashToSign = nxtp_utils_1.getFulfillTransactionHashToSign;
exports.generateMessagingInbox = nxtp_utils_1.generateMessagingInbox;
exports.recoverAuctionBid = nxtp_utils_1.recoverAuctionBid;
exports.getTimestampInSeconds = nxtp_utils_1.getNtpTimeSeconds;
exports.getOnchainBalance = nxtp_utils_1.getOnchainBalance;
exports.encodeAuctionBid = nxtp_utils_1.encodeAuctionBid;
exports.ethereumRequest = nxtp_utils_1.ethereumRequest;
exports.encrypt = nxtp_utils_1.encrypt;
exports.gelatoFulfill = nxtp_utils_1.gelatoFulfill;
exports.isChainSupportedByGelato = nxtp_utils_1.isChainSupportedByGelato;
exports.getChainData = nxtp_utils_1.getChainData;
exports.getDecimalsForAsset = nxtp_utils_1.getDecimalsForAsset;
//# sourceMappingURL=utils.js.map