const webpush = require("web-push");
const PushSubscription = require("../models/PushSubscription");

const getVapidPublicKey = () => process.env.VAPID_PUBLIC_KEY || "";

const isValidVapidPublicKey = (key) => {
  if (typeof key !== "string" || !/^[A-Za-z0-9_-]+$/.test(key) || key.length % 4 === 1) return false;
  const normalized = key.replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Buffer.from(normalized, "base64");
  return bytes.length === 65 && bytes[0] === 4;
};

const configureWebPush = () => {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!isValidVapidPublicKey(VAPID_PUBLIC_KEY) || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  return true;
};

const saveSubscription = async (subscription) => {
  await PushSubscription.updateOne(
    { endpoint: subscription.endpoint },
    { $set: { endpoint: subscription.endpoint, keys: subscription.keys } },
    { upsert: true, runValidators: true },
  );
};

const removeSubscription = async (endpoint) => {
  await PushSubscription.deleteOne({ endpoint });
};

const sendPushNotification = async ({ title, body, url = "/" }) => {
  if (!configureWebPush()) {
    console.warn("Push notifications skipped: VAPID environment variables are missing.");
    return;
  }

  const subscriptions = await PushSubscription.find().lean();
  const siteUrl = (process.env.WEBSITE_URL || "").replace(/\/$/, "");
  const payload = JSON.stringify({
    title: title || "कामगार टाइम्स",
    body: body || "नई जानकारी पढ़ने के लिए टैप करें।",
    url: /^https?:\/\//i.test(url) ? url : `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`,
    icon: "/img/logo.png",
  });

  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, payload);
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: subscription._id });
        } else {
          console.error("Push notification delivery failed:", error.message);
        }
      }
    }),
  );
};

const notifyPushSubscribers = (notification) =>
  sendPushNotification(notification).catch((error) =>
    console.error("Could not send push notifications:", error.message),
  );

module.exports = {
  getVapidPublicKey,
  isValidVapidPublicKey,
  saveSubscription,
  removeSubscription,
  sendPushNotification,
  notifyPushSubscribers,
};
