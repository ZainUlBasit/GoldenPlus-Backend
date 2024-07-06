const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const Schema = mongoose.Schema;

const reqStr = { type: String, required: true };
const reqNum = { type: Number, required: true };

const PaymentSchema = new Schema({
  user_type: { type: Number, enum: [1, 2], required: true }, // 1: Company 2: Customer
  user_Id: reqStr,
  user_name: reqStr,
  depositor: reqStr,
  payment_type: { type: Number, enum: [1, 2, 3], required: true }, // 1: Cash 2: Bank 3: Check
  bank_name: String,
  bank_number: Number,
  amount: reqNum,
  date: { type: Number, default: () => Math.floor(Date.now() / 1000) },
  desc: reqStr,
  branch: reqNum,
  invoice_no: { type: Number },
});

// Apply the auto-increment plugin to the PaymentSchema for the invoice_no field
PaymentSchema.plugin(AutoIncrement, { inc_field: "invoice_no" });

module.exports = mongoose.model("Payment", PaymentSchema);
