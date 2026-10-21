const mongoose = require("mongoose");
const dotenv = require("dotenv");
const AdSlot = require("../models/AdSlot");
const User = require("../models/User");

dotenv.config();

// The fixed reader-site positions agreed with the frontend. Keys are the
// contract: the site requests /public/ads?slot=<key>.
const DEFAULT_SLOTS = [
  { name: "Hero Leaderboard", key: "hero_leaderboard", section: "hero", width: 970, height: 250, position: 0 },
  { name: "Sidebar Rectangle", key: "sidebar_rectangle", section: "sidebar", width: 300, height: 250, position: 0 },
  { name: "In-Article Middle", key: "in_article_middle", section: "article", width: 300, height: 250, position: 0 },
  { name: "Mobile Header", key: "mobile_header", section: "mobile", width: 320, height: 50, position: 0 },
  { name: "Footer Banner", key: "footer_banner", section: "footer", width: 728, height: 90, position: 0 },
  { name: "Category Page Top", key: "category_top", section: "category", width: 468, height: 60, position: 0 },
  { name: "Skyscraper", key: "sidebar_skyscraper", section: "sidebar", width: 160, height: 600, position: 1 },
  { name: "Sticky Bottom", key: "sticky_bottom", section: "mobile", width: 320, height: 50, position: 1 },
];

const seedAdSlots = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for ad slot seeding");

    const adminEmail = process.env.ADMIN_EMAIL;
    const admin = adminEmail ? await User.findOne({ email: adminEmail.toLowerCase() }) : null;
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

    console.log("Ad slot seeding completed");
    process.exit(0);
  } catch (err) {
    console.error("Ad slot seed error:", err.message);
    process.exit(1);
  }
};

seedAdSlots();
