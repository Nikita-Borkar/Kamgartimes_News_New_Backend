const successResponse = require("../errors/responses/successResponse");
const {
  getVapidPublicKey,
  saveSubscription,
  removeSubscription,
} = require("../services/pushNotificationService");

const getKey = (req, res) =>
  res.status(200).json(new successResponse(200, "Push key fetched", { publicKey: getVapidPublicKey() }));

const subscribe = async (req, res, next) => {
  try {
    const subscription = req.body;
    if (
      typeof subscription?.endpoint !== "string" ||
      typeof subscription?.keys?.p256dh !== "string" ||
      typeof subscription?.keys?.auth !== "string"
    ) {
      return res.status(400).json({ success: false, message: "Invalid push subscription" });
    }
    let endpointUrl;
    try {
      endpointUrl = new URL(subscription.endpoint);
    } catch {
      return res.status(400).json({ success: false, message: "Invalid push endpoint" });
    }
    const allowedPushHost =
      endpointUrl.protocol === "https:" &&
      (endpointUrl.hostname === "fcm.googleapis.com" ||
        endpointUrl.hostname === "updates.push.services.mozilla.com" ||
        endpointUrl.hostname.endsWith(".push.apple.com") ||
        endpointUrl.hostname.endsWith(".notify.windows.com"));
    if (!allowedPushHost) {
      return res.status(400).json({ success: false, message: "Unsupported push endpoint" });
    }
    await saveSubscription(subscription);
    return res.status(201).json(new successResponse(201, "Subscribed to notifications", { subscribed: true }));
  } catch (error) {
    return next(error);
  }
};

const unsubscribe = async (req, res, next) => {
  try {
    if (typeof req.body?.endpoint !== "string") {
      return res.status(400).json({ success: false, message: "Subscription endpoint is required" });
    }
    await removeSubscription(req.body.endpoint);
    return res.status(200).json(new successResponse(200, "Unsubscribed from notifications", { subscribed: false }));
  } catch (error) {
    return next(error);
  }
};

module.exports = { getKey, subscribe, unsubscribe };
