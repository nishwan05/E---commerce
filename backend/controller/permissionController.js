const Permission = require("../models/permissionModel");
exports.getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find();
    res.json({ success: true, data: permissions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch permissions" });
  }
};
exports.updatePermission = async (req, res) => {
  try {
    const { role, page, checked } = req.body;
    let permission = await Permission.findOne({ role });
    if (!permission) permission = await Permission.create({ role, pages: [] });
    if (checked) { if (!permission.pages.includes(page)) permission.pages.push(page); }
    else { permission.pages = permission.pages.filter((p) => p !== page); }
    await permission.save();
    const io = req.app.get("io");
    io.emit("permissionsUpdated");
    return res.json({ success: true, data: permission });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update permission" });
  }
};
