import { Queue, Worker, Job, QueueEvents } from "bullmq";

import { redisStore } from "../db/redis";
import { sendExplorerNodeRequest } from "../shared/helpers/axios";
import { Blocks, Contract, Call, Status, Assets } from "../models";
import config from "../config";

const net = require("net");

const BLOCKS_STEP_SYNC = 1000;
const HEIGHT_STEP = 43800;
const BLOCKS_PER_DAY = 1440;
const MONTHS_IN_YEAR = 12;
const FIRST_YEAR_VALUE = 20;
const REST_YEARS_VALUE = 10;
const BLOCKS_STEP = 100;
//redis-service
const contractsQueue = new Queue("Contracts", {
  connection: {
    host: config.redis_url,
    port: config.redis_port,
  },
});

const mainQueue = new Queue("Main", {
  connection: {
    host: config.redis_url,
    port: config.redis_port,
  },
});

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

const formatLockedFunds = (lockedFunds: any) => {
  lockedFunds.shift();
  lockedFunds.forEach((fund: any, i: number) => {
    lockedFunds[i] = {
      aid: fund[0].value,
      value: fund[1].value,
    };
  });
  return lockedFunds;
};

const formatOwnedAssets = (ownedAssets: any) => {
  ownedAssets.shift();
  ownedAssets.forEach((asset: any, i: number) => {
    ownedAssets[i] = {
      aid: asset[0].value,
      metadata: asset[1],
      value: asset[2].value,
    };
  });
  return ownedAssets;
};

const formatVersionsHistory = (versionsHistory: any) => {
  versionsHistory.shift();
  versionsHistory.forEach((version: any, i: number) => {
    versionsHistory[i] = {
      height: version[0],
      version: version[1],
    };
  });
  return versionsHistory;
};

const getFormattedStatus = async (status: any) => {
  const totalCoinsEmission = HEIGHT_STEP * 60 * 100;
  const currentHeight = status.height;
  const currentHeightStep = Math.floor(currentHeight / HEIGHT_STEP);
  const nextTreasuryEmissionHeight = (currentHeightStep + 1) * HEIGHT_STEP;
  const coinsInCirculationTreasury =
    currentHeightStep >= MONTHS_IN_YEAR
      ? MONTHS_IN_YEAR * FIRST_YEAR_VALUE * HEIGHT_STEP +
        (currentHeightStep - MONTHS_IN_YEAR) * REST_YEARS_VALUE * HEIGHT_STEP
      : currentHeightStep * FIRST_YEAR_VALUE * HEIGHT_STEP;
  const nextTreasuryCoinsAmount =
    currentHeightStep >= MONTHS_IN_YEAR ? REST_YEARS_VALUE * HEIGHT_STEP : FIRST_YEAR_VALUE * HEIGHT_STEP;

  const storedStatus = await Status.find({});
  const coinsInCirculationMined = storedStatus[0].subsidy * Math.pow(10, -8);

  return {
    height: status.height,
    timestamp: status.timestamp,
    total_coins_emission: totalCoinsEmission,
    next_treasury_emission_height: nextTreasuryEmissionHeight,
    coins_in_circulation_treasury: coinsInCirculationTreasury,
    coins_in_circulation_mined: coinsInCirculationMined,
    next_treasury_coins_amount: nextTreasuryCoinsAmount,
    difficulty: storedStatus[0].difficulty,
  };
};

const blocksUpdate = (status: any) => {
  return new Promise(async (resolve, reject) => {
    let fromHeight = 1;
    console.log("Blocks sync started!");
    const start = Date.now();

    const heightLoadUntil = status.height;
    const lastLoadedInDbBlock = await Blocks.findOne().sort("-height");
    if (lastLoadedInDbBlock) {
      fromHeight = lastLoadedInDbBlock.height + 1;
    }

    while (fromHeight <= heightLoadUntil) {
      let blocks = await sendExplorerNodeRequest(
        `/blocks?height=${fromHeight.toString()}&n=${BLOCKS_STEP_SYNC.toString()}`,
      );
      blocks = blocks.filter((item: any) => item.found);
      for (let block of blocks) {
        block.timestamp = block.timestamp * 1000;
        block.height_index = block.height;
      }
      await Blocks.insertMany(blocks);

      const storedStatus = await Status.find({});
      const newSubsidy = blocks.reduce((acc: number, block: any) => acc + block.subsidy, storedStatus[0].subsidy);
      await Status.updateOne(
        { _id: storedStatus[0]._id },
        {
          $set: {
            subsidy: newSubsidy,
            difficulty: blocks[0].difficulty,
          },
        },
      );

      console.log(`Last loaded height: ${fromHeight + BLOCKS_STEP_SYNC - 1}`);

      fromHeight += BLOCKS_STEP_SYNC;
    }

    const end = Date.now();
    console.log(`Blocks sync ended!  --- in ${end - start} ms`);
    resolve(true);
  });
};

const worker = new Worker(
  "Contracts",
  async (job: Job) => {
    return new Promise(async (resolve, reject) => {
      const start = Date.now();
      const toHeight = job.data.status.height;
      const cid = job.data.contract[0].value;
      const contract = await Contract.findOne({ cid });
      const lastCheckedHeight = contract ? (contract.last_call_height ? contract.last_call_height : toHeight - 1) : 1;

      const contractData = await sendExplorerNodeRequest(
        `/contract?hMax=${toHeight}&hMin=${lastCheckedHeight}&id=${cid}`,
      );
      const newCalls = contractData["Calls history"].value;
      newCalls.shift();

      const improvedNewCalls = improoveCalls(newCalls, cid);
      if (improvedNewCalls.length > 0) {
        await Call.insertMany(improvedNewCalls);
        console.log(`Contract calls inserted between ${lastCheckedHeight} - ${toHeight}. 
          Added ${improvedNewCalls.length}. CID: ${cid}`);
      }

      const lockedFunds = formatLockedFunds(contractData["Locked Funds"].value);
      const ownedAssets = formatOwnedAssets(contractData["Owned assets"].value);
      const versionHistory = formatVersionsHistory(contractData["Version History"].value);
      const contractDataFormatted = {
        cid,
        locked_funds: lockedFunds,
        owned_assets: ownedAssets,
        version_history: versionHistory,
        kind: contractData.kind,
        height: job.data.contract[2],
        state: contractData["State"],
        last_call_height: toHeight,
      };

      await Contract.findOneAndUpdate({ cid }, contractDataFormatted, {
        $inc: {
          calls_count: newCalls.length,
        },
        upsert: true,
        new: true,
      });

      resolve(true);
      const end = Date.now();
      console.log(`Contracts update process ended! --- in ${end - start} ms. CID: ${cid}`);
    });
  },
  {
    concurrency: 5,
    connection: {
      host: config.redis_url,
      port: config.redis_port,
    },
  },
);

const mainWorker = new Worker(
  "Main",
  async (job: Job) => {
    await assetsUpdate(job.data.status);
    await blocksUpdate(job.data.status);
    return true;
  },
  {
    connection: {
      host: config.redis_url,
      port: config.redis_port,
    },
  },
);

const contractsUpdate = async (status: any) => {
  console.log("Contracts update started!");
  let contracts = await sendExplorerNodeRequest("/contracts");
  contracts.shift();
  contracts = contracts.map((item: any) => {
    return {
      name: "Contract",
      data: { contract: item, status },
    };
  });

  contractsQueue.addBulk(contracts);
  //TODO: bot notification with new contract data
};

const assetsUpdate = async (status: any) => {
  return new Promise(async (resolve, reject) => {
    console.log("Assets update started");
    const start = Date.now();
    let lastBlock = await sendExplorerNodeRequest("/blocks?height=" + status.height + "&n=1");
    for (const asset of lastBlock[0].assets) {
      const assetHistory = await sendExplorerNodeRequest("/asset?id=" + asset.aid);
      await Assets.findOneAndUpdate(
        { aid: asset.aid },
        {
          cid: asset.cid ? asset.cid.value : null,
          lock_height: asset.lock_height,
          metadata: asset.metadata.text,
          owner: asset.owner ? asset.owner : null,
          value: asset.value,
          asset_history: assetHistory["Asset history"],
        },
        {
          upsert: true,
          new: true,
        },
      );
    }
    const end = Date.now();
    console.log(`Assets update process ended! --- in ${end - start} ms`);

    resolve(true);
  });
};

export const BeamController = async (wsServer: any) => {
  const client = new net.Socket();

  client.connect(config.beam_api_port, config.beam_api_url, () => {
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
          console.log(`New block at - ${res["result"]["current_height"]}!`);

          const status = await sendExplorerNodeRequest("/status"); //TODO: add routes to consts

          console.log(`Main queue status: active - ${(await mainQueue.getJobs(["active"])).length}, 
          waiting - ${(await mainQueue.getJobs(["waiting"])).length}, 
          delayed - ${(await mainQueue.getJobs(["delayed"])).length}`);

          console.log(`Contracts queue status: active - ${(await contractsQueue.getJobs(["active"])).length}, 
          waiting - ${(await contractsQueue.getJobs(["waiting"])).length}, 
          delayed - ${(await contractsQueue.getJobs(["delayed"])).length}`);

          mainQueue.add("Main", { status });
          contractsUpdate(status);

          const formattedStatus = await getFormattedStatus(status);
          await redisStore.set("status", JSON.stringify(formattedStatus));

          mainWorker.on("completed", (job: Job) => {
            mainWorker.removeAllListeners();
            if (wsServer.clients) {
              wsServer.clients.forEach((client: any) => {
                client.send(JSON.stringify({ status: formattedStatus }));
              });
            }
          });
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
