const Mongoose = require("mongoose");

const assetSchema = new Mongoose.Schema(
  {
    aid: {
      type: Number,
      unique: true,
      required: true,
    },
    aid_index: {
      type: String,
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

assetSchema.index({ aid: "text", cid: "text", owner: "text" });

export const Assets = Mongoose.model("Assets", assetSchema);
