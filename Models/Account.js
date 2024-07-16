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

const AccountSchema = new Schema({
  account_name: reqStr,
  account_no: reqNum,
  amount: {
    type: Number,
    default: 0,
  },
  branchId: { type: mongoose.Types.ObjectId, ref: "Branch" },
  branch_name: reqStr,
});

module.exports = mongoose.model("Account", AccountSchema);
