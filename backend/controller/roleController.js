const Role = require("../models/roleModel");
exports.getRoles = async (req, res) => {
  const roles = await Role.find().sort({ name: 1 });
  res.json({ success: true, data: roles });
};
exports.createRole = async (req, res) => {
  const { name } = req.body;
  const exists = await Role.findOne({ name: name.toLowerCase() });
  if (exists)
    return res
      .status(400)
      .json({ success: false, message: "Role already exists" });
  const role = await Role.create({ name: name.toLowerCase() });
  res.status(201).json({ success: true, data: role });
};
exports.updateRole = async (req, res) => {
  try {
    const { name } = req.body;
    const existingRole = await Role.findOne({
      name: name.toLowerCase(),
      _id: { $ne: req.params.id },
    });
    if (existingRole)
      return res
        .status(400)
        .json({ success: false, message: "Role already exists" });
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name: name.toLowerCase() },
      { returnDocument: "after" },
    );
    if (!role)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update role" });
  }
};
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    const protectedRoles = ["superadmin", "admin", "member"];
    if (protectedRoles.includes(role.name))
      return res
        .status(403)
        .json({ success: false, message: "This role cannot be deleted" });
    await Role.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete role" });
  }
};
