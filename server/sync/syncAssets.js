const Mongoose = require("mongoose");
const axios = require("axios");

const BLOCKS_STEP_SYNC = 1000;

const getRequest = async (req) => {
  const options = {
    url: "http://127.0.0.1:8899/" + req,
    method: "GET",
  };

  const response = await axios(options);

  return response.data;
};

const assetSchema = new Mongoose.Schema(
  {
    aid: {
      type: Number,
      unique: true,
      required: true,
    },
    cid: {
      type: String,
    },
    lock_height: {
      type: Number,
    },
    metadata: {
      type: String,
    },
    owner: {
      type: String,
    },
    value: {
      type: Number,
    },
    asset_history: {},
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

const Assets = Mongoose.model("Assets", assetSchema);

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connect = async () => {
  try {
    await Mongoose.connect("mongodb://localhost:27017/explorer", mongooseOptions);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Could not connect to MongoDB");
    throw error;
  }
};

const formatAssets = async (assets) => {
  return await Promise.all(
    assets.map(async (asset) => {
      const assetHistory = await getRequest("asset?id=" + asset.aid + "&n=1");
      return {
        aid: asset.aid,
        cid: asset.cid ? asset.cid.value : null,
        lock_height: asset.lock_height,
        metadata: asset.metadata.text,
        owner: asset.owner ? asset.owner : null,
        value: asset.value,
        asset_history: assetHistory["Asset history"],
      };
    }),
  );
};

const syncAssets = async () => {
  await connect();
  console.log("Assets sync started!");
  const status = await getRequest("status");
  console.log(status);

  let lastBlock = await getRequest("blocks?height=" + status.height + "&n=1");
  const formattedAssets = await formatAssets(lastBlock[0].assets);
  await Assets.insertMany(formattedAssets);
};

syncAssets().then(() => {
  console.log("Assets sync ended!");
  process.exit();
});
