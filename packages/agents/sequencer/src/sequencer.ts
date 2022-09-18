import { logger, Wallet } from "ethers";
import {
  Logger,
  getChainData,
  RequestContext,
  createLoggingContext,
  createMethodContext,
  ChainData,
  jsonifyError,
  BaseRequestContext,
  MethodContext,
  NxtpError,
  RelayerTaskStatus,
} from "@connext/nxtp-utils";
import Broker from "foo-foo-mq";
import { SubgraphReader } from "@connext/nxtp-adapters-subgraph";
import { StoreManager } from "@connext/nxtp-adapters-cache";
import { ChainReader, getContractInterfaces, contractDeployments } from "@connext/nxtp-txservice";
import { Web3Signer } from "@connext/nxtp-adapters-web3signer";
import interval from "interval-promise";

import { MessageType, SequencerConfig } from "./lib/entities";
import { getConfig } from "./config";
import { AppContext } from "./lib/entities/context";
import { bindHealthServer, bindSubscriber } from "./bindings/subscriber";
import { bindServer } from "./bindings/publisher";
import { setupRelayer } from "./adapters";
import { getHelpers } from "./lib/helpers";
import { getOperations } from "./lib/operations";

const context: AppContext = {} as any;
export const getContext = () => context;
export const msgContentType = "application/json";

/// MARK - Make Agents
/**
 * Sets up and runs the sequencer publisher unit. Receives bids from router network and assigns to transfer by ID,
 * publishing transfer info for consumption by sequencer subscriber (see `makeSubscriber`).
 *
 * @param _configOverride - Overrides for configuration; normally only used for testing.
 */
export const makePublisher = async (_configOverride?: SequencerConfig) => {
  const { requestContext, methodContext } = createLoggingContext(makePublisher.name);
  try {
    context.adapters = {} as any;

    /// MARK - Context
    await setupContext(requestContext, methodContext, _configOverride);

    /// MARK - Bindings
    // Create server, set up routes, and start listening.
    await bindServer();

    context.logger.info("Sequencer boot complete!", requestContext, methodContext, {
      port: {
        pub: context.config.server.pub.port,
        sub: context.config.server.sub.port,
      },
      chains: [...Object.keys(context.config.chains)],
      address: context.adapters.wallet.address,
    });
    console.log(
      `

          _|_|_|     _|_|     _|      _|   _|      _|   _|_|_|_|   _|      _|   _|_|_|_|_|
        _|         _|    _|   _|_|    _|   _|_|    _|   _|           _|  _|         _|
        _|         _|    _|   _|  _|  _|   _|  _|  _|   _|_|_|         _|           _|
        _|         _|    _|   _|    _|_|   _|    _|_|   _|           _|  _|         _|
          _|_|_|     _|_|     _|      _|   _|      _|   _|_|_|_|   _|      _|       _|

        `,
    );
  } catch (error: any) {
    console.error("Error starting publisher :'(", error);
    process.exit(1);
  }
};

/**
 * Sets up and runs the sequencer subscriber unit. Listens for messages regarding incoming bids and delegates
 * to child processes (see `execute` below).
 *
 * @param _configOverride - Overrides for configuration; normally only used for testing.
 */
export const makeSubscriber = async (_configOverride?: SequencerConfig) => {
  const { requestContext, methodContext } = createLoggingContext(makeSubscriber.name);
  try {
    context.adapters = {} as any;

    /// MARK - Context
    await setupContext(requestContext, methodContext, _configOverride);

    // Message queues must be present in the config.
    if (context.config.messageQueue.queues.length === 0) throw new Error("No queues found in config.");

    context.adapters.cache = await setupCache(context.config.redis, context.logger, requestContext);

    context.adapters.mqClient = await setupSubscriber(requestContext);

    if (context.config.messageQueue.subscriber) {
      bindSubscriber(context.config.messageQueue.subscriber);
    } else {
      // By default subscribe to all configured queues concurrently
      await Promise.all(
        context.config.messageQueue.queues.map(async (queueConfig) => {
          if (queueConfig?.name) bindSubscriber(queueConfig.name);
        }),
      );
    }

    // Create health server, set up routes, and start listening.
    await bindHealthServer();
  } catch (error: any) {
    console.error("Error starting subscriber :'(", error);
    Broker.close();
    process.exit(1);
  }
};

/// MARK - Execute
/**
 * A `make` method used to configure a context for handling execution of a given transfer.
 *
 * This is used to separate execution on a transfer-by-transfer basis into child processes.
 * @param _configOverride - Overrides for configuration; normally only used for testing.
 */
export const execute = async (_configOverride?: SequencerConfig) => {
  const {
    execute: { executeFastPathData, executeSlowPathData },
    tasks: { updateTask, getTaskStatus },
  } = getOperations();
  try {
    // Transfer ID is a CLI argument. Always provided by the parent
    const transferId = process.argv[2];
    const messageType = process.argv[3] as MessageType;
    const { requestContext, methodContext } = createLoggingContext(execute.name, undefined, transferId);

    context.adapters = {} as any;

    /// MARK - Config
    // TODO: Setting up the context every time for this execution is non-ideal.
    await setupContext(requestContext, methodContext, _configOverride);

    const { taskId, relayer } =
      messageType === MessageType.ExecuteFast
        ? await executeFastPathData(transferId, requestContext)
        : await executeSlowPathData(transferId, messageType, requestContext);

    let taskStatus = RelayerTaskStatus.NotFound;
    if (taskId && relayer) {
      await new Promise((res) => {
        interval(async (_, stop) => {
          try {
            taskStatus = await getTaskStatus(taskId, relayer);
            logger.debug("Task status", requestContext, methodContext, { taskStatus, taskId });
            if (
              taskStatus === RelayerTaskStatus.ExecSuccess ||
              taskStatus === RelayerTaskStatus.ExecReverted ||
              taskStatus === RelayerTaskStatus.Cancelled ||
              taskStatus === RelayerTaskStatus.Blacklisted
            ) {
              stop();
              res(undefined);
            }
          } catch (error: unknown) {
            context.logger.error(
              "Error getting gelato task status, waiting for next loop",
              requestContext,
              methodContext,
              jsonifyError(error as NxtpError),
            );
          }
        }, 5_000);
      });

      if (taskStatus !== RelayerTaskStatus.NotFound) {
        await updateTask(transferId, taskStatus, messageType);
      }
    }
  } catch (error: any) {
    const { requestContext, methodContext } = createLoggingContext(execute.name);
    if (context.logger)
      context.logger.error("Error executing:", requestContext, methodContext, jsonifyError(error as Error));
    else console.error("Error executing:", error);
    process.exit(1);
  }

  process.exit(0);
};

/// MARK - Context Setup
export const setupContext = async (
  requestContext: BaseRequestContext,
  methodContext: MethodContext,
  _configOverride?: SequencerConfig,
) => {
  /// MARK - Config
  // Get ChainData and parse out configuration.
  context.chainData = await getChainData();
  // Apply override if it used (config override is intended namely for testing purposes).
  context.config = _configOverride ?? (await getConfig(context.chainData, contractDeployments));
  // Init logger used int he application.
  context.logger = new Logger({
    level: context.config.logLevel,
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
  });

  // Publisher must be specified in the config.
  if (!context.config.messageQueue.publisher) throw new Error(`No publisher found in config`);

  context.logger.info("Sequencer config generated.", requestContext, methodContext, {
    config: { ...context.config, mnemonic: context.config.mnemonic ? "*****" : "N/A" },
  });

  /// MARK - Signer
  // Either a mnemonic or a web3signer must be configured for the sequencer.
  // The signer is used for signing approvals for router paths.
  if (!context.config.mnemonic && !context.config.web3SignerUrl) {
    throw new Error(
      "No mnemonic or web3signer was configured. Please ensure either a mnemonic or a web3signer" +
        " URL is provided in the config. Exiting!",
    );
  }
  context.adapters.wallet = context.config.mnemonic
    ? Wallet.fromMnemonic(context.config.mnemonic)
    : new Web3Signer(context.config.web3SignerUrl!);

  /// MARK - Adapters
  // Set up all adapters, peripherals, etc.
  context.adapters.cache = await setupCache(context.config.redis, context.logger, requestContext);
  context.adapters.subgraph = await setupSubgraphReader(requestContext);
  context.adapters.chainreader = new ChainReader(
    context.logger.child({ module: "ChainReader", level: context.config.logLevel }),
    context.config.chains,
  );
  context.adapters.contracts = getContractInterfaces();
  context.adapters.relayer = await setupRelayer();
  context.adapters.mqClient = await setupPublisher(requestContext);
};

export const setupCache = async (
  redis: { host?: string; port?: number },
  logger: Logger,
  requestContext: RequestContext,
): Promise<StoreManager> => {
  const methodContext = createMethodContext(setupCache.name);

  logger.info("Cache instance setup in progress...", requestContext, methodContext, {});
  const cacheInstance = StoreManager.getInstance({
    redis: { host: redis.host, port: redis.port, instance: undefined },
    mock: !redis.host || !redis.port,
    logger: logger.child({ module: "StoreManager" }),
  });

  logger.info("Cache instance setup is done!", requestContext, methodContext, {
    host: redis.host,
    port: redis.port,
  });
  return cacheInstance;
};

export const setupSubgraphReader = async (requestContext: RequestContext): Promise<SubgraphReader> => {
  const { chainData, logger, config } = getContext();
  const {
    auctions: { getMinimumBidsCountForRound },
  } = getHelpers();
  const methodContext = createMethodContext(setupSubgraphReader.name);

  const allowedDomains = [...Object.keys(config.chains)];
  const allowedChainData: Map<string, ChainData> = new Map();
  for (const allowedDomain of allowedDomains) {
    if (chainData.has(allowedDomain)) {
      allowedChainData.set(allowedDomain, chainData.get(allowedDomain)!);
    }
  }

  logger.info("Subgraph reader setup in progress...", requestContext, methodContext, {
    allowedDomains,
  });

  const subgraphReader = await SubgraphReader.create(
    allowedChainData,
    context.config.environment,
    context.config.subgraphPrefix,
  );

  // Pull support for domains that don't have a subgraph.
  const supported: Record<string, boolean> = subgraphReader.supported;
  for (const domain of Object.keys(supported)) {
    // If the domain is set to false, it indicates the SubgraphReader did not find active subgraphs for that domain.
    if (!supported[domain]) {
      delete context.config.chains[domain];
    }
  }

  logger.info("Subgraph reader setup is done!", requestContext, methodContext, {});

  logger.info("Validating the auction round depth for each domain...");
  const maxRoutersPerTransfer = await subgraphReader.getMaxRoutersPerTransfer(Object.keys(supported));
  for (const domain of maxRoutersPerTransfer.keys()) {
    const configuredMaxRouters = getMinimumBidsCountForRound(config.auctionRoundDepth);
    if (maxRoutersPerTransfer.has(domain) && configuredMaxRouters > maxRoutersPerTransfer.get(domain)!) {
      logger.info("Validation error, Invalid auctionRoundDepth configured!", requestContext, methodContext, {
        domain,
        auctionRoundDepth: config.auctionRoundDepth,
        configured: configuredMaxRouters,
        onchain: maxRoutersPerTransfer.get(domain),
      });
      process.exit(1);
    }
  }
  return subgraphReader;
};

export const setupPublisher = async (requestContext: RequestContext): Promise<typeof Broker> => {
  const { logger, config } = context;
  const methodContext = createMethodContext(setupPublisher.name);

  logger.info("MQ publisher setup in progress...", requestContext, methodContext, {});
  const client = await setupMQ(config);
  logger.info("MQ publisher setup is done!", requestContext, methodContext, {});

  return client;
};

export const setupSubscriber = async (requestContext: RequestContext): Promise<typeof Broker> => {
  const { logger, config } = context;
  const methodContext = createMethodContext(setupSubscriber.name);

  logger.info("MQ subscriber setup in progress...", requestContext, methodContext, {});
  const client = await setupMQ(config);
  logger.info("MQ subscriber setup is done!", requestContext, methodContext, {});

  return client;
};

export const setupMQ = async (_config: SequencerConfig): Promise<typeof Broker> => {
  const mqConfig: Broker.ConfigurationOptions = {
    connection: _config.messageQueue.connection,
    exchanges: _config.messageQueue.exchanges,
    queues: _config.messageQueue.queues,
    bindings: _config.messageQueue.bindings,
  };
  await Broker.configure(mqConfig);
  return Broker;
};
