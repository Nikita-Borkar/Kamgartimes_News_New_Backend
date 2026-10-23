const z = require("zod");

const optionalEmail = z.email().or(z.literal("")).optional().default("");

const newsTipSchema = z.object({
  name: z.string().max(150).optional().default(""),
  email: optionalEmail,
  phone: z.string().max(30).optional().default(""),
  subject: z.string().max(200).optional().default(""),
  location: z.string().max(150).optional().default(""),
  description: z.string().min(1).max(4000),
  attachments: z.array(z.string()).optional().default([]),
});

const reporterApplicationSchema = z.object({
  fullName: z.string().min(1).max(150),
  email: z.email(),
  phone: z.string().min(1).max(30),
  city: z.string().max(150).optional().default(""),
  experience: z.string().max(500).optional().default(""),
  portfolioUrl: z.url().or(z.literal("")).optional().default(""),
  coverLetter: z.string().max(4000).optional().default(""),
});

const adInquirySchema = z.object({
  name: z.string().min(1).max(150),
  email: z.email(),
  phone: z.string().max(30).optional().default(""),
  company: z.string().max(150).optional().default(""),
  adType: z.string().max(100).optional().default(""),
  budget: z.string().max(100).optional().default(""),
  preferredSlot: z.string().max(100).optional().default(""),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  message: z.string().max(4000).optional().default(""),
});

const contactMessageSchema = z.object({
  name: z.string().min(1).max(150),
  email: z.email(),
  phone: z.string().max(30).optional().default(""),
  subject: z.string().max(200).optional().default(""),
  message: z.string().min(1).max(4000),
});

const statusSchemaFor = (statuses) =>
  z.object({
    status: z.enum(statuses),
    notes: z.string().max(2000).optional().default(""),
  });

const newsTipStatusSchema = statusSchemaFor([
  "NEW",
  "IN_REVIEW",
  "ACCEPTED",
  "REJECTED",
  "SPAM",
]);
const reporterApplicationStatusSchema = statusSchemaFor([
  "NEW",
  "IN_REVIEW",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
]);
const adInquiryStatusSchema = statusSchemaFor([
  "NEW",
  "IN_REVIEW",
  "QUOTED",
  "CLOSED",
  "REJECTED",
]);
const contactMessageStatusSchema = statusSchemaFor([
  "NEW",
  "IN_REVIEW",
  "REPLIED",
  "CLOSED",
  "SPAM",
]);

const submissionQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  newsTipSchema,
  reporterApplicationSchema,
  adInquirySchema,
  contactMessageSchema,
  newsTipStatusSchema,
  reporterApplicationStatusSchema,
  adInquiryStatusSchema,
  contactMessageStatusSchema,
  submissionQuerySchema,
};
