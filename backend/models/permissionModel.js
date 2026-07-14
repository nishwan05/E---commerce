const mongoose = require("mongoose");
const permissionSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true, lowercase: true, trim: true },
  pages: [{ type: String }],
}, { timestamps: true });
module.exports = mongoose.model("Permission", permissionSchema);
