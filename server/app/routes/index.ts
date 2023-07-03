import * as Router from "koa-router";

import { swagger } from "./swagger";
import {
  getAliveHandler,
  getAssets,
  getDappsList,
  getStatus,
  getContracts,
  getBlocks,
  getContract,
  getAllAssets,
  getBase,
  getBlock,
  contractSearch,
  blockSearch,
  assetSearch,
} from "../controllers";

const router = new Router({ prefix: "/api/v1" });

router.get("/swagger.json", swagger).get("/alive", (ctx) => getAliveHandler(ctx));
router.get("/status", (ctx) => getStatus(ctx));
router.get("/contracts", (ctx) => getContracts(ctx));
router.get("/contract", (ctx) => getContract(ctx));
router.get("/blocks", (ctx) => getBlocks(ctx));
router.get("/block", (ctx) => getBlock(ctx));
router.get("/assets", (ctx) => getAssets(ctx));
router.get("/contract_search", (ctx) => contractSearch(ctx));
router.get("/block_search", (ctx) => blockSearch(ctx));
router.get("/asset_search", (ctx) => assetSearch(ctx));
router.get("/all_assets", (ctx) => getAllAssets(ctx));
router.get("/ws", (ctx) => getBase(ctx));
// router.post("/", (ctx) => metaMaskRoutingHandler(ctx));

export default router;
