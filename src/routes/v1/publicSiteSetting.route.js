const express = require("express");
const router = express.Router();

const { get } = require("../../controllers/siteSettingController");

/**
 * @swagger
 * /public/site-setting:
 *   get:
 *     summary: Public site configuration for reader website (logo, tagline, social links)
 *     tags: [Public Site Settings]
 *     responses:
 *       200:
 *         description: Public site setting object
 */

router.get("/", get);

module.exports = router;
