const Mongoose = require("mongoose");
const axios = require("axios");

const CALLS_STEP_SYNC = 1000;

const getRequest = async (req) => {
  const options = {
    url: "http://127.0.0.1:8899/" + req,
    method: "GET",
  };

  const response = await axios(options);

  return response.data;
};

const contractSchema = new Mongoose.Schema(
  {
    cid: {
      type: String,
      required: true,
      unique: true,
    },
    kind: {},
    height: {
      type: Number,
      required: true,
    },
    locked_funds: [],
    owned_assets: [],
    version_history: [],
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

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

Mongoose.connect("mongodb://localhost:27017/explorer", mongooseOptions);

console.log("contracts sync started!");

const calcLastHeight = (calls) => {
  const latestCall = calls[calls.length - 1];
  if (latestCall["type"] !== undefined) {
    return latestCall.value[0][0] - 1;
  } else {
    return latestCall[0] - 1;
  }
};

const improoveCalls = (calls, cid) => {
  calls.forEach((doc, i) => {
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

const syncContracts = async () => {
  const status = await getRequest("status");
  let contracts = await getRequest("contracts");
  contracts.shift();

  for (const contract of contracts) {
    let fromHeight = status.height;
    const contractData = await getRequest(`contract?hMax=${fromHeight}&nMaxTxs=1000&id=${contract[0].value}`);
    const initicalCalls = contractData["Calls history"].value;
    const cid = contract[0].value;
    initicalCalls.shift();
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

    await Contracts.create(contractDataFormatted);

    if (initicalCalls.length > 0) {
      const improvedInitialCalls = improoveCalls(initicalCalls, cid);
      await Calls.insertMany(improvedInitialCalls);
      console.log(`Contract added updated between 
        ${fromHeight} - ${improvedInitialCalls[improvedInitialCalls.length - 1].value[0][0]}. 
        Added ${improvedInitialCalls.length}`);
      fromHeight = calcLastHeight(improvedInitialCalls);

      while (fromHeight > 1) {
        const contractDataExt = await getRequest(`contract?hMax=${fromHeight}&nMaxTxs=1000&id=${cid}`);
        const extCalls = contractDataExt["Calls history"].value;
        extCalls.shift();
        if (extCalls.length > 0) {
          const improvedExtCalls = improoveCalls(extCalls, cid);
          await Calls.insertMany(improvedExtCalls);
          console.log(`Contract calls updated between 
          ${fromHeight} - ${improvedExtCalls[improvedExtCalls.length - 1].value[0][0]}. 
            Added ${improvedExtCalls.length}`);
          fromHeight = calcLastHeight(improvedExtCalls);
        } else {
          console.log("Calls loading ended! CID: ", cid);
          break;
        }
      }
    } else {
      console.log("Calls loading ended! CID: ", cid);
    }
  }
};

syncContracts().then(() => {
  console.log("contracts sync ended!");
  process.exit();
});
