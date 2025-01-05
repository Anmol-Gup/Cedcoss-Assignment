const mongoose = require("mongoose");
const portalSchema = new mongoose.Schema({
  portalId: String,
  accountType: String,
  createdAt:{type:Date, default:Date.now}
});

const Portal = mongoose.model("Portal", portalSchema);
module.exports=Portal
