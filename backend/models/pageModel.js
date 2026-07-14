const mongoose = require("mongoose");
const pageSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, lowercase: true, trim: true },
  label: { type: String, required: true, trim: true },
  path: { type: String, required: true, unique: true },
}, { timestamps: true });
module.exports = mongoose.model("Page", pageSchema);
