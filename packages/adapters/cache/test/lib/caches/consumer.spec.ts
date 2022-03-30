import {
  Logger,
  XTransferStatus,
  expect,
  mock,
  getRandomBytes32,
  mkAddress,
  XTransfer,
  delay,
} from "@connext/nxtp-utils";
import { ConsumersCache, TransfersCache, AuctionsCache } from "../../../src/index";
import { StoreChannel, SubscriptionCallback } from "../../../src/lib/entities";

const logger = new Logger({ level: "debug" });
const RedisMock = require("ioredis-mock");
let consumers: ConsumersCache;
let auctions: AuctionsCache;
let transactions: TransfersCache;

const fakeTxs = [
  mock.entity.xtransfer("1000", "2000"),
  mock.entity.xtransfer(
    "1000",
    "2000",
    "1000",
    XTransferStatus.XCalled,
    mkAddress("0xaaa"),
    getRandomBytes32(),
    5555,
    mkAddress("0xa"),
  ),
];

let callCountForHighestNonce = 0;
// subscription mock functions
const highestNonceHandler: SubscriptionCallback = async (msg: any, err?: any) => {
  callCountForHighestNonce++;
  console.log(`${highestNonceHandler.name} ===> Received message: ${msg}`);
};

let callCountForNewXCall = 0;
const newXCallHandler: SubscriptionCallback = async (msg: any, err?: any) => {
  callCountForNewXCall++;
  console.log(`${newXCallHandler.name} ===> Received message: ${msg}`);
};

let callCountForNewStatus = 0;
const newStatusHandler: SubscriptionCallback = async (msg: any, err?: any) => {
  callCountForNewStatus++;
  console.log(`${newStatusHandler.name} ===> Received message: ${msg}`);
};

let callCountForNewBid = 0;
const newBidHandler: SubscriptionCallback = async (msg: any, err?: any) => {
  callCountForNewBid++;
  console.log(`${newBidHandler.name} ===> Received message: ${msg}`);
};

describe("ConsumersCache", () => {
  before(async () => {
    logger.debug(`Subscribing to Channels for Redis Pub/Sub`);
    const RedisSub = new RedisMock();

    RedisSub.subscribe(StoreChannel.NewHighestNonce);
    RedisSub.subscribe(StoreChannel.NewXCall);
    // RedisSub.subscribe(StoreChannel.NewStatus);
    RedisSub.subscribe(StoreChannel.NewBid);

    RedisSub.on("message", (chan: any, msg: any) => {
      console.log(`Got Subscribed Message Channel: ${chan as string}, Message Data: ${msg as string}`);
    });

    consumers = new ConsumersCache({ url: "mock", mock: true, logger });
    auctions = new AuctionsCache({ url: "mock", mock: true, logger });
    transactions = new TransfersCache({ url: "mock", mock: true, logger });
  });

  describe("#subscribe", () => {
    it("should be ok", async () => {
      await consumers.subscribe(StoreChannel.NewHighestNonce, highestNonceHandler);
      expect(consumers.subscriptions.has(StoreChannel.NewHighestNonce)).to.be.eq(true);
      await consumers.subscribe(StoreChannel.NewXCall, newXCallHandler);
      expect(consumers.subscriptions.has(StoreChannel.NewXCall)).to.be.eq(true);
      // await consumers.subscribe(StoreChannel.NewStatus, newStatusHandler);
      // expect(consumers.subscriptions.has(StoreChannel.NewStatus)).to.be.eq(true);
      await consumers.subscribe(StoreChannel.NewBid, newBidHandler);
      expect(consumers.subscriptions.has(StoreChannel.NewBid));
    });
  });

  describe("#pub/sub", () => {
    it("subscriptions should be called if the new message arrives from its channel", async () => {
      // StoreChannel.NewXCall + StoreChannel.NewHighestNonce
      callCountForHighestNonce = 0;
      expect(callCountForNewXCall).to.be.eq(0);
      await transactions.storeTransfers([fakeTxs[0]]);
      await delay(100);
      expect(callCountForNewXCall).to.be.eq(1);
      expect(callCountForHighestNonce).to.be.eq(1);

      // StoreChannel.NewStatus
      // TODO: Currently not implemented, method needs reimplementation or to be removed.
      // expect(callCountForNewStatus).to.be.eq(0);
      // await transactions.storeStatus((fakeTxs[0] as XTransfer).transferId, XTransferStatus.Executed);
      // await delay(100);
      // expect(callCountForNewStatus).to.be.eq(1);

      // StoreChannel.NewBid
      expect(callCountForNewBid).to.be.eq(0);
      await auctions.storeBid(mock.entity.bid());
      await delay(100);
      expect(callCountForNewBid).to.be.eq(1);
    });
  });
});