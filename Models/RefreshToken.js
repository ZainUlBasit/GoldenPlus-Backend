const mongoose = require("mongoose");

const reqStr = {
  type: String,
  required: true,
};

const RefreshTokenSchema = mongoose.Schema({
  user_id: reqStr,
  token: reqStr,
});

module.exports = mongoose.model("RefreshTokenModel", RefreshTokenSchema);
