const Page = require("../models/pageModel");
exports.getPages = async (req, res) => {
  const pages = await Page.find();
  res.json({ success: true, data: pages });
};
exports.createPage = async (req, res) => {
  const page = await Page.create(req.body);
  res.status(201).json({ success: true, data: page });
};
exports.updatePage = async (req, res) => {
  const page = await Page.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
  });
  res.json({ success: true, data: page });
};
exports.deletePage = async (req, res) => {
  await Page.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
