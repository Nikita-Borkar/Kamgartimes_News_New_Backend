const express = require("express");

const {
  submit,
  list,
  getById,
  updateStatus,
} = require("../../controllers/submissionController");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/authMiddleware");
const { loadPermissions, requirePermission } = require("../../middlewares/permissionMiddleware");
const formLimiter = require("../../middlewares/formLimiter");
const {
  newsTipSchema,
  reporterApplicationSchema,
  adInquirySchema,
  contactMessageSchema,
  newsTipStatusSchema,
  reporterApplicationStatusSchema,
  adInquiryStatusSchema,
  contactMessageStatusSchema,
  submissionQuerySchema,
} = require("../../dtos/submissionDto");

/**
 * @swagger
 * /public/submissions/news-tips:
 *   post:
 *     summary: Submit a news tip (public)
 *     tags: [Public Submissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               subject: { type: string }
 *               location: { type: string }
 *               description: { type: string }
 *               attachments:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201:
 *         description: Tip received
 *       429:
 *         description: Too many submissions
 */

/**
 * @swagger
 * /public/submissions/reporter-applications:
 *   post:
 *     summary: Apply to become a reporter (public)
 *     tags: [Public Submissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, phone]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               city: { type: string }
 *               experience: { type: string }
 *               portfolioUrl: { type: string }
 *               coverLetter: { type: string }
 *     responses:
 *       201:
 *         description: Application received
 *       429:
 *         description: Too many submissions
 */

/**
 * @swagger
 * /public/submissions/ad-inquiries:
 *   post:
 *     summary: Ask about advertising (public)
 *     tags: [Public Submissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               company: { type: string }
 *               adType: { type: string }
 *               budget: { type: string }
 *               preferredSlot: { type: string }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Inquiry received
 *       429:
 *         description: Too many submissions
 */

/**
 * @swagger
 * /public/submissions/contact-messages:
 *   post:
 *     summary: Send a contact message (public)
 *     tags: [Public Submissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               subject: { type: string }
 *               message: { type: string }
 *     responses:
 *       201:
 *         description: Message received
 *       429:
 *         description: Too many submissions
 */

/**
 * @swagger
 * /news-tips:
 *   get:
 *     summary: List news tips (admin)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: News tips
 * /news-tips/{id}:
 *   get:
 *     summary: Get a news tip (admin)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: News tip
 * /news-tips/{id}/status:
 *   patch:
 *     summary: Update a news tip's status (admin)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [NEW, IN_REVIEW, ACCEPTED, REJECTED, SPAM]
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @swagger
 * /reporter-applications:
 *   get:
 *     summary: List reporter applications (admin)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications
 * /reporter-applications/{id}:
 *   get:
 *     summary: Get a reporter application (admin)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Application
 * /reporter-applications/{id}/status:
 *   patch:
 *     summary: Update a reporter application's status (admin)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [NEW, IN_REVIEW, SHORTLISTED, HIRED, REJECTED, SPAM]
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @swagger
 * /ad-inquiries:
 *   get:
 *     summary: List ad inquiries (admin)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inquiries
 * /ad-inquiries/{id}:
 *   get:
 *     summary: Get an ad inquiry (admin)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Inquiry
 * /ad-inquiries/{id}/status:
 *   patch:
 *     summary: Update an ad inquiry's status (admin)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [NEW, IN_REVIEW, QUOTED, CLOSED, SPAM]
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @swagger
 * /contact-messages:
 *   get:
 *     summary: List contact messages (admin)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Messages
 * /contact-messages/{id}:
 *   get:
 *     summary: Get a contact message (admin)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Message
 * /contact-messages/{id}/status:
 *   patch:
 *     summary: Update a contact message's status (admin)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [NEW, IN_REVIEW, REPLIED, CLOSED, SPAM]
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Status updated
 */

// Public inboxes and their admin companions share the same lifecycle, so each
// resource gets an identical pair of routers.
const buildRouters = (key, submitSchema, statusSchema) => {
  const publicRouter = express.Router();
  publicRouter.post("/", formLimiter, validate(submitSchema), submit(key));

  const adminRouter = express.Router();
  adminRouter.use(authenticate, loadPermissions);
  adminRouter.get(
    "/",
    requirePermission("submission:read"),
    validate(submissionQuerySchema, "query"),
    list(key),
  );
  adminRouter.get("/:id", requirePermission("submission:read"), getById(key));
  adminRouter.patch(
    "/:id/status",
    requirePermission("submission:update"),
    validate(statusSchema),
    updateStatus(key),
  );

  return { publicRouter, adminRouter };
};

const resources = {
  newsTips: buildRouters("newsTip", newsTipSchema, newsTipStatusSchema),
  reporterApplications: buildRouters(
    "reporter",
    reporterApplicationSchema,
    reporterApplicationStatusSchema,
  ),
  adInquiries: buildRouters("adInquiry", adInquirySchema, adInquiryStatusSchema),
  contactMessages: buildRouters(
    "contact",
    contactMessageSchema,
    contactMessageStatusSchema,
  ),
};

module.exports = resources;
