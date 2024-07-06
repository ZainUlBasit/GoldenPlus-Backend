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

const ProductSchema = new Schema({
  itemId: { type: mongoose.Types.ObjectId, ref: "Item" },
  article_name: reqStr,
  article_size: reqNum,
  qty: reqNum,
  price: reqNum,
  purchase: reqNum,
  amount: reqNum,
});

module.exports = mongoose.model("product", ProductSchema);
