const Mongoose = require("mongoose");
const axios = require("axios");

require("dotenv").config();

const CALLS_STEP_SYNC = 1000;

const getRequest = async (req) => {
  const options = {
    url: `http://${process.env.BEAM_NODE_URL}/${req}`,
    method: "GET",
  };

  const response = await axios(options);

  return response.data;
};

const lockedFundsSchema = new Mongoose.Schema(
  {
    aid: Number,
    value: Number,
  },
  {
    timestamps: false,
    versionKey: false,
    _id: false,
  },
);

const ownedAssetsSchema = new Mongoose.Schema(
  {
    aid: Number,
    metadata: String,
    value: Number,
  },
  {
    timestamps: false,
    versionKey: false,
    _id: false,
  },
);

// const versionsHistorySchema = new Mongoose.Schema(
//   {
//     version: String,
//     height: Number,
//   },
//   {
//     timestamps: false,
//     versionKey: false,
//     _id: false,
//   },
// );

const contractSchema = new Mongoose.Schema(
  {
    cid: {
      type: String,
      required: true,
      unique: true,
    },
    kind: {},
    height: {
      type: String,
    },
    locked_funds: [
      {
        type: lockedFundsSchema,
      },
    ],
    owned_assets: [
      {
        type: ownedAssetsSchema,
      },
    ],
    version_history: {
      //[
      // {
      //   type: versionsHistorySchema,
      // },
    }, //],
    state: {},
    calls_count: Number,
    last_call_height: Number,
    // calls: [
    //   {
    //     type: Mongoose.Schema.Types.ObjectId,
    //     ref: "Call",
    //   },
    // ],
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

contractSchema.index({ kind: "text", height: "text", cid: "text" });

const CallSchema = new Mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    value: [],
    cid: {
      type: String,
    },
    height: {
      type: Number,
    },
    _contract: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "Contract",
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

const Contracts = Mongoose.model("Contracts", contractSchema);
const Calls = Mongoose.model("Calls", CallSchema);

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connect = async () => {
  try {
    await Mongoose.connect(
      `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      mongooseOptions,
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Could not connect to MongoDB");
    throw error;
  }
};

console.log("contracts sync started!");

const calcLastHeight = (calls) => {
  const latestCall = calls[calls.length - 1];
  if (latestCall["type"] !== undefined) {
    return latestCall.value[0][0] - 1;
  } else {
    return latestCall[0] - 1;
  }
};

const improoveCalls = (calls, cid, contractId) => {
  calls.forEach((doc, i) => {
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

const formatLockedFunds = (lockedFunds) => {
  lockedFunds.shift();
  lockedFunds.forEach((fund, i) => {
    lockedFunds[i] = {
      aid: fund[0].value,
      value: fund[1].value,
    };
  });
  return lockedFunds;
};

const formatOwnedAssets = (ownedAssets) => {
  ownedAssets.shift();
  ownedAssets.forEach((asset, i) => {
    ownedAssets[i] = {
      aid: asset[0].value,
      metadata: asset[1],
      value: asset[2].value,
    };
  });
  return ownedAssets;
};

const formatVersionsHistory = (versionsHistory) => {
  versionsHistory.shift();
  versionsHistory.forEach((version, i) => {
    versionsHistory[i] = {
      height: version[0],
      version: version[1],
    };
  });
  return versionsHistory;
};

const syncContracts = async () => {
  await connect();
  const status = await getRequest("status");
  let contracts = await getRequest("contracts");
  contracts.shift();

  for (const contract of contracts) {
    const cid = contract[0].value;
    let fromHeight = status.height;
    let callsCount = 0;

    const contractData = await getRequest(`contract?hMax=${fromHeight}&nMaxTxs=1000&id=${contract[0].value}`);
    const initicalCalls = contractData["Calls history"].value;
    initicalCalls.shift();
    callsCount = initicalCalls.length;
    const lockedFunds = formatLockedFunds(contractData["Locked Funds"].value);
    const ownedAssets = formatOwnedAssets(contractData["Owned assets"].value);
    const versionHistory = formatVersionsHistory(contractData["Version History"].value);

    const newContract = await Contracts.create({ cid });

    if (initicalCalls.length > 0) {
      const improvedInitialCalls = improoveCalls(initicalCalls, cid, newContract._id);
      const initialCalls = await Calls.insertMany(improvedInitialCalls);
      console.log(`Contract calls added between 
        ${fromHeight} - ${improvedInitialCalls[improvedInitialCalls.length - 1].value[0][0]}. 
        Added ${improvedInitialCalls.length}`);
      fromHeight = calcLastHeight(improvedInitialCalls);
      // await Contracts.findOneAndUpdate({ cid }, { calls: initialCalls });

      while (fromHeight > 1) {
        const contractDataExt = await getRequest(`contract?hMax=${fromHeight}&nMaxTxs=1000&id=${cid}`);
        const extCalls = contractDataExt["Calls history"].value;
        extCalls.shift();
        callsCount += extCalls.length;

        if (extCalls.length > 0) {
          const improvedExtCalls = improoveCalls(extCalls, cid, newContract._id);
          const extCallsInserted = await Calls.insertMany(improvedExtCalls);
          console.log(`Contract calls updated between 
          ${fromHeight} - ${improvedExtCalls[improvedExtCalls.length - 1].value[0][0]}. 
            Added ${improvedExtCalls.length}`);
          fromHeight = calcLastHeight(improvedExtCalls);
          // await Contracts.findOneAndUpdate({ cid }, { calls: extCallsInserted });
        } else {
          console.log("Calls loading ended! CID: ", cid);
          break;
        }
      }

      const contractDataFormatted = {
        locked_funds: lockedFunds,
        owned_assets: ownedAssets,
        version_history: versionHistory,
        kind: contractData.kind,
        height: contract[2],
        calls_count: callsCount,
        state: contractData["State"],
        last_call_height: status.height,
      };
      await Contracts.findOneAndUpdate({ cid }, contractDataFormatted);
      // await Contracts.create(contractDataFormatted);
    } else {
      console.log("Calls loading ended! CID: ", cid);
    }
  }
};

syncContracts().then(() => {
  console.log("contracts sync ended!");
  process.exit();
});
