const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reqStr = {
  type: String,
  required: true,
};

const BranchSchema = new Schema({
  name: reqStr,
  email: reqStr,
  branch_number: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Branch", BranchSchema);
