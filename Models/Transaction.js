const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  customerId: { type: mongoose.Types.ObjectId, ref: "Customer" },
  date: { type: Number, default: Math.floor(Date.now() / 1000) },
  invoice_no: { type: Number, required: true }, // No need to mark it as required
  items: [{ type: mongoose.Types.ObjectId, ref: "product" }],
  discount: { type: Number, required: true },
  total_amount: { type: Number, required: true },
});

// TransactionSchema.pre("save", async function (next) {
//   try {
//     if (!this.invoice_no) {
//       const lastTransaction = await this.constructor.findOne(
//         {},
//         {},
//         { sort: { invoice_no: -1 } }
//       );
//       const lastInvoiceNo = lastTransaction ? lastTransaction.invoice_no : 0;
//       this.invoice_no = lastInvoiceNo + 1;
//     }
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = mongoose.model("Transaction", TransactionSchema);
