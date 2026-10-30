const webpush = require("web-push");
const PushSubscription = require("../models/PushSubscription");

const getVapidPublicKey = () => process.env.VAPID_PUBLIC_KEY || "";

const configureWebPush = () => {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) return false;
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

const sendArticleNotification = async (article) => {
  if (!configureWebPush()) {
    console.warn("Push notifications skipped: VAPID environment variables are missing.");
    return;
  }

  const subscriptions = await PushSubscription.find().lean();
  const payload = JSON.stringify({
    title: article.title,
    body: article.summary || "कामगार टाइम्स पर नई खबर पढ़ें।",
    url: `${(process.env.WEBSITE_URL || "").replace(/\/$/, "")}/article/${article.slug}`,
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

module.exports = { getVapidPublicKey, saveSubscription, removeSubscription, sendArticleNotification };
