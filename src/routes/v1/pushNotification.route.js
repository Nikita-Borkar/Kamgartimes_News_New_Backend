const express = require("express");
const rateLimit = require("express-rate-limit");
const controller = require("../../controllers/pushNotificationController");

const router = express.Router();
const subscriptionLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20 });

router.get("/key", controller.getKey);
router.post("/subscribe", subscriptionLimiter, controller.subscribe);
router.post("/unsubscribe", subscriptionLimiter, controller.unsubscribe);

module.exports = router;
