import { BigNumber, providers } from "ethers";
import { PrepareParams, CancelParams, FulfillParams, Logger, RequestContext } from "@connext/nxtp-utils";
import { ChainReader } from "@connext/nxtp-txservice";
/**
 * Returns the address of the `TransactionManager` deployed to the provided chain, or undefined if it has not been deployed
 *
 * @param chainId - The chain you want the address on
 * @returns The deployed address or `undefined` if it has not been deployed yet
 */
export declare const getDeployedTransactionManagerContract: (chainId: number) => {
    address: string;
    abi: any;
} | undefined;
/**
 * Returns the address of the `PriceOracle` deployed to the provided chain, or undefined if it has not been deployed
 *
 * @param chainId - The chain you want the address on
 * @returns The deployed address or `undefined` if it has not been deployed yet
 */
export declare const getDeployedPriceOracleContract: (chainId: number) => {
    address: string;
    abi: any;
} | undefined;
/**
 * Returns the addresses where the price oracle contract is deployed to
 */
export declare const getDeployedChainIdsForGasFee: () => number[];
export declare type TransactionManagerChainConfig = {
    transactionManagerAddress: string;
    priceOracleAddress: string;
};
/**
 * @classdesc Multi-chain wrapper around TranasctionManager contract interactions
 */
export declare class TransactionManager {
    private readonly chainReader;
    private readonly signerAddress;
    private readonly logger;
    private chainConfig;
    private txManagerInterface;
    private erc20Interface;
    constructor(_chainConfig: {
        [chainId: number]: TransactionManagerChainConfig;
    }, chainReader: ChainReader, signerAddress: Promise<string> | string, logger: Logger);
    /**
     * Returns the address of the `TransactionManager` deployed to the provided chain, or undefined if it has not been deployed
     *
     * @param chainId - The chain you want the address on
     * @returns The deployed address or `undefined` if it has not been deployed yet
     */
    getTransactionManagerAddress(chainId: number): string | undefined;
    /**
     * Sends the prepare transaction to the `TransactionManager` on the provided chain.
     *
     * @param chainId - The chain you want to prepare the transaction on (transactionData.sendingChainId)
     * @param prepareParams - The arguments to be submitted to chain
     * @param prepareParams.txData - The `InvariantTransactionData` for the transaction being prepared
     * @param prepareParams.amount - The amount to be sent from the signer to the `Transactionmanager`
     * @param prepareParams.expiry - The timestamp the transaction will expire by
     * @param prepareParams.encryptedCallData - The encrypted calldata to be executed on the receiving chain
     * @param prepareParams.encodedBid - The encoded auction bid
     * @param prepareParams.bidSignature - The signature on the winning bid
     * @returns If successful, returns the `TransactionResponse` from the signer once the transaction has been submitted, not mined. If the function errors, will return a TransacionManagerError
     */
    prepare(chainId: number, prepareParams: PrepareParams, _requestContext?: RequestContext<string>): Promise<providers.TransactionRequest>;
    /**
     * Sends the cancel transaction to the `TransactionManager` on the provided chain.
     *
     * @param chainId - The chain you want to cancel the transaction
     * @param cancelParams - The arguments to submit to chain
     * @param cancelParams.txData - The `TransactionData` (variant and invariant data) for the transaction being cancelled
     * @param cancelParams.relayerFee - The amount to be awarded to relayer for submitting the transaction to the `TransactionManager` (respected IFF on the sending chain and post-expiry)
     * @param cancelParams.signature - User's signature on cancel payload to be used by relayer when submitting transaction
     * @returns If successful, returns `TransactionResponse` from the signer once the transaction has been submitted, not mined. If it errors, returns a `TransactionManagerError`
     *
     * @remarks
     * Can be the sender chain if the transfer has expired, or the receiver chain before the expiry
     */
    cancel(chainId: number, cancelParams: CancelParams, _requestContext?: RequestContext<string>): Promise<providers.TransactionRequest>;
    /**
     * Sends the fulfill transaction to the `TransactionManager` on the provided chain.
     *
     * @param chainId - The chain you want to fulfill the transaction on (transactionData.receivingChainId)
     * @param fulfillParams - The arguments to submit to chain
     * @param fulfillParams.txData - The `TransactionData` (variant and invariant data) for the transaction being fulfilled
     * @param fulfillParams.relayerFee - The amount to be awarded to relayer for submitting the transaction to the `TransactionManager`
     * @param fulfillParams.signature - User's signature on fulfill payload to be used by relayer when submitting transaction
     * @param fulfillParams.callData - The unencrypted call data corresponding to the `transactionData.callDataHash`
     *
     * @returns If successful, returns `TransactionResponse` from the signer once the transaction has been submitted, not mined. If it errors, returns a `TransactionManagerError`
     *
     * @remarks
     * User cannot be assumed to have gas on the receiving chain, so may use a relayer rather than submit the transaction themselves.
     */
    fulfill(chainId: number, fulfillParams: FulfillParams, _requestContext?: RequestContext<string>): Promise<providers.TransactionRequest>;
    /**
     * Approves tokens with the given assetId for the TransactionManager on the specified chainId to spend if the current allowance is below the specified amount threshold
     *
     * @param chainId - The chain you want to increase `TransactionManager` allowance on
     * @param assetId - The asset you want to increase allowance for
     * @param amount - The minimum approval amount
     * @param infiniteApprove - (optional) If true, approves the max value. Defaults to false.
     *
     * @returns If successful, either returns `TransactionResponse` from the signer once the transaction has been submitted, not mined if the allowance was increased, or undefined if the allowance >= amount. If it errors, returns a `TransactionManagerError`.
     */
    approveTokensIfNeeded(chainId: number, assetId: string, amount: string, infiniteApprove?: boolean, _requestContext?: RequestContext): Promise<providers.TransactionRequest | undefined>;
    /**
     * Returns the available liquidity for the given router of the given asset on the `TransactionManager` contract for the specified chain.
     *
     * @param chainId - The chain you want to check liquidity on
     * @param router - The router you want to check the liquidity of
     * @param assetId - The asset you want to check the liquidity of
     * @returns Either the BigNumber representation of the available router liquidity in the provided asset, or a TransactionManagerError if the function failed
     */
    getRouterLiquidity(chainId: number, router: string, assetId: string): Promise<BigNumber>;
    private assertChainIsConfigured;
}
//# sourceMappingURL=transactionManager.d.ts.map