const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  customerId: { type: mongoose.Types.ObjectId, ref: "Customer" },
  date: { type: Number, default: Math.floor(Date.now() / 1000) },
  invoice_no: { type: Number, required: true }, // No need to mark it as required
  items: [{ type: mongoose.Types.ObjectId, ref: "product" }],
  discount: { type: Number, required: true },
  total_amount: { type: Number, required: true },
  branchId: { type: mongoose.Types.ObjectId, ref: "Branch" },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
