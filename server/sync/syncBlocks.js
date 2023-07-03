const Mongoose = require("mongoose");
const axios = require("axios");

require("dotenv").config();

const BLOCKS_STEP_SYNC = 1000;

const getRequest = async (req) => {
  const options = {
    url: `http://${process.env.BEAM_NODE_URL}/${req}`,
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
    height_index: {
      type: String,
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
      type: Date,
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

blockSchema.index({ hash: "text", height_index: "text", "kernels.id": "text" });

const statusSchema = new Mongoose.Schema(
  {
    subsidy: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: Number,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

const Blocks = Mongoose.model("Blocks", blockSchema);
const Status = Mongoose.model("Status", statusSchema);

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

const syncBlocks = async () => {
  console.log("Blocks sync started!");
  await connect();
  let fromHeight = 1;
  const status = await getRequest("status");
  console.log(status);

  const heightLoadUntil = status.height;
  const lastLoadedInDbBlock = await Blocks.findOne().sort("-height");
  if (lastLoadedInDbBlock) {
    fromHeight = lastLoadedInDbBlock.height + 1;
  }

  let subsidySum = 0;
  while (fromHeight < heightLoadUntil) {
    const start = Date.now();

    let blocks = await getRequest("blocks?height=" + fromHeight.toString() + "&n=" + BLOCKS_STEP_SYNC.toString());
    for (let block of blocks) {
      block.timestamp = block.timestamp * 1000;
      block.height_index = block.height;
    }

    blocks = blocks.filter((item) => item.found);
    await Blocks.insertMany(blocks);

    const end = Date.now();
    console.log(`Last loaded height: ${fromHeight + BLOCKS_STEP_SYNC - 1} --- in ${end - start} ms`);

    fromHeight += BLOCKS_STEP_SYNC;

    subsidySum += blocks.reduce((acc, block) => acc + block.subsidy, 0);
  }

  await Status.create({ subsidy: subsidySum });

  if (fromHeight === heightLoadUntil) {
    console.log("Blocks sync ended!");
  }
};

syncBlocks().then(() => {
  process.exit();
});
