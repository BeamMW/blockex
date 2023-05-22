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

const kernelSchema = new Mongoose.Schema(
  {
    fee: {
      type: Number,
    },
    id: {
      type: String,
    },
    maxHeight: {
      type: Number,
    },
    minHeight: {
      type: Number,
    },
  },
  {
    timestamps: false,
    versionKey: false,
    _id: false,
  },
);

const outputSchema = new Mongoose.Schema(
  {
    Maturity: {
      type: Number,
    },
    Value: {
      type: Number,
    },
    commitment: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  {
    timestamps: false,
    versionKey: false,
    _id: false,
  },
);

const inputSchema = new Mongoose.Schema(
  {
    commitment: {
      type: String,
    },
    height: {
      type: Number,
    },
  },
  {
    timestamps: false,
    versionKey: false,
    _id: false,
  },
);

const blockSchema = new Mongoose.Schema(
  {
    hash: {
      type: String,
      required: true,
    },
    height: {
      unique: true,
      type: Number,
      required: true,
    },
    chainwork: {
      type: String,
      requred: true,
    },
    found: {
      type: Boolean,
      required: true,
    },
    prev: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
    },
    subsidy: {
      type: Number,
      required: true,
    },
    rate_btc: {
      type: String,
      required: true,
    },
    rate_usd: {
      type: String,
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
    },
    kernels: {
      type: [kernelSchema],
    },
    inputs: {
      type: [inputSchema],
    },
    outputs: {
      type: [outputSchema],
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

const Block = Mongoose.model("Block", blockSchema);

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

Mongoose.connect("mongodb://localhost:27017/explorer", mongooseOptions);

console.log("Blocks sync started!");

const syncBlocks = async () => {
  let fromHeight = 1;
  const status = await getRequest("status");
  console.log(status);

  const heightLoadUntil = status.height;
  const lastLoadedInDbBlock = await Block.findOne().sort("-height");
  if (lastLoadedInDbBlock) {
    fromHeight = lastLoadedInDbBlock.height + 1;
  }

  while (fromHeight < heightLoadUntil) {
    const start = Date.now();

    let blocks = await getRequest("blocks?height=" + fromHeight.toString() + "&n=" + BLOCKS_STEP_SYNC.toString());
    blocks = blocks.filter((item) => item.found);
    await Block.insertMany(blocks);

    const end = Date.now();
    console.log(`Last loaded height: ${fromHeight + BLOCKS_STEP_SYNC - 1} --- in ${end - start} ms`);

    fromHeight += BLOCKS_STEP_SYNC;
  }

  if (fromHeight === heightLoadUntil) {
    console.log("Blocks sync ended!");
  }
};

syncBlocks().then(() => {
  process.exit();
});
