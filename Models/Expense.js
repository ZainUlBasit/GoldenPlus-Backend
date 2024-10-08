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

const ExpenseSchema = new Schema({
  date: { type: Number, default: Math.floor(Date.now() / 1000) },
  desc: reqStr,
  expense: reqNum,
  branch: reqNum,
  accountId: { type: mongoose.Types.ObjectId, ref: "Account" },
  account_name: reqStr,
});

module.exports = mongoose.model("Expense", ExpenseSchema);
