const mongoose = require("mongoose");
const tokenSchema = new mongoose.Schema({
  refresh_token: String,
  access_token: String,
  expires_in: Date,
  portalId:String,
  createdAt:{type:Date, default:Date.now}
});

const Token = mongoose.model("token", tokenSchema);
module.exports=Token
