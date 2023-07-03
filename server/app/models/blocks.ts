const Mongoose = require("mongoose");

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
  },
);

export const Blocks = Mongoose.model("Blocks", blockSchema);
