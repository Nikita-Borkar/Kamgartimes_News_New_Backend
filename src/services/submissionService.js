const mongoose = require("mongoose");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Shared behaviour for the public inboxes (news tips, reporter applications,
// ad inquiries, contact messages). Each model has its own fields; the
// lifecycle (create, list, read, status) is identical.
const createSubmissionService = (Model, { searchFields = [], label = "Submission" } = {}) => {
  const list = async ({ status, search, page = 1, limit = 20 } = {}) => {
    const filter = {};
    if (status) filter.status = status;
    if (search && searchFields.length) {
      const rx = { $regex: escapeRegex(search), $options: "i" };
      filter.$or = searchFields.map((field) => ({ [field]: rx }));
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

    const [items, total] = await Promise.all([
      Model.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("reviewedBy", "name")
        .lean(),
      Model.countDocuments(filter),
    ]);

    return { items, total, page: pageNum, limit: limitNum };
  };

  const getById = async (id) => {
    if (!mongoose.isValidObjectId(id)) throw new BadRequestError(`Invalid ${label} ID`);
    const item = await Model.findById(id).populate("reviewedBy", "name");
    if (!item) throw new NotFoundError(`${label} not found`);
    return item;
  };

  const create = async (payload, meta = {}) =>
    Model.create({
      ...payload,
      ipAddress: meta.ipAddress || "",
      userAgent: meta.userAgent || "",
    });

  const updateStatus = async (id, { status, notes }, userId) => {
    if (!mongoose.isValidObjectId(id)) throw new BadRequestError(`Invalid ${label} ID`);
    const item = await Model.findById(id);
    if (!item) throw new NotFoundError(`${label} not found`);

    item.status = status;
    if (notes !== undefined) item.notes = notes;
    item.reviewedBy = userId;
    item.reviewedAt = new Date();

    await item.save();
    return item;
  };

  return { list, getById, create, updateStatus };
};

module.exports = { createSubmissionService };
