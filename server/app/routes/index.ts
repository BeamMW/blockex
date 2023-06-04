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
} from "../controllers";

const router = new Router({ prefix: "/api/v1" });

router.get("/swagger.json", swagger).get("/alive", (ctx) => getAliveHandler(ctx));
router.get("/status", (ctx) => getStatus(ctx));
router.get("/contracts", (ctx) => getContracts(ctx));
router.get("/contract", (ctx) => getContract(ctx));
router.get("/blocks", (ctx) => getBlocks(ctx));
router.get("/assets", (ctx) => getAssets(ctx));
// router.post("/", (ctx) => metaMaskRoutingHandler(ctx));

export default router;
