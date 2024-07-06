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
  branchId: { type: mongoose.Types.ObjectId, ref: "Branch" },
  branch_name: reqStr,
  branch: reqNum,
  supplierId: { type: mongoose.Types.ObjectId, ref: "Company" },
  supplier_name: reqStr,
  rm_name: reqStr,
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

module.exports = mongoose.model("RawMaterialStock", StockSchema);
