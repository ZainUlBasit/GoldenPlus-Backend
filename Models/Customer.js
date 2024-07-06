const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Name
// Contact
// Email
// Password
// Confirm Password
// Cnic
// Address
// Shop

const reqStr = {
  type: String,
  required: true,
};
const reqNum = {
  type: Number,
  required: true,
};

const CustomerSchema = new Schema({
  name: reqStr,
  email: reqStr,
  // user_type: { type: Number, enum: [1, 2, 3], required: true }, // 1: Customer 2: Shop 3:Whole-Saler
  cnic: reqStr,
  contact: reqStr,
  address: reqStr,
  branch: reqNum,
  ref: reqStr,
  page: reqNum,
  return_amount: { type: Number, default: 0, required: true },
  discount: { type: Number, default: 0, required: true },
  paid: { type: Number, default: 0, required: true },
  remaining: { type: Number, default: 0, required: true },
  total: { type: Number, default: 0, required: true },
  date: { type: Number, default: Math.floor(Date.now() / 1000) },
});

module.exports = mongoose.model("Customer", CustomerSchema);
