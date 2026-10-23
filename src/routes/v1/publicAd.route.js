const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const { list, click, impression } = require("../../controllers/publicAdController");
const validate = require("../../middlewares/validate");
const {
  publicAdQuerySchema,
  adClickSchema,
  adImpressionSchema,
} = require("../../dtos/publicAdDto");

// Clicks are public and write to the database — keep one IP from
// flooding the collection.
const clickLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, statusCode: 429, message: "Too many click requests" },
});

/**
 * @swagger
 * /public/ads:
 *   get:
 *     summary: Active ads for a reader-site slot (public)
 *     tags: [Public Ads]
 *     parameters:
 *       - in: query
 *         name: slot
 *         required: true
 *         schema: { type: string }
 *         example: hero_leaderboard
 *     responses:
 *       200:
 *         description: Slot metadata plus up to maxAds active ads
 *       404:
 *         description: Slot not found or inactive
 */

/**
 * @swagger
 * /public/ads/click:
 *   post:
 *     summary: Record an ad click and get the destination URL (public)
 *     tags: [Public Ads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [adCampaignId, adSlotId]
 *             properties:
 *               adCampaignId: { type: string, example: 64f8a1b2c3d4e5f6a7b8c9d1 }
 *               adSlotId: { type: string, example: 64f8a1b2c3d4e5f6a7b8c9d0 }
 *     responses:
 *       200:
 *         description: Click recorded; returns clickUrl and target for the frontend redirect
 *       404:
 *         description: Campaign or slot not found/inactive
 *       429:
 *         description: Too many click requests
 */

/**
 * @swagger
 * /public/ads/impression:
 *   post:
 *     summary: Record an ad impression (public)
 *     tags: [Public Ads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [adCampaignId, adSlotId]
 *             properties:
 *               adCampaignId: { type: string }
 *               adSlotId: { type: string }
 *     responses:
 *       200:
 *         description: Impression recorded
 *       404:
 *         description: Campaign or slot not found/inactive
 */

router.get("/", validate(publicAdQuerySchema, "query"), list);
router.post("/click", clickLimiter, validate(adClickSchema), click);
router.post(
  "/impression",
  clickLimiter,
  validate(adImpressionSchema),
  impression,
);

module.exports = router;
