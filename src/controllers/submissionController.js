const NewsTip = require("../models/NewsTip");
const ReporterApplication = require("../models/ReporterApplication");
const AdInquiry = require("../models/AdInquiry");
const ContactMessage = require("../models/ContactMessage");
const { createSubmissionService } = require("../services/submissionService");
const successResponse = require("../errors/responses/successResponse");

const services = {
  newsTip: createSubmissionService(NewsTip, {
    searchFields: ["subject", "description", "name", "email", "phone", "location"],
    label: "News tip",
  }),
  reporter: createSubmissionService(ReporterApplication, {
    searchFields: ["fullName", "email", "phone", "city"],
    label: "Reporter application",
  }),
  adInquiry: createSubmissionService(AdInquiry, {
    searchFields: ["name", "email", "company", "phone"],
    label: "Ad inquiry",
  }),
  contact: createSubmissionService(ContactMessage, {
    searchFields: ["name", "email", "subject", "message"],
    label: "Contact message",
  }),
};

const requestMeta = (req) => ({
  ipAddress: req.ip || "",
  userAgent: req.get("user-agent") || "",
});

const submit = (key) => async (req, res, next) => {
  try {
    const service = services[key];
    const item = await service.create(req.validatedBody, requestMeta(req));
    return res
      .status(201)
      .json(new successResponse(201, "Submitted successfully", { id: item._id }));
  } catch (err) {
    next(err);
  }
};

const list = (key) => async (req, res, next) => {
  try {
    const result = await services[key].list(req.validatedQuery);
    return res
      .status(200)
      .json(new successResponse(200, "Submissions fetched successfully", result));
  } catch (err) {
    next(err);
  }
};

const getById = (key) => async (req, res, next) => {
  try {
    const item = await services[key].getById(req.params.id);
    return res
      .status(200)
      .json(new successResponse(200, "Submission fetched successfully", item));
  } catch (err) {
    next(err);
  }
};

const updateStatus = (key) => async (req, res, next) => {
  try {
    const item = await services[key].updateStatus(
      req.params.id,
      req.validatedBody,
      req.user.userId,
    );
    return res
      .status(200)
      .json(new successResponse(200, "Submission status updated", item));
  } catch (err) {
    next(err);
  }
};

module.exports = { submit, list, getById, updateStatus };
