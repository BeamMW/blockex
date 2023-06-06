const Mongoose = require("mongoose");

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
      type: Number,
      required: true,
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
    version_history: {}, //[
    // {
    //   type: versionsHistorySchema,
    // },
    //],
    calls_count: Number,
    state: {},
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
