let webpush;
try {
  webpush = require("web-push");
} catch {
  webpush = null;
}
const PushSubscription = require("../models/PushSubscription");
const MobilePushSubscription = require("../models/MobilePushSubscription");

const getVapidPublicKey = () => process.env.VAPID_PUBLIC_KEY || "";

const isValidVapidPublicKey = (key) => {
  if (typeof key !== "string" || !/^[A-Za-z0-9_-]+$/.test(key) || key.length % 4 === 1) return false;
  const normalized = key.replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Buffer.from(normalized, "base64");
  return bytes.length === 65 && bytes[0] === 4;
};

const configureWebPush = () => {
  if (!webpush) return false;
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!isValidVapidPublicKey(VAPID_PUBLIC_KEY) || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  return true;
};


// --- Web Push Subscriptions ---
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

// --- Mobile App Push Subscriptions (Expo / FCM) ---
const saveMobileSubscription = async ({ token, platform = "android", deviceName = "" }) => {
  if (!token || typeof token !== "string") {
    throw new Error("Valid push token is required");
  }
  const cleanToken = token.trim();
  return MobilePushSubscription.findOneAndUpdate(
    { token: cleanToken },
    {
      $set: {
        token: cleanToken,
        platform: ["android", "ios", "web"].includes(platform) ? platform : "android",
        deviceName: deviceName || "",
        isActive: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const removeMobileSubscription = async (token) => {
  if (!token) return;
  await MobilePushSubscription.updateOne({ token: token.trim() }, { $set: { isActive: false } });
};

// Send notifications to all registered mobile devices via Expo Push Service
const sendExpoPushNotification = async ({ title, body, url = "/", data = {} }) => {
  try {
    const subscriptions = await MobilePushSubscription.find({ isActive: true }).lean();
    if (!subscriptions || subscriptions.length === 0) {
      return { total: 0, sent: 0 };
    }

    const messages = subscriptions
      .filter((sub) => sub.token && (sub.token.startsWith("ExponentPushToken[") || sub.token.startsWith("ExpoPushToken[")))
      .map((sub) => ({
        to: sub.token,
        sound: "default",
        priority: "high",
        channelId: "default",
        title: title || "कामगार टाइम्स",
        body: body || "नवीन बातमी वाचण्यासाठी येथे टॅप करा.",
        data: {
          url,
          ...data,
          timestamp: new Date().toISOString(),
        },
      }));

    if (messages.length === 0) {
      return { total: subscriptions.length, sent: 0 };
    }

    // Chunk in batches of 100 as per Expo documentation
    const chunkSize = 100;
    const invalidTokens = [];

    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chunk),
      });

      const result = await res.json();
      if (Array.isArray(result.data)) {
        result.data.forEach((ticket, idx) => {
          if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
            invalidTokens.push(chunk[idx].to);
          }
        });
      }
    }

    // Clean up uninstalled app tokens
    if (invalidTokens.length > 0) {
      await MobilePushSubscription.updateMany(
        { token: { $in: invalidTokens } },
        { $set: { isActive: false } }
      );
    }

    return { total: subscriptions.length, sent: messages.length };
  } catch (err) {
    console.error("[ExpoPush] Error dispatching push notifications:", err.message);
    return { error: err.message };
  }
};

// Universal Broadcast: Sends to BOTH Web Browsers (VAPID) AND Native Mobile Devices (Expo)
const sendPushNotification = async ({ title, body, url = "/", data = {} }) => {
  // 1. Dispatch to Web Browsers (VAPID)
  const webPromise = (async () => {
    if (!configureWebPush()) return;
    const subscriptions = await PushSubscription.find().lean();
    if (!subscriptions || subscriptions.length === 0) return;

    const siteUrl = (process.env.WEBSITE_URL || "").replace(/\/$/, "");
    const payload = JSON.stringify({
      title: title || "कामगार टाइम्स",
      body: body || "नवीन बातमी वाचण्यासाठी येथे टॅप करा.",
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
          }
        }
      })
    );
  })();

  // 2. Dispatch to Native Mobile Apps (Expo / FCM)
  const mobilePromise = sendExpoPushNotification({ title, body, url, data });

  return Promise.allSettled([webPromise, mobilePromise]);
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
  saveMobileSubscription,
  removeMobileSubscription,
  sendExpoPushNotification,
  sendPushNotification,
  notifyPushSubscribers,
};
