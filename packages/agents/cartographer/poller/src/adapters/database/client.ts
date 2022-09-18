import {
  XTransfer,
  XTransferStatus,
  RouterBalance,
  convertFromDbTransfer,
  XMessage,
  RootMessage,
  convertFromDbMessage,
  Asset,
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
  AssetBalances,
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

export const saveTransfers = async (client: PrismaClient, xtransfers: XTransfer[]): Promise<void> => {
  const transfers = xtransfers.map(convertToDbTransfer);
  await client.$transaction(
    transfers.map((t) => client.transfers.upsert({ create: t, update: t, where: { transfer_id: t.transfer_id } })),
  );
};

export const saveMessages = async (client: PrismaClient, xMessages: XMessage[]): Promise<void> => {
  // The `xMessages` are the ones retrieved only from the origin or destination domain
  const messages = xMessages.map(convertToDbMessage);

  await client.$transaction(
    messages.map((m) => client.messages.upsert({ create: m, update: m, where: { leaf: m.leaf } })),
  );
};

export const saveSentRootMessages = async (client: PrismaClient, _messages: RootMessage[]): Promise<void> => {
  const messages = _messages.map(convertToDbSentRootMessage);

  await client.$transaction(
    messages.map((m) => client.sentRootMessages.upsert({ create: m, update: m, where: { id: m.id } })),
  );
};

export const saveProcessedRootMessages = async (client: PrismaClient, _messages: RootMessage[]): Promise<void> => {
  const messages = _messages.map(convertToDbProcessedRootMessage);

  await client.$transaction(
    messages.map((m) => client.processedRootMessages.upsert({ create: m, update: m, where: { id: m.id } })),
  );
};

export const getPendingMessages = async (
  client: PrismaClient,
  limit = 100,
  orderDirection: "asc" | "desc" = "asc",
): Promise<XMessage[]> => {
  // Get the messages in which `processed` is false
  const x = await client.messages.findMany({
    where: { processed: false },
    orderBy: { index: orderDirection },
    take: limit,
  });
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

export const getCheckPoint = async (client: PrismaClient, check_name: string, _pool?: Pool): Promise<number> => {
  const result = await client.checkpoints.findUnique({ where: { check_name } });
  return result?.check_point ? result?.check_point.toNumber() : 0;
};

export const getTransferByTransferId = async (
  client: PrismaClient,
  transfer_id: string,
): Promise<XTransfer | undefined> => {
  const x = await client.transfers.findUnique({ where: { transfer_id } });
  return x ? convertFromDbTransfer(x) : undefined;
};

export const getTransfersByStatus = async (
  client: PrismaClient,
  status: XTransferStatus,
  limit: number,
  offset = 0,
  orderDirection: "asc" | "desc" = "asc",
): Promise<XTransfer[]> => {
  const x = await client.transfers.findMany({
    where: { status },
    orderBy: { xcall_timestamp: orderDirection },
    take: limit,
    skip: offset,
  });
  return x.map(convertFromDbTransfer);
};

export const getTransfersWithOriginPending = async (
  client: PrismaClient,
  domain: string,
  limit: number,
  orderDirection: "asc" | "desc" = "asc",
): Promise<string[]> => {
  const transfers = await client.transfers.findMany({
    where: { origin_domain: domain, xcall_timestamp: null },
    orderBy: { update_time: orderDirection },
    take: limit,
  });

  const transfer_ids = transfers.map((transfer) => transfer.transfer_id);
  return transfer_ids;
};

export const getTransfersWithDestinationPending = async (
  client: PrismaClient,
  domain: string,
  limit: number,
  orderDirection: "asc" | "desc" = "asc",
): Promise<string[]> => {
  const transfers = await client.transfers.findMany({
    where: {
      destination_domain: domain,
      xcall_timestamp: { not: null },
      execute_timestamp: null,
      reconcile_timestamp: null,
    },
    orderBy: { update_time: orderDirection },
    take: limit,
    skip: 0,
  });

  const transfer_ids = transfers.map((transfer) => transfer.transfer_id);
  return transfer_ids;
};

export const saveRouterBalances = async (client: PrismaClient, routerBalances: RouterBalance[]): Promise<void> => {
  const poolToUse = _pool ?? pool;
  const routers = routerBalances.map((router) => {
    const balances = (routerBalances.find((r) => r.router === router.router) ?? {}).assets ?? [];
    return {
      address: router.router,
      balances: balances.map((b) => {
        return {
          balance: {
            asset_canonical_id: b.canonicalId,
            asset_domain: b.domain,
            router_address: router.router,
            balance: b.balance,
          },
          asset: {
            local: b.local,
            adopted: b.adoptedAsset,
            canonical_id: b.canonicalId,
            canonical_domain: b.canonicalDomain,
            domain: b.domain,
          },
        };
      }),
    };
  });

  await client.$transaction(
    routers.map((r) =>
      client.routers.upsert({
        create: { address: r.address, asset_balances: r.balances.map((b) => b.balance) },
        update: r,
        where: { address: r.address },
      }),
    ),
  );

  // TODO: make this a single query! we should be able to do this with postgres
  for (const router of routers) {
    await db.sql<s.routers.SQL, s.routers.JSONSelectable>`
    INSERT INTO ${"routers"} (${db.cols(router)}) VALUES (${db.vals(
      router,
    )}) ON CONFLICT ("address") DO NOTHING RETURNING *
    `.run(poolToUse);

    const balances = (routerBalances.find((r) => r.router === router.address) ?? {}).assets ?? [];
    const dbBalances: { balance: AssetBalances; asset: Asset }[] = balances.map((b) => {
      return {
        balance: {
          asset_canonical_id: b.canonicalId,
          asset_domain: b.domain,
          router_address: router.address,
          balance: b.balance,
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
