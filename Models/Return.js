const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReturnSchema = new Schema({
  customerId: { type: mongoose.Types.ObjectId, ref: "Customer" },
  date: { type: Number, default: Math.floor(Date.now() / 1000) },
  invoice_no: { type: Number, required: true }, // No need to mark it as required
  items: [{ type: mongoose.Types.ObjectId, ref: "product" }],
  total_amount: { type: Number, required: true },
});

module.exports = mongoose.model("Return", ReturnSchema);
