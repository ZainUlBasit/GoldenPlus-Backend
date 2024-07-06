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

const StockSchema = new Schema({
  sizeId: { type: mongoose.Types.ObjectId, ref: "Item" },
  size: reqStr,
  branchId: { type: mongoose.Types.ObjectId, ref: "Branch" },
  branch_name: reqStr,
  branch: reqNum,
  articleId: { type: mongoose.Types.ObjectId, ref: "Article" },
  article_name: reqStr,
  purchase: reqNum,
  qty: reqNum,
  total_amount: reqNum,
  invoice_no: reqStr,
  truck_no: reqStr,
  date: {
    type: Number,
    default: Math.floor(Date.now() / 1000),
  },
  desc: reqStr,
});

module.exports = mongoose.model("stock", StockSchema);
