const Mongoose = require("mongoose");

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

const callSchema = new Mongoose.Schema(
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

export const Contract = Mongoose.model("Contract", contractSchema);
export const Call = Mongoose.model("Call", callSchema);
