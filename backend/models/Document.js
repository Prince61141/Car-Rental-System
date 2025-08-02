import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  aadhar: { type: String, required: true },
  pan: { type: String, required: true },
  name: String,
});

const Document = mongoose.model("Document", DocumentSchema);
export default Document;