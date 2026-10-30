const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("../models/Category");

dotenv.config();

// Keep these slugs aligned with the Hindi website's category route mapping.
// Video, shorts, and gallery are navigation entries too, so they are managed
// alongside the article categories in the Admin panel.
const defaultCategories = [
  { name: "ताज़ा-खबरें", slug: "ताज़ा-खबरें", order: 1 },
  { name: "राजनीति", slug: "राजनीति", order: 2 },
  { name: "मौसम", slug: "मौसम", order: 3 },
  { name: "व्यापार", slug: "व्यापार", order: 4 },
  { name: "खेल", slug: "खेल", order: 5 },
  { name: "मनोरंजन", slug: "मनोरंजन", order: 6 },
  { name: "तकनीक", slug: "तकनीक", order: 7 },
  { name: "स्वास्थ्य", slug: "स्वास्थ्य", order: 8 },
  { name: "शिक्षा", slug: "शिक्षा", order: 9 },
  { name: "विचार", slug: "विचार", order: 10 },
  { name: "संपादकीय", slug: "संपादकीय", order: 11 },
  { name: "वीडियो", slug: "वीडियो", order: 12 },
  { name: "शॉर्ट्स", slug: "शॉर्ट्स", order: 13 },
  { name: "गैलरी", slug: "गैलरी", order: 14 },
];

async function seedDefaultCategories() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Check all names before writing so a duplicate name cannot leave a
    // partially seeded navigation set.
    for (const item of defaultCategories) {
      const nameOwner = await Category.findOne({ name: item.name }).lean();
      if (nameOwner && ![item.slug, item.legacySlug].includes(nameOwner.slug)) {
        throw new Error(
          `Cannot seed ${item.slug}: category name "${item.name}" is already used by slug "${nameOwner.slug}"`,
        );
      }
    }

    for (const item of defaultCategories) {
      const existing = await Category.findOne({
        $or: [{ slug: item.slug }, { slug: item.legacySlug }],
      }).select("_id");

      await Category.findOneAndUpdate(
        existing ? { _id: existing._id } : { slug: item.slug },
        {
          $set: {
            name: item.name,
            isActive: true,
            parent: null,
            order: item.order,
          },
          $setOnInsert: { slug: item.slug, description: "" },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );
    }

    console.log(
      `Seeded ${defaultCategories.length} default Hindi navigation categories`,
    );
  } catch (error) {
    console.error("Default category seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDefaultCategories();
