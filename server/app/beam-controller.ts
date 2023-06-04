import { redisStore } from "./db/redis";
import { sendExplorerNodeRequest } from "../app/shared/helpers/axios";
import { Blocks, Contract, Call, Status } from "./models";

const net = require("net");
let isContractsUpdateInProgress = false;

const BLOCKS_STEP_SYNC = 1000;
const HEIGHT_STEP = 43800;
const BLOCKS_PER_DAY = 1440;
const MONTHS_IN_YEAR = 12;
const FIRST_YEAR_VALUE = 20;
const REST_YEARS_VALUE = 10;
const BLOCKS_STEP = 100;

const improoveCalls = (calls: any, cid: string, contractId: any) => {
  calls.forEach((doc: any, i: number) => {
    if (Array.isArray(doc)) {
      calls[i] = {
        type: "single",
        value: [doc],
      };
    }

    calls[i]["_contract"] = contractId;
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

const updateBlocks = async (status: any) => {
  let fromHeight = 1;

  const heightLoadUntil = status.height;
  const lastLoadedInDbBlock = await Blocks.findOne().sort("-height");
  if (lastLoadedInDbBlock) {
    fromHeight = lastLoadedInDbBlock.height + 1;
  }

  while (fromHeight <= heightLoadUntil) {
    const start = Date.now();

    let blocks = await sendExplorerNodeRequest(
      `blocks?height=${fromHeight.toString()}&n=${BLOCKS_STEP_SYNC.toString()}`,
    );
    blocks = blocks.filter((item: any) => item.found);
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

    const contractInDb = await Contract.findOne({ cid });
    const lastLoadedCall = await Call.findOne({ cid }).sort("-height");
    const lastLoadedHeight = lastLoadedCall ? lastLoadedCall.height + 1 : 1;

    if (lastLoadedHeight < toHeight) {
      const contractData = await sendExplorerNodeRequest(
        `contract?hMax=${toHeight}&hMin=${lastLoadedHeight}&id=${cid}`,
      );
      const newCalls = contractData["Calls history"].value;
      newCalls.shift();

      if (newCalls.length > 0) {
        const improvedNewCalls = improoveCalls(newCalls, cid, contractInDb._id);
        await Call.insertMany(improvedNewCalls);
        console.log(`Contract calls inserted between ${lastLoadedHeight} - ${toHeight}. 
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
        height: contract[2],
        calls_count: contractInDb.calls_count + newCalls.length,
        state: contractData["State"],
      };

      //TODO
      if (!contractInDb) {
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
          await updateBlocks(status);
          await updateContracts(status);

          const formattedStatus = await getFormattedStatus(status);
          await redisStore.set("status", JSON.stringify(formattedStatus));
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
