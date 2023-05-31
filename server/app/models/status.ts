const Mongoose = require("mongoose");

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

export const Status = Mongoose.model("Status", statusSchema);
