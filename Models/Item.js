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

const reqDate = {
  type: Date,
  required: true,
};

const itemSchema = new Schema({
  size: reqStr,
  branchId: { type: mongoose.Types.ObjectId, ref: "Branch" },
  articleId: { type: mongoose.Types.ObjectId, ref: "Article" },
  article_name: String,
  branch_name: String,
  purchase: reqNum,
  sale: reqNum,
  in_qty: { type: Number, default: 0 },
  out_qty: { type: Number, default: 0 },
  qty: { type: Number, default: 0 }, // remaining qty
  branch: reqNum,
  addeddate: { type: Number, default: Math.floor(Date.now() / 1000) },
});

module.exports = mongoose.model("Item", itemSchema);
