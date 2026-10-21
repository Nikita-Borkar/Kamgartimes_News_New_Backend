const mongoose = require("mongoose");
const AdClick = require("../models/AdClick");
const AdCampaign = require("../models/AdCampaign");
const AdSlot = require("../models/AdSlot");

const toId = (val) => new mongoose.Types.ObjectId(val);

// Click report: totals plus breakdowns by campaign, by slot and by day.
const getClickStats = async ({ campaign, slot, from, to } = {}) => {
  const match = {};
  if (campaign) match.adCampaign = toId(campaign);
  if (slot) match.adSlot = toId(slot);
  if (from || to) {
    match.clickedAt = {};
    if (from) match.clickedAt.$gte = new Date(from);
    if (to) match.clickedAt.$lte = new Date(to);
  }

  const [total, byCampaignRaw, bySlotRaw, byDayRaw] = await Promise.all([
    AdClick.countDocuments(match),
    AdClick.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$adCampaign",
          clicks: { $sum: 1 },
          lastClickedAt: { $max: "$clickedAt" },
        },
      },
      { $sort: { clicks: -1 } },
      { $limit: 100 },
    ]),
    AdClick.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$adSlot",
          clicks: { $sum: 1 },
          lastClickedAt: { $max: "$clickedAt" },
        },
      },
      { $sort: { clicks: -1 } },
      { $limit: 100 },
    ]),
    AdClick.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$clickedAt" } },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 90 },
    ]),
  ]);

  // Names are resolved in JS to avoid hardcoding collection names in $lookup
  const [campaigns, slots] = await Promise.all([
    AdCampaign.find({
      _id: { $in: byCampaignRaw.map((row) => row._id) },
    }).select("title clickUrl isActive"),
    AdSlot.find({ _id: { $in: bySlotRaw.map((row) => row._id) } }).select("name key section"),
  ]);
  const campaignById = new Map(campaigns.map((doc) => [String(doc._id), doc]));
  const slotById = new Map(slots.map((doc) => [String(doc._id), doc]));

  return {
    total,
    range: { from: from || null, to: to || null },
    byCampaign: byCampaignRaw.map((row) => {
      const doc = campaignById.get(String(row._id));
      return {
        campaignId: row._id,
        title: doc ? doc.title : "Deleted campaign",
        isActive: doc ? doc.isActive : false,
        clicks: row.clicks,
        lastClickedAt: row.lastClickedAt,
      };
    }),
    bySlot: bySlotRaw.map((row) => {
      const doc = slotById.get(String(row._id));
      return {
        slotId: row._id,
        name: doc ? doc.name : "Deleted slot",
        key: doc ? doc.key : null,
        section: doc ? doc.section : null,
        clicks: row.clicks,
        lastClickedAt: row.lastClickedAt,
      };
    }),
    byDay: byDayRaw.map((row) => ({ date: row._id, clicks: row.clicks })),
  };
};

module.exports = { getClickStats };
