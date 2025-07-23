const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  aadhar: { type: String, required: true },
  pan: { type: String, required: true },
  name: String,
});

module.exports = mongoose.model("Document", DocumentSchema);