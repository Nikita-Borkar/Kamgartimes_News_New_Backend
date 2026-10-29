const mongoose = require("mongoose");
const dotenv = require("dotenv");
const AdSlot = require("../models/AdSlot");
const User = require("../models/User");

dotenv.config();

// The fixed reader-site positions. Keys are the contract: the site requests
// /public/ads?slot=<key>. Keep this list in sync with the slotKey props in the
// Hindi website.
const DEFAULT_SLOTS = [
  {
    name: "Hero Billboard",
    key: "hero_leaderboard",
    section: "hero",
    width: 880,
    height: 550,
    position: 0,
  },
  {
    name: "Lead Grid Rail",
    key: "article_top",
    section: "home",
    width: 240,
    height: 420,
    position: 0,
  },
  {
    name: "Trending / Features Sidebar",
    key: "sidebar_square",
    section: "sidebar",
    width: 340,
    height: 200,
    position: 0,
  },
  {
    name: "Article Inside Ad",
    key: "in_article_middle",
    section: "article",
    width: 300,
    height: 450,
    position: 0,
  },
  {
    name: "Home Weather Ad",
    key: "home_mid_3",
    section: "home",
    width: 300,
    height: 300,
    position: 1,
  },
  {
    name: "Home Poll Ad",
    key: "home_mid_4",
    section: "home",
    width: 662,
    height: 300,
    position: 2,
  },
  {
    name: "Home Between Sections 1",
    key: "home_between_1",
    section: "home",
    width: 1280,
    height: 110,
    position: 3,
  },
  {
    name: "Home Between Sections 2",
    key: "home_between_2",
    section: "home",
    width: 1280,
    height: 110,
    position: 4,
  },
  {
    name: "Home Between Sections 3",
    key: "home_between_3",
    section: "home",
    width: 1280,
    height: 110,
    position: 5,
  },
  {
    name: "Home Between Sections 4",
    key: "home_between_4",
    section: "home",
    width: 1280,
    height: 110,
    position: 6,
  },
];

// Earlier versions of this script seeded these positions. The reader site
// never requests them, so switch them off to keep the admin list honest.
const OBSOLETE_KEYS = [
  "sidebar_rectangle",
  "mobile_header",
  "footer_banner",
  "category_top",
  "sidebar_skyscraper",
  "sticky_bottom",
];

const seedAdSlots = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for ad slot seeding");

    const adminEmail = process.env.ADMIN_EMAIL;
    const admin =
      adminEmail ?
        await User.findOne({ email: adminEmail.toLowerCase() })
      : null;
    if (!admin) {
      console.error(
        "No admin user found — run `npm run seed` first so the admin account exists.",
      );
      process.exit(1);
    }

    for (const slot of DEFAULT_SLOTS) {
      await AdSlot.updateOne(
        { key: slot.key },
        {
          $set: {
            name: slot.name,
            section: slot.section,
            size: {
              width: slot.width,
              height: slot.height,
              label: `${slot.width}x${slot.height}`,
            },
            position: slot.position,
          },
          $setOnInsert: {
            isActive: true,
            maxAds: 1,
            createdBy: admin._id,
          },
        },
        { upsert: true },
      );
      console.log(`Seeded ad slot: ${slot.key} (${slot.width}x${slot.height})`);
    }

    // Older records may be missing isActive entirely. Mongo's find({isActive:
    // true}) does not match a missing field, so repair them on every seed.
    const repaired = await AdSlot.updateMany(
      {
        key: { $in: DEFAULT_SLOTS.map((slot) => slot.key) },
        isActive: { $exists: false },
      },
      { $set: { isActive: true } },
    );
    if (repaired.modifiedCount) {
      console.log(
        `Repaired missing isActive on ${repaired.modifiedCount} slot(s)`,
      );
    }

    const deactivated = await AdSlot.updateMany(
      { key: { $in: OBSOLETE_KEYS }, isActive: true },
      { $set: { isActive: false } },
    );
    if (deactivated.modifiedCount) {
      console.log(
        `Deactivated ${deactivated.modifiedCount} obsolete slot(s): ${OBSOLETE_KEYS.join(", ")}`,
      );
    }

    console.log("Ad slot seeding completed");
    process.exit(0);
  } catch (err) {
    console.error("Ad slot seed error:", err.message);
    process.exit(1);
  }
};

seedAdSlots();
