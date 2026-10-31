const successResponse = require("../errors/responses/successResponse");
const {
  getVapidPublicKey,
  isValidVapidPublicKey,
  saveSubscription,
  removeSubscription,
  saveMobileSubscription,
  removeMobileSubscription,
  sendPushNotification,
} = require("../services/pushNotificationService");

const getKey = (req, res) => {
  const publicKey = getVapidPublicKey();
  if (!isValidVapidPublicKey(publicKey)) {
    return res.status(503).json({
      success: false,
      message: "Push notifications are not configured correctly. Set a valid VAPID key pair and restart the backend.",
    });
  }
  return res.status(200).json(new successResponse(200, "Push key fetched", { publicKey }));
};

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

const subscribeMobile = async (req, res, next) => {
  try {
    const { token, platform, deviceName } = req.body || {};
    if (!token || typeof token !== "string") {
      return res.status(400).json({ success: false, message: "Device push token is required" });
    }
    await saveMobileSubscription({ token, platform, deviceName });
    return res.status(201).json(new successResponse(201, "Subscribed mobile device to notifications", { subscribed: true }));
  } catch (error) {
    return next(error);
  }
};

const unsubscribeMobile = async (req, res, next) => {
  try {
    const { token } = req.body || {};
    if (!token || typeof token !== "string") {
      return res.status(400).json({ success: false, message: "Device push token is required" });
    }
    await removeMobileSubscription(token);
    return res.status(200).json(new successResponse(200, "Unsubscribed mobile device", { subscribed: false }));
  } catch (error) {
    return next(error);
  }
};

const testBroadcast = async (req, res, next) => {
  try {
    const { title, body, url, data } = req.body || {};
    const result = await sendPushNotification({
      title: title || "कामगार टाइम्स - Test Notification",
      body: body || "हे एक चाचणी सूचना (Test Notification) आहे.",
      url: url || "/",
      data: data || {},
    });
    return res.status(200).json(new successResponse(200, "Push notifications broadcasted", { result }));
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getKey,
  subscribe,
  unsubscribe,
  subscribeMobile,
  unsubscribeMobile,
  testBroadcast,
};

