const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reqStr = {
  type: String,
  required: true,
};

const reqNum = {
  type: Number,
  required: true,
};

const FixedAssetsSchema = new Schema({
  name: reqStr,
  amount: {
    type: Number,
    required: true,
  },
  branchId: { type: mongoose.Types.ObjectId, ref: "Branch" },
  branch_name: reqStr,
});

module.exports = mongoose.model("FixedAsset", FixedAssetsSchema);
