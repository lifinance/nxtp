-- CreateEnum
CREATE TYPE "transfer_status" AS ENUM ('XCalled', 'Executed', 'Reconciled', 'CompletedSlow', 'CompletedFast');

-- CreateTable
CREATE TABLE "asset_balances" (
    "asset_canonical_id" CHAR(66) NOT NULL,
    "asset_domain" VARCHAR(255) NOT NULL,
    "router_address" CHAR(42) NOT NULL,
    "balance" DECIMAL NOT NULL DEFAULT 0,

    CONSTRAINT "asset_balances_pkey" PRIMARY KEY ("asset_canonical_id","asset_domain","router_address")
);

-- CreateTable
CREATE TABLE "assets" (
    "local" CHAR(42) NOT NULL,
    "adopted" CHAR(42) NOT NULL,
    "canonical_id" CHAR(66) NOT NULL,
    "canonical_domain" VARCHAR(255) NOT NULL,
    "domain" VARCHAR(255) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("canonical_id","domain")
);

-- CreateTable
CREATE TABLE "checkpoints" (
    "check_name" VARCHAR(255) NOT NULL,
    "check_point" DECIMAL NOT NULL DEFAULT 0,

    CONSTRAINT "checkpoints_pkey" PRIMARY KEY ("check_name")
);

-- CreateTable
CREATE TABLE "messages" (
    "leaf" CHAR(66) NOT NULL,
    "origin_domain" VARCHAR(255) NOT NULL,
    "destination_domain" VARCHAR(255),
    "index" DECIMAL,
    "root" CHAR(66),
    "message" VARCHAR,
    "processed" BOOLEAN DEFAULT false,
    "return_data" VARCHAR(255),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("leaf")
);

-- CreateTable
CREATE TABLE "processed_root_messages" (
    "id" CHAR(66) NOT NULL,
    "spoke_domain" VARCHAR(255),
    "hub_domain" VARCHAR(255),
    "root" CHAR(66),
    "caller" CHAR(42),
    "transaction_hash" CHAR(66),
    "processed_timestamp" INTEGER,
    "gas_price" BIGINT,
    "gas_limit" BIGINT,
    "block_number" INTEGER,

    CONSTRAINT "processed_root_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routers" (
    "address" CHAR(42) NOT NULL,

    CONSTRAINT "routers_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "sent_root_messages" (
    "id" CHAR(66) NOT NULL,
    "spoke_domain" VARCHAR(255),
    "hub_domain" VARCHAR(255),
    "root" CHAR(66),
    "caller" CHAR(42),
    "transaction_hash" CHAR(66),
    "sent_timestamp" INTEGER,
    "gas_price" BIGINT,
    "gas_limit" BIGINT,
    "block_number" INTEGER,

    CONSTRAINT "sent_root_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "transfer_id" CHAR(66) NOT NULL,
    "nonce" BIGINT,
    "to" CHAR(42),
    "call_data" TEXT,
    "origin_domain" VARCHAR(255) NOT NULL,
    "destination_domain" VARCHAR(255),
    "recovery" CHAR(42),
    "force_slow" BOOLEAN,
    "receive_local" BOOLEAN,
    "callback" CHAR(42),
    "callback_fee" BIGINT,
    "relayer_fee" BIGINT,
    "origin_chain" VARCHAR(255),
    "origin_transacting_asset" CHAR(42),
    "origin_transacting_amount" BIGINT,
    "origin_bridged_asset" CHAR(42),
    "origin_bridged_amount" BIGINT,
    "xcall_caller" CHAR(42),
    "xcall_transaction_hash" CHAR(66),
    "xcall_timestamp" INTEGER,
    "xcall_gas_price" BIGINT,
    "xcall_gas_limit" BIGINT,
    "xcall_block_number" INTEGER,
    "destination_chain" VARCHAR(255),
    "status" "transfer_status" NOT NULL DEFAULT 'XCalled',
    "routers" CHAR(42)[],
    "destination_transacting_asset" CHAR(42),
    "destination_transacting_amount" BIGINT,
    "destination_local_asset" CHAR(42),
    "destination_local_amount" BIGINT,
    "execute_caller" CHAR(42),
    "execute_transaction_hash" CHAR(66),
    "execute_timestamp" INTEGER,
    "execute_gas_price" BIGINT,
    "execute_gas_limit" BIGINT,
    "execute_block_number" INTEGER,
    "execute_origin_sender" CHAR(42),
    "reconcile_caller" CHAR(42),
    "reconcile_transaction_hash" CHAR(66),
    "reconcile_timestamp" INTEGER,
    "reconcile_gas_price" BIGINT,
    "reconcile_gas_limit" BIGINT,
    "reconcile_block_number" INTEGER,
    "update_time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agent" CHAR(42),
    "destination_min_out" BIGINT,
    "transfer_status_update_by_agent" CHAR(42),
    "transfer_status_message_by_agent" CHAR(42),

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("transfer_id")
);

-- AddForeignKey
ALTER TABLE "asset_balances" ADD CONSTRAINT "fk_asset" FOREIGN KEY ("asset_canonical_id", "asset_domain") REFERENCES "assets"("canonical_id", "domain") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "asset_balances" ADD CONSTRAINT "fk_router" FOREIGN KEY ("router_address") REFERENCES "routers"("address") ON DELETE NO ACTION ON UPDATE NO ACTION;
