const mongoose = require("mongoose");
const AdSlot = require("../models/AdSlot");
const AdCampaign = require("../models/AdCampaign");
const AdPlacement = require("../models/AdPlacement");
const AdClick = require("../models/AdClick");
const AdImpression = require("../models/AdImpression");
const BadRequestError = require("../errors/customErrors/BadRequestError");
const NotFoundError = require("../errors/customErrors/NotFoundError");

const assertValidId = (id, label) => {
  if (!mongoose.isValidObjectId(id)) throw new BadRequestError(`Invalid ${label} ID`);
};

const inWindow = (start, end, now) =>
  (!start || new Date(start) <= now) && (!end || new Date(end) >= now);

// Orders candidates of equal priority by their weight (1-100), so heavier
// placements rotate in more often.
const weightedShuffle = (items) => {
  const pool = items.slice();
  const out = [];
  while (pool.length) {
    const total = pool.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    let picked = 0;
    for (let i = 0; i < pool.length; i++) {
      roll -= pool[i].weight;
      if (roll <= 0) {
        picked = i;
        break;
      }
    }
    out.push(pool[picked]);
    pool.splice(picked, 1);
  }
  return out;
};

// Resolves what the reader site should render for a given slot key:
// highest-priority active placements first, weighted rotation inside a
// priority tier, capped at the slot's maxAds.
const getAdsForSlot = async (slotKey) => {
  // Treat a missing isActive flag as active. Older slot records were created
  // without the field, and the admin UI already shows them as active.
  const slot = await AdSlot.findOne({ key: slotKey, isActive: { $ne: false } });
  if (!slot) throw new NotFoundError("Ad slot not found");

  const now = new Date();
  const placements = await AdPlacement.find({
    adSlot: slot._id,
    isActive: { $ne: false },
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  }).populate("adCampaign");

  const seenCampaigns = new Set();
  const candidates = [];
  for (const placement of placements) {
    const campaign = placement.adCampaign;
    if (!campaign || campaign.isActive === false) continue;
    if (!inWindow(campaign.startDate, campaign.endDate, now)) continue;
    if (seenCampaigns.has(String(campaign._id))) continue;
    seenCampaigns.add(String(campaign._id));
    candidates.push(placement);
  }

  candidates.sort((a, b) => b.adCampaign.priority - a.adCampaign.priority);

  const ads = [];
  let index = 0;
  while (ads.length < slot.maxAds && index < candidates.length) {
    const priority = candidates[index].adCampaign.priority;
    const group = [];
    while (index < candidates.length && candidates[index].adCampaign.priority === priority) {
      group.push(candidates[index]);
      index += 1;
    }
    for (const placement of weightedShuffle(group)) {
      if (ads.length >= slot.maxAds) break;
      ads.push({
        adCampaignId: placement.adCampaign._id,
        adSlotId: slot._id,
        title: placement.adCampaign.title,
        imageUrl: placement.adCampaign.imageUrl,
        imageAlt: placement.adCampaign.imageAlt || placement.adCampaign.title,
        clickUrl: placement.adCampaign.clickUrl,
        target: placement.adCampaign.target,
        width: slot.size.width,
        height: slot.size.height,
      });
    }
  }

  return {
    slot: {
      key: slot.key,
      name: slot.name,
      section: slot.section,
      width: slot.size.width,
      height: slot.size.height,
      label: slot.size.label,
    },
    ads,
  };
};

// Persists the click and hands back the destination so the frontend can
// redirect the reader in one round trip.
const recordClick = async ({ adCampaignId, adSlotId, ipAddress, userAgent }) => {
  assertValidId(adCampaignId, "ad campaign");
  assertValidId(adSlotId, "ad slot");

  const [campaign, slot] = await Promise.all([
    AdCampaign.findById(adCampaignId),
    AdSlot.findById(adSlotId),
  ]);
  if (!campaign || campaign.isActive === false) throw new NotFoundError("Ad campaign not found");
  if (!slot || slot.isActive === false) throw new NotFoundError("Ad slot not found");

  await AdClick.create({
    adCampaign: campaign._id,
    adSlot: slot._id,
    ipAddress: ipAddress || "",
    userAgent: userAgent || "",
  });

  return { clickUrl: campaign.clickUrl, target: campaign.target };
};

// Impressions are written per render, so the counter on the campaign can be
// read without aggregating the impression collection.
const recordImpression = async ({ adCampaignId, adSlotId, ipAddress, userAgent }) => {
  assertValidId(adCampaignId, "ad campaign");
  assertValidId(adSlotId, "ad slot");

  const [campaign, slot] = await Promise.all([
    AdCampaign.findById(adCampaignId),
    AdSlot.findById(adSlotId),
  ]);
  if (!campaign || campaign.isActive === false) throw new NotFoundError("Ad campaign not found");
  if (!slot || slot.isActive === false) throw new NotFoundError("Ad slot not found");

  await Promise.all([
    AdImpression.create({
      adCampaign: campaign._id,
      adSlot: slot._id,
      ipAddress: ipAddress || "",
      userAgent: userAgent || "",
    }),
    AdCampaign.updateOne({ _id: campaign._id }, { $inc: { impressions: 1 } }),
  ]);

  return { recorded: true };
};

module.exports = { getAdsForSlot, recordClick, recordImpression };
