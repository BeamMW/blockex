import { redisStore } from "./db/redis";
import { sendExplorerNodeRequest } from "../app/shared/helpers/axios";
import { Block } from "./models/blocks";
import { Contract, Call } from "./models/contracts";

const net = require("net");
let isContractsUpdateInProgress = false;

//TODO: in calls make ref to contract

const BLOCKS_STEP_SYNC = 1000;

const improoveCalls = (calls: any, cid: string) => {
  calls.forEach((doc: any, i: number) => {
    if (Array.isArray(doc)) {
      calls[i] = {
        type: "single",
        value: [doc],
      };
    }

    calls[i]["height"] = calls[i].value[0][0];
    calls[i]["cid"] = cid;
  });

  return calls;
};

const updateBlocks = async (status: any) => {
  let fromHeight = 1;

  const heightLoadUntil = status.height;
  const lastLoadedInDbBlock = await Block.findOne().sort("-height");
  if (lastLoadedInDbBlock) {
    fromHeight = lastLoadedInDbBlock.height + 1;
  }

  while (fromHeight <= heightLoadUntil) {
    const start = Date.now();

    let blocks = await sendExplorerNodeRequest(
      `blocks?height=${fromHeight.toString()}&n=${BLOCKS_STEP_SYNC.toString()}`,
    );
    blocks = blocks.filter((item: any) => item.found);
    await Block.insertMany(blocks);

    const end = Date.now();
    console.log(`Last loaded height: ${fromHeight + BLOCKS_STEP_SYNC - 1} --- in ${end - start} ms`);

    fromHeight += BLOCKS_STEP_SYNC;
  }

  if (fromHeight === heightLoadUntil) {
    console.log("Blocks sync ended!");
  }
};

const updateContracts = async (status: any) => {
  console.log("Contracts update started!");
  let contracts = await sendExplorerNodeRequest("contracts");
  contracts.shift();

  for (const contract of contracts) {
    const toHeight = status.height;
    const cid = contract[0].value;

    const lastLoadedCall = await Call.findOne({ cid }).sort("-height");
    const lastLoadedHeight = lastLoadedCall ? lastLoadedCall.height + 1 : 1;

    if (lastLoadedHeight < toHeight) {
      const contractData = await sendExplorerNodeRequest(
        `contract?hMax=${toHeight}&hMin=${lastLoadedHeight}&id=${cid}`,
      );
      const newCalls = contractData["Calls history"].value;
      newCalls.shift();

      if (newCalls.length > 0) {
        const improvedNewCalls = improoveCalls(newCalls, cid);
        await Call.insertMany(improvedNewCalls);
        console.log(`Contract calls inserted between ${lastLoadedHeight} - ${toHeight}. 
          Added ${improvedNewCalls.length}. CID: ${cid}`);
      }

      const lockedFunds = contractData["Locked Funds"].value;
      lockedFunds.shift();
      const ownedAssets = contractData["Owned assets"].value;
      ownedAssets.shift();
      const versionHistory = contractData["Version History"].value;
      versionHistory.shift();

      const contractDataFormatted = {
        cid,
        locked_funds: lockedFunds,
        owned_assets: ownedAssets,
        version_history: versionHistory,
        kind: contractData.kind,
        height: contract[2],
      };

      //TODO
      if (!lastLoadedCall) {
        await Contract.create(contractDataFormatted);
      } else {
        await Contract.findOneAndUpdate({ cid }, contractDataFormatted);
      }
    }
    //TODO: bot notification with new contract data
  }
  console.log("Contracts update process ended!");
};

export const BeamController = async () => {
  const client = new net.Socket();

  client.connect(10005, "127.0.0.1", () => {
    const message =
      JSON.stringify({
        jsonrpc: "2.0",
        id: 123,
        method: "ev_subunsub",
        params: {
          ev_system_state: true,
        },
      }) + "\n";
    client.write(message);
  });

  var acc = "";

  client.on("data", async (data: any) => {
    acc += data;

    if (data.indexOf("\n") != -1) {
      const count = (acc.match(/\n/g) || []).length;
      let result;
      if (count > 1) {
        result = acc.split("\n")[1];
      } else {
        result = acc;
      }
      //TODO: implement node is down notification
      try {
        var res = JSON.parse(result);
        if (res["id"] === "ev_system_state") {
          // state updated
          console.log(res["result"]["current_height"]);

          const status = await sendExplorerNodeRequest("status"); //TODO: add routes to consts
          await redisStore.set("status", JSON.stringify(status));
          await updateBlocks(status);
          await updateContracts(status);
        }
      } catch (e) {
        console.log(e);
      }

      acc = "";
    }
  });

  client.on("close", () => {
    console.log("Connection closed");
  });
};
