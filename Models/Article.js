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

const CategorySchema = new Schema({
  branchId: { type: mongoose.Types.ObjectId, ref: "Branch" },
  name: reqStr,
  branch: reqNum,
});

module.exports =
  mongoose.models.Article || mongoose.model("Article", CategorySchema);
