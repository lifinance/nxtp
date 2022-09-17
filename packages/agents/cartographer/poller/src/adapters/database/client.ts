import {
  XTransfer,
  XTransferStatus,
  RouterBalance,
  convertFromDbTransfer,
  XMessage,
  RootMessage,
  convertFromDbMessage,
} from "@connext/nxtp-utils";
import { Pool } from "pg";
import * as db from "zapatos/db";
import { raw } from "zapatos/db";
import type * as s from "zapatos/schema";
import { BigNumber } from "ethers";
import {
  PrismaClient,
  TransferStatus,
  Prisma,
  Transfers,
  Messages,
  SentRootMessages,
  ProcessedRootMessages,
} from "@prisma/client";

import { pool } from "./index";

const convertToDbTransfer = (transfer: XTransfer): Transfers => {
  return {
    transfer_id: transfer.transferId,
    nonce: transfer.nonce ? BigInt(transfer.nonce) : null,

    to: transfer.xparams?.to,
    call_data: transfer.xparams?.callData,
    origin_domain: transfer.xparams!.originDomain,
    destination_domain: transfer.xparams!.destinationDomain,
    agent: transfer.xparams?.agent,
    recovery: transfer.xparams?.recovery,
    callback: transfer.xparams?.callback,
    callback_fee: transfer.xparams?.callbackFee as any,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    relayer_fee: transfer.xparams?.relayerFee as any,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    destination_min_out: transfer.xparams?.destinationMinOut as any,

    force_slow: transfer.xparams?.forceSlow,
    receive_local: transfer.xparams?.receiveLocal,

    origin_chain: transfer.origin?.chain ?? null,
    origin_transacting_asset: transfer.origin?.assets.transacting.asset ?? null,
    origin_transacting_amount: transfer.origin?.assets.transacting.amount
      ? new Prisma.Decimal(transfer.origin?.assets.transacting.amount)
      : null,
    origin_bridged_asset: transfer.origin?.assets.bridged.asset ?? null,
    origin_bridged_amount: transfer.origin?.assets.bridged.amount as any,
    xcall_caller: transfer.origin?.xcall.caller ?? null,
    xcall_transaction_hash: transfer.origin?.xcall?.transactionHash ?? null,
    xcall_timestamp: transfer.origin?.xcall?.timestamp ?? null,
    xcall_gas_price: transfer.origin?.xcall?.gasPrice as any,
    xcall_gas_limit: transfer.origin?.xcall?.gasLimit as any,
    xcall_block_number: transfer.origin?.xcall?.blockNumber ?? null,

    destination_chain: transfer.destination?.chain ?? null,
    status: transfer.destination?.status ?? TransferStatus.XCalled,
    routers: transfer.destination?.routers ?? [],
    destination_transacting_asset: transfer.destination?.assets.transacting?.asset ?? null,
    destination_transacting_amount: transfer.destination?.assets.transacting?.amount
      ? new Prisma.Decimal(transfer.destination?.assets.transacting?.amount)
      : null,
    destination_local_asset: transfer.destination?.assets.local?.asset ?? null,
    destination_local_amount: transfer.destination?.assets.local?.amount
      ? new Prisma.Decimal(transfer.destination?.assets.local?.amount)
      : null,

    execute_caller: transfer.destination?.execute?.caller ?? null,
    execute_transaction_hash: transfer.destination?.execute?.transactionHash ?? null,
    execute_timestamp: transfer.destination?.execute?.timestamp ?? null,
    execute_gas_price: transfer.destination?.execute?.gasPrice
      ? new Prisma.Decimal(transfer.destination?.execute?.gasPrice)
      : null,
    execute_gas_limit: transfer.destination?.execute?.gasLimit
      ? new Prisma.Decimal(transfer.destination?.execute?.gasLimit)
      : null,
    execute_block_number: transfer.destination?.execute?.blockNumber ?? null,
    execute_origin_sender: transfer.destination?.execute?.originSender ?? null,

    reconcile_caller: transfer.destination?.reconcile?.caller ?? null,
    reconcile_transaction_hash: transfer.destination?.reconcile?.transactionHash ?? null,
    reconcile_timestamp: transfer.destination?.reconcile?.timestamp ?? null,
    reconcile_gas_price: transfer.destination?.reconcile?.gasPrice
      ? new Prisma.Decimal(transfer.destination?.reconcile?.gasPrice)
      : null,
    reconcile_gas_limit: transfer.destination?.reconcile?.gasLimit
      ? new Prisma.Decimal(transfer.destination?.reconcile?.gasLimit)
      : null,
    reconcile_block_number: transfer.destination?.reconcile?.blockNumber ?? null,
    update_time: new Date(),
    transfer_status_message_by_agent: null,
    transfer_status_update_by_agent: null,
  };
};

const convertToDbMessage = (message: XMessage): Messages => {
  return {
    leaf: message.leaf,
    origin_domain: message.originDomain,
    destination_domain: message.destinationDomain,
    index: message.origin?.index ? new Prisma.Decimal(message.origin?.index) : null,
    root: message.origin?.root,
    message: message.origin?.message,
    processed: message.destination?.processed ?? null,
    return_data: message.destination?.returnData ?? null,
  };
};

const convertToDbSentRootMessage = (message: RootMessage): SentRootMessages => {
  return {
    id: message.id,
    spoke_domain: message.spokeDomain,
    hub_domain: message.hubDomain,
    root: message.root,
    caller: message.caller,
    transaction_hash: message.transactionHash,
    sent_timestamp: message.timestamp,
    gas_price: new Prisma.Decimal(message.gasPrice as number),
    gas_limit: new Prisma.Decimal(message.gasLimit as number),
    block_number: message.blockNumber,
  };
};

const convertToDbProcessedRootMessage = (message: RootMessage): ProcessedRootMessages => {
  return {
    id: message.id,
    spoke_domain: message.spokeDomain,
    hub_domain: message.hubDomain,
    root: message.root,
    caller: message.caller,
    transaction_hash: message.transactionHash,
    processed_timestamp: message.timestamp,
    gas_price: new Prisma.Decimal(message.gasPrice as number),
    gas_limit: new Prisma.Decimal(message.gasLimit as number),
    block_number: message.blockNumber,
  };
};

const sanitizeNull = (obj: { [s: string]: any }): any => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
};

export const saveTransfers = async (client: PrismaClient, xtransfers: XTransfer[], _pool?: Pool): Promise<void> => {
  const poolToUse = _pool ?? pool;
  const transfers = xtransfers.map(convertToDbTransfer);
  await client.$transaction(
    transfers.map((t) => client.transfers.upsert({ create: t, update: t, where: { transfer_id: t.transfer_id } })),
  );

  // TODO: make this a single query! we should be able to do this with postgres
  // TODO: Perfomance implications to be evaluated. Upgrade to batching of configured batch size N.
  for (const oneTransfer of transfers) {
    const transfer = sanitizeNull(oneTransfer);
    await db.sql<s.transfers.SQL, s.transfers.JSONSelectable[]>`INSERT INTO ${"transfers"} (${db.cols(transfer)})
    VALUES (${db.vals(transfer)}) ON CONFLICT ("transfer_id") DO UPDATE SET (${db.cols(transfer)}) = (${db.vals(
      transfer,
    )}) RETURNING *`.run(poolToUse);
  }
};

export const saveMessages = async (xMessages: XMessage[], _pool?: Pool): Promise<void> => {
  // The `xMessages` are the ones retrieved only from the origin or destination domain
  const poolToUse = _pool ?? pool;
  const messages: s.messages.Insertable[] = xMessages.map(convertToDbMessage);

  for (const oneMessage of messages) {
    const message = sanitizeNull(oneMessage);
    await db.sql<s.messages.SQL, s.messages.JSONSelectable[]>`INSERT INTO ${"messages"} (${db.cols(message)})
    VALUES (${db.vals(message)}) ON CONFLICT ("leaf") DO UPDATE SET (${db.cols(message)}) = (${db.vals(
      message,
    )}) RETURNING *`.run(poolToUse);
  }
};

export const saveSentRootMessages = async (_messages: RootMessage[], _pool?: Pool): Promise<void> => {
  const poolToUse = _pool ?? pool;
  const messages: s.sent_root_messages.Insertable[] = _messages.map(convertToDbSentRootMessage);

  for (const oneMessage of messages) {
    const message = sanitizeNull(oneMessage);
    await db.sql<
      s.sent_root_messages.SQL,
      s.sent_root_messages.JSONSelectable[]
    >`INSERT INTO ${"sent_root_messages"} (${db.cols(message)})
    VALUES (${db.vals(message)}) ON CONFLICT ("id") DO UPDATE SET (${db.cols(message)}) = (${db.vals(
      message,
    )}) RETURNING *`.run(poolToUse);
  }
};

export const saveProcessedRootMessages = async (_messages: RootMessage[], _pool?: Pool): Promise<void> => {
  const poolToUse = _pool ?? pool;
  const messages: s.processed_root_messages.Insertable[] = _messages.map(convertToDbProcessedRootMessage);

  for (const oneMessage of messages) {
    const message = sanitizeNull(oneMessage);
    await db.sql<
      s.processed_root_messages.SQL,
      s.processed_root_messages.JSONSelectable[]
    >`INSERT INTO ${"processed_root_messages"} (${db.cols(message)})
    VALUES (${db.vals(message)}) ON CONFLICT ("id") DO UPDATE SET (${db.cols(message)}) = (${db.vals(
      message,
    )}) RETURNING *`.run(poolToUse);
  }
};

export const getPendingMessages = async (
  _pool?: Pool,
  limit = 100,
  orderDirection: "ASC" | "DESC" = "ASC",
): Promise<XMessage[]> => {
  // Get the messages in which `processed` is false
  const poolToUse = _pool ?? pool;
  const processed = false;

  const x = await db.sql<s.messages.SQL, s.messages.JSONSelectable[]>`SELECT * FROM ${"messages"} WHERE ${{
    processed,
  }} ORDER BY "index" ${raw(`${orderDirection}`)} NULLS LAST LIMIT ${db.param(limit)}`.run(poolToUse);
  return x.map(convertFromDbMessage);
};

export const saveCheckPoint = async (check: string, point: number, _pool?: Pool): Promise<void> => {
  const poolToUse = _pool ?? pool;
  const checkpoint = { check_name: check, check_point: point };

  await db.sql<s.checkpoints.SQL, s.checkpoints.JSONSelectable[]>`INSERT INTO ${"checkpoints"} (${db.cols(checkpoint)})
    VALUES (${db.vals(checkpoint)}) ON CONFLICT ("check_name") DO UPDATE SET (${db.cols(checkpoint)}) = (${db.vals(
    checkpoint,
  )}) RETURNING *`.run(poolToUse);
};

export const getCheckPoint = async (check_name: string, _pool?: Pool): Promise<number> => {
  const poolToUse = _pool ?? pool;
  const result = await db.sql<
    s.checkpoints.SQL,
    s.checkpoints.JSONSelectable[]
  >`SELECT * FROM ${"checkpoints"} WHERE ${{
    check_name,
  }}`.run(poolToUse);
  return BigNumber.from(result[0]?.check_point ?? 0).toNumber();
};

export const getTransferByTransferId = async (transfer_id: string, _pool?: Pool): Promise<XTransfer | undefined> => {
  const poolToUse = _pool ?? pool;
  const x = await db.sql<s.transfers.SQL, s.transfers.JSONSelectable[]>`SELECT * FROM ${"transfers"} WHERE ${{
    transfer_id,
  }}`.run(poolToUse);
  return x.length ? convertFromDbTransfer(x[0]) : undefined;
};

export const getTransfersByStatus = async (
  status: XTransferStatus,
  limit: number,
  offset = 0,
  orderDirection: "ASC" | "DESC" = "ASC",
  _pool?: Pool,
): Promise<XTransfer[]> => {
  const poolToUse = _pool ?? pool;
  const x = await db.sql<s.transfers.SQL, s.transfers.JSONSelectable[]>`SELECT * FROM ${"transfers"} WHERE ${{
    status,
  }} ORDER BY "xcall_timestamp" ${raw(`${orderDirection}`)} NULLS LAST LIMIT ${db.param(limit)} OFFSET ${db.param(
    offset,
  )}`.run(poolToUse);
  return x.map(convertFromDbTransfer);
};

export const getTransfersWithOriginPending = async (
  domain: string,
  limit: number,
  orderDirection: "ASC" | "DESC" = "ASC",
  _pool?: Pool,
): Promise<string[]> => {
  const poolToUse = _pool ?? pool;
  const transfers = await db.sql<s.transfers.SQL, s.transfers.JSONSelectable[]>`SELECT * FROM ${"transfers"} WHERE ${{
    origin_domain: domain,
  }} AND "xcall_timestamp" IS NULL ORDER BY "update_time" ${raw(`${orderDirection}`)} LIMIT ${db.param(limit)}`.run(
    poolToUse,
  );

  const transfer_ids = transfers.map((transfer) => transfer.transfer_id);
  return transfer_ids;
};

export const getTransfersWithDestinationPending = async (
  domain: string,
  limit: number,
  orderDirection: "ASC" | "DESC" = "ASC",
  _pool?: Pool,
): Promise<string[]> => {
  const poolToUse = _pool ?? pool;
  const transfers = await db.sql<s.transfers.SQL, s.transfers.JSONSelectable[]>`SELECT * FROM ${"transfers"} WHERE (${{
    destination_domain: domain,
  }} OR "destination_domain" IS NULL) AND ("xcall_timestamp" IS NOT NULL AND ("execute_timestamp" IS NULL OR "reconcile_timestamp" IS NULL)) ORDER BY "update_time" ${raw(
    `${orderDirection}`,
  )} LIMIT ${db.param(limit)}`.run(poolToUse);

  const transfer_ids = transfers.map((transfer) => transfer.transfer_id);
  return transfer_ids;
};

export const saveRouterBalances = async (routerBalances: RouterBalance[], _pool?: Pool): Promise<void> => {
  const poolToUse = _pool ?? pool;
  const routers: s.routers.Insertable[] = routerBalances.map((router) => {
    return { address: router.router };
  });

  // TODO: make this a single query! we should be able to do this with postgres
  for (const router of routers) {
    await db.sql<s.routers.SQL, s.routers.JSONSelectable>`
    INSERT INTO ${"routers"} (${db.cols(router)}) VALUES (${db.vals(
      router,
    )}) ON CONFLICT ("address") DO NOTHING RETURNING *
    `.run(poolToUse);

    const balances = (routerBalances.find((r) => r.router === router.address) ?? {}).assets ?? [];
    const dbBalances: { balance: s.asset_balances.Insertable; asset: s.assets.Insertable }[] = balances.map((b) => {
      return {
        balance: {
          asset_canonical_id: b.canonicalId,
          asset_domain: b.domain,
          router_address: router.address,
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          balance: b.balance as any,
        },
        asset: {
          local: b.local,
          adopted: b.adoptedAsset,
          canonical_id: b.canonicalId,
          canonical_domain: b.canonicalDomain,
          domain: b.domain,
        },
      };
    });

    for (const balance of dbBalances) {
      await db.sql<s.assets.SQL, s.assets.JSONSelectable>`
      INSERT INTO ${"assets"} (${db.cols(balance.asset)}) VALUES (${db.vals(
        balance.asset,
      )}) ON CONFLICT ("canonical_id", "domain") DO UPDATE SET (${db.cols(balance.asset)}) = (${db.vals(
        balance.asset,
      )}) RETURNING *
    `.run(poolToUse);

      await db.sql<s.asset_balances.SQL, s.asset_balances.JSONSelectable>`
      INSERT INTO ${"asset_balances"} (${db.cols(balance.balance)}) VALUES (${db.vals(
        balance.balance,
      )}) ON CONFLICT ("asset_canonical_id", "asset_domain", "router_address") DO UPDATE SET (${db.cols(
        balance.balance,
      )}) = (${db.vals(balance.balance)}) RETURNING *
    `.run(poolToUse);
    }
  }
};
